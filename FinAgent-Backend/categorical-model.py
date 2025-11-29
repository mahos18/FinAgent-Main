# improved merchant-first categorizer with merchant-keyword inference + null fields
import re
import joblib
import pandas as pd
from datetime import datetime
import dateutil.parser as dp

# -------------------------
# Precompiled regexes (module-level for speed)
# -------------------------
AMOUNT_RE = re.compile(r"(?:INR|Rs\.?|Rs|₹)?\s*([0-9]{1,3}(?:[,\s][0-9]{3})*(?:\.[0-9]+)?)", flags=re.IGNORECASE)
ALT_AMOUNT_RE = re.compile(r"([0-9]{1,3}(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?)")
MERCHANT_CONTEXT_RE = re.compile(r'\b(?:to|at|via|through|for|by|on|towards|paid to)\s+([A-Za-z0-9&\._\-\' ]{3,80})', flags=re.IGNORECASE)
UPPER_TOKEN_RE = re.compile(r'\b([A-Z]{3,20})\b')
BANK_KEYWORD_RE = re.compile(r'\b(upi|neft|imps|rtgs|debited|credited|balance|a/c|account|salary|withdrawal|atm)\b', flags=re.IGNORECASE)

# tokens we should not treat as merchants
MERCHANT_STOPWORDS = set([
    'inr','rs','rupess','rupee','upi','neft','imps','rtgs','atm','at','via','vpa','payment','credited','debited','transaction','txn','order','orderid'
])

# small helper to normalize merchant strings
def _clean_merchant_text(txt):
    if not txt:
        return None
    s = re.sub(r'\s+', ' ', txt)                # normalize whitespace
    s = re.sub(r'order id[:\s]*\w+', '', s, flags=re.IGNORECASE)  # drop order ids
    s = re.sub(r'for movie tickets', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\b(thanks|thank you|completed|successful|payment)\b', '', s, flags=re.IGNORECASE)
    s = re.sub(r'[^\w\s&\.\-\'/]', ' ', s)      # remove stray punctuation (keep &, ., - ' /)
    s = s.strip(' .,-_')
    if not s:
        return None
    return s

# -------------------------
# Amount extraction
# -------------------------
def extract_amount(text):
    s = str(text)
    m = AMOUNT_RE.search(s)
    if m:
        num = m.group(1).replace(',', '').replace(' ', '')
        try:
            return float(num)
        except:
            pass
    # fallback: any plausible numbers (choose largest)
    m3 = ALT_AMOUNT_RE.findall(s)
    cand = []
    for x in m3:
        nx = x.replace(',', '').replace(' ', '')
        try:
            cand.append(float(nx))
        except:
            try:
                cand.append(float(nx.replace(',', '.')))
            except:
                pass
    return max(cand) if cand else None

# -------------------------
# Transaction type (debit/credit)
# -------------------------
def classify_txn_type(text):
    s = str(text).lower()
    debit_patterns = [r'\bdebited\b', r'\bwithdrawn\b', r'\bpayment to\b', r'\bpayment of\b', r'\bupi payment\b', r'\bsent to\b', r'\bspent\b', r'\bpaid\b']
    credit_patterns = [r'\bcredited\b', r'\bdeposit\b', r'\bcashback\b', r'\brefund\b', r'\breceived\b', r'\bsalary\b']
    for p in debit_patterns:
        if re.search(p, s):
            return 'debit'
    for p in credit_patterns:
        if re.search(p, s):
            return 'credit'
    if 'debited' in s and 'credited' in s:
        return 'debit'
    return None

# -------------------------
# Date extraction
# -------------------------
def extract_date(text):
    s = str(text)
    # try common explicit patterns first
    patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}\b',
        r'\b[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}\b',
        r'\b\d{1,2}[A-Za-z]{3}\d{2,4}\b'
    ]
    for pat in patterns:
        m = re.search(pat, s)
        if m:
            tok = m.group(0)
            try:
                return pd.to_datetime(dp.parse(tok, dayfirst=True))
            except:
                pass
    # fuzzy parse (may return year=1900 if no year present)
    try:
        parsed = dp.parse(s, dayfirst=True, fuzzy=True)
        return pd.to_datetime(parsed)
    except:
        return None

# -------------------------
# Merchant extraction (improved)
# -------------------------
def extract_merchant(text):
    s = str(text)
    # 1) context-based capture (to/at/via/through/for/by/paid to/on/towards)
    m = MERCHANT_CONTEXT_RE.search(s)
    if m:
        cand = m.group(1).strip()
        cand = re.sub(r'\b(upi|imps|neft|rtgs|credited|debited|payment|txn|transaction|vpa|via|order id)\b', '', cand, flags=re.IGNORECASE).strip()
        cand = _clean_merchant_text(cand)
        if cand:
            # ignore if the cleaned token is in stoplist
            if cand.lower() in MERCHANT_STOPWORDS:
                return None
            return cand.title()
    # 2) uppercase token fallback but filter stopwords and currency tokens
    m2 = UPPER_TOKEN_RE.findall(s)
    if m2:
        for token in m2:
            t = token.strip().lower()
            if t in MERCHANT_STOPWORDS:
                continue
            if len(t) <= 2:
                continue
            # avoid returning 'INR' or 'RS' etc
            if t in ('inr','rs','rs.','rupee','rupees'):
                continue
            return token.title()
    return None

# -------------------------
# Merchant -> category mapping (highest priority)
# -------------------------
merchant_map = {
    'swiggy': 'food',
    'zomato': 'food',
    'ubereats': 'food',
    'dominos': 'food',
    'pizza hut': 'food',
    'subway': 'food',
    'cafe coffee day': 'food',
    'ola': 'travel',
    'uber': 'travel',
    'rapido': 'travel',
    'bigbasket': 'grocery',
    'dmart': 'grocery',
    'grofers': 'grocery',
    'kirana': 'grocery',
    'paypal': 'bank',
    'google pay': 'bank',
    'gpay': 'bank',
    'phonepe': 'bank',
    'paytm': 'bank',
    'atm': 'bank',
    'reliance jio': 'utilities',
    'airtel': 'utilities',
    'bsnl': 'utilities',
    'jiofiber': 'utilities',
    'netflix': 'entertainment',
    'spotify': 'entertainment',
    'hotstar': 'entertainment',
    'bookmyshow': 'entertainment',
    'pvr': 'entertainment',
    'amazon': 'shopping',
    'flipkart': 'shopping',
    'myntra': 'shopping',
    'ajio': 'shopping'
}

# -------------------------
# Keyword-based fallback categories (keeps earlier lists)
# -------------------------
keyword_categories = {
    'food': ['swiggy','zomato','ubereats','restaurant','dominos','pizza','dine','subway','cafe','canteen','meals'],
    'grocery': ['grocery','bigbasket','dmart','grocer','supermarket','kirana','grofers','kirana'],
    'bank': ['upi','neft','imps','rtgs','transfer','credited','debited','balance','a/c','account','salary','withdrawal','atm'],
    'rent': ['rent','landlord','house rent'],
    'salary': ['salary','payroll','salary credited','ctc','employer'],
    'travel': ['ola','uber','taxi','auto','cab','flight','train','railway','bus','booking','ride'],
    'entertainment': ['netflix','prime video','spotify','cinema','movie','theatre','bookmyshow','pvr'],
    'utilities': ['electricity','water bill','bill payment','broadband','mobile recharge','electric','gas bill','jiofiber','airtel'],
    'shopping': ['amazon','flipkart','myntra','ajio','purchase','order id','order at']
}

def rule_category(text):
    s = str(text).lower()
    merchant_raw = extract_merchant(text)
    merchant = merchant_raw.lower() if merchant_raw else ''
    # 1) Merchant priority: try direct/substring mapping and keyword inference from merchant string
    if merchant:
        # direct/substring match against merchant_map keys
        for k in merchant_map:
            if k in merchant:
                return merchant_map[k]
        # try keyword inference by searching merchant words against keyword_categories
        for cat, kws in keyword_categories.items():
            for kw in kws:
                if kw in merchant:
                    return cat
        # also try using message-level keywords as last resort later
    # 2) Keyword-based categories on whole message
    for cat, kws in keyword_categories.items():
        for kw in kws:
            if kw in s:
                return cat
    # 3) Bank-like detect (lowest priority)
    if BANK_KEYWORD_RE.search(s):
        return 'bank'
    return 'other'

# -------------------------
# Load optional ML model (keeps previous behavior)
# -------------------------
MODEL_PATH = '/content/categorization_model.pkl'
try:
    model = joblib.load(MODEL_PATH)
    has_model = True
    print("Loaded trained model:", MODEL_PATH)
except Exception:
    model = None
    has_model = False
    print("No trained model found; using rule-based category fallback.")

# -------------------------
# 50 realistic test messages (same as before)
# -------------------------
TEST_MESSAGES = [
    "INR 349.00 debited for payment to Swiggy via UPI.",
    "₹525.50 spent at Zomato on 21/11/2025. Enjoy your meal!",
    "Rs.799 paid to Dominos Pizza via UPI transaction.",
    "Payment of ₹260 made to Café Coffee Day through UPI.",
    "Your account has been debited by Rs 185 for an order at Subway.",
    "Rs 245 paid to Ola Cabs for your ride on 20-Nov-25.",
    "INR 312 debited for UPI payment to Uber.",
    "₹89.00 paid to Rapido Bike Taxi.",
    "Rs 40 deducted for Mumbai Metro smart card recharge.",
    "INR 155 paid to Auto Rickshaw via UPI.",
    "INR 1,045.00 spent at DMart store.",
    "₹650 debited for payment to BigBasket.",
    "Rs 399 paid to Grofers India Pvt Ltd.",
    "Your UPI transaction of ₹899 to DMart has been completed.",
    "₹249.50 spent at Local Kirana Store via UPI.",
    "INR 5,000 debited from your account via ATM withdrawal.",
    "₹1,500 transferred to Rahul Sharma via UPI.",
    "Rs 20,000 credited to your account via NEFT.",
    "UPI: Payment of ₹350 sent to @oksbi using GPay.",
    "PhonePe: You received ₹120 from Rakesh.",
    "Salary of ₹52,500 credited from INFOTECH LTD for Nov 2025.",
    "INR 47,000 has been deposited as monthly salary.",
    "Your salary ₹62,300 has been credited.",
    "₹1,299 debited for order at Amazon.",
    "Rs 2,499 spent at Flipkart Order ID 8347387.",
    "INR 799 payment made to Myntra through UPI.",
    "₹559.00 paid to Ajio Online.",
    "Amazon Pay: ₹349 has been auto-debited for subscription.",
    "₹499 debited towards Netflix monthly subscription.",
    "INR 119 paid to Spotify via UPI.",
    "Rs 299 charged for Hotstar Premium renewal.",
    "Payment of ₹850 to BookMyShow for movie tickets.",
    "₹150 spent at PVR Cinemas.",
    "₹780 debited for BEST electricity bill.",
    "INR 320 paid for water bill online.",
    "Rs 650 paid to JioFiber broadband.",
    "₹199 mobile recharge for Airtel completed.",
    "Gas Cylinder booking payment of ₹950 successful.",
    "₹12,500 transferred to Landlord via UPI for house rent.",
    "Rent payment of Rs 10,000 sent to Suresh Patil.",
    "INR 15,000 debited for flat maintenance fee.",
    "Refund of ₹179 credited to your account from Zomato.",
    "Cashback of ₹25 received via PhonePe.",
    "Amazon: Refund of ₹899 processed to your account.",
    "₹520 spent at HP Petrol Pump.",
    "INR 299 paid to Shell Fuel Station.",
    "₹150 debited for bike parking charges.",
    "₹3,500 paid to Udemy Online Courses.",
    "INR 2,200 paid as school fees to ABC School.",
    "UPI payment of ₹999 made to Unknown Merchant."
]

# -------------------------
# Analyze a single message (returns dict with None for missing)
# -------------------------
def analyze_message(msg):
    amount = extract_amount(msg)
    txn_type = classify_txn_type(msg)
    date = extract_date(msg)
    # normalize date to None
    date_out = None if date is None or pd.isna(date) else pd.to_datetime(date)
    merchant = extract_merchant(msg)  # may be None

    # merchant-first predicted category (enhanced)
    predicted = None
    if merchant:
        low_merchant = merchant.lower()
        # 1) try direct/substring merchant_map
        for k in merchant_map:
            if k in low_merchant:
                predicted = merchant_map[k]
                break
        # 2) try keyword inference inside merchant text
        if predicted is None:
            for cat, kws in keyword_categories.items():
                for kw in kws:
                    if kw in low_merchant:
                        predicted = cat
                        break
                if predicted:
                    break

    # 3) fallback: prefer ML model if available, else rule-based category
    if predicted is None:
        if has_model:
            try:
                predicted = model.predict([msg])[0]
            except Exception:
                predicted = rule_category(msg)
        else:
            predicted = rule_category(msg)

    return {
        'message': msg,
        'amount': amount if amount is not None else None,
        'txn_type': txn_type if txn_type is not None else None,
        'date': date_out,
        'merchant': merchant if merchant is not None else None,
        'predicted_category': predicted
    }

# -------------------------
# Batch process and display
# -------------------------
records = [analyze_message(m) for m in TEST_MESSAGES]
df = pd.DataFrame.from_records(records, columns=['message','amount','txn_type','date','merchant','predicted_category'])

# human-friendly print (show 'null' for None/NaT)
print_df = df.copy().fillna('null').replace({pd.NaT: 'null'})
pd.set_option('display.max_colwidth', 120)
print(print_df.to_string(index=False))

print("\nCategory counts:")
print(df['predicted_category'].value_counts(dropna=False))