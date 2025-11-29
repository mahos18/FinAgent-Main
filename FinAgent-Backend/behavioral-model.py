# Behavioral Spending Model — Analysis Only (Colab-ready)
# Paste this whole block into a Google Colab cell and run.
# - Upload an Excel (.xlsx/.xls) or CSV when prompted.
# - If you're not in Colab, set FILE_PATH to your local file path and run locally.

# -------------------------
# CONFIG
# -------------------------
FILE_PATH = None  # if running locally, set this to '/path/to/transactions.xlsx' (or leave None to use Colab upload)

# -------------------------
# Imports
# -------------------------
import io, json
from datetime import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display, Markdown

# -------------------------
# Helper functions
# -------------------------
def infer_columns(df):
    cols = {c.lower(): c for c in df.columns}
    mapping = {}
    for candidate in ['date','transaction_date','txn_date','timestamp']:
        if candidate in cols:
            mapping['date'] = cols[candidate]; break
    for candidate in ['amount','amt','value','transaction_amount','debit','credit']:
        if candidate in cols:
            mapping['amount'] = cols[candidate]; break
    for candidate in ['category','cat','expense_category','label']:
        if candidate in cols:
            mapping['category'] = cols[candidate]; break
    for candidate in ['merchant','vendor','payee','description','narration']:
        if candidate in cols:
            mapping['merchant'] = cols[candidate]; break
    for candidate in ['txn_type','type','transaction_type','debit_credit','debit/credit']:
        if candidate in cols:
            mapping['txn_type'] = cols[candidate]; break
    return mapping

def load_user_file(path_or_buffer):
    # Accepts path string or BytesIO buffer
    try:
        if isinstance(path_or_buffer, str) and path_or_buffer.lower().endswith('.csv'):
            df = pd.read_csv(path_or_buffer)
        elif isinstance(path_or_buffer, str):
            df = pd.read_excel(path_or_buffer)
        else:
            # assume buffer (BytesIO)
            df = pd.read_excel(path_or_buffer)
    except Exception as e:
        try:
            df = pd.read_csv(path_or_buffer)
        except Exception as e2:
            raise ValueError(f"Could not read file as Excel or CSV. Errors: {e}, {e2}")
    return df

def preprocess(df):
    df = df.copy()
    mapping = infer_columns(df)
    rename_map = {}
    if 'date' in mapping: rename_map[mapping['date']] = 'date'
    if 'amount' in mapping: rename_map[mapping['amount']] = 'amount'
    if 'category' in mapping: rename_map[mapping['category']] = 'category'
    if 'merchant' in mapping: rename_map[mapping['merchant']] = 'merchant'
    if 'txn_type' in mapping: rename_map[mapping['txn_type']] = 'txn_type'
    df = df.rename(columns=rename_map)

    if 'amount' not in df.columns:
        if 'credit' in df.columns and 'debit' in df.columns:
            df['amount'] = df['credit'].fillna(0) - df['debit'].fillna(0)
        else:
            raise ValueError('No amount column found. Include an amount column.')

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        if df['date'].isna().any():
            df['date'] = pd.to_datetime(df['date'].astype(str), infer_datetime_format=True, errors='coerce')
    else:
        raise ValueError('No date column found. Include a date/transaction_date column.')

    df = df[~df['date'].isna()]
    df = df[~df['amount'].isna()]
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

    if 'txn_type' in df.columns:
        df['txn_type'] = df['txn_type'].astype(str).str.lower()
        debit_mask = df['txn_type'].str.contains('debit') | df['txn_type'].str.contains('dr')
        df.loc[debit_mask, 'amount'] = -df.loc[debit_mask, 'amount'].abs()
        credit_mask = df['txn_type'].str.contains('credit') | df['txn_type'].str.contains('cr')
        df.loc[credit_mask, 'amount'] = df.loc[credit_mask, 'amount'].abs()

    # flow: 'out' = spending (negative amounts), 'in' = income/credit
    df['flow'] = df['amount'].apply(lambda x: 'out' if x < 0 else 'in')
    # spend absolute amount for analysis
    df['spend'] = df['amount'].abs()

    if 'category' not in df.columns:
        df['category'] = 'unknown'
    else:
        df['category'] = df['category'].fillna('unknown').astype(str)

    if 'merchant' not in df.columns:
        df['merchant'] = df.get('description', df.get('narration', pd.Series(['unknown']*len(df))))
    df['merchant'] = df['merchant'].fillna('unknown').astype(str)

    df['date_only'] = df['date'].dt.date
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['month_name'] = df['date'].dt.strftime('%Y-%m')
    df['quarter'] = df['date'].dt.to_period('Q').astype(str)
    df['week'] = df['date'].dt.to_period('W').apply(lambda r: r.start_time.date())
    df['day_of_week'] = df['date'].dt.day_name()
    df['hour'] = df['date'].dt.hour.fillna(-1).astype(int)
    df['category'] = df['category'].str.strip().str.title()
    return df

def aggregate_timeframes(df):
    out = {}
    spends = df[df['flow']=='out'].copy()
    out['daily'] = spends.groupby('date_only').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index()
    out['weekly'] = spends.groupby('week').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index().rename(columns={'week':'period'})
    out['monthly'] = spends.groupby('month_name').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index().rename(columns={'month_name':'period'})
    out['quarterly'] = spends.groupby('quarter').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index().rename(columns={'quarter':'period'})
    out['yearly'] = spends.groupby('year').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index().rename(columns={'year':'period'})
    return out

def category_stats(df, timeframe='overall'):
    spends = df[df['flow']=='out'].copy()
    if timeframe == 'overall':
        cat = spends.groupby('category').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index().sort_values('total_spend', ascending=False)
        cat['share_pct'] = 100*cat['total_spend']/cat['total_spend'].sum()
        return cat
    else:
        periods = {}
        for period, g in spends.groupby(timeframe):
            cat = g.groupby('category').agg(total_spend=('spend','sum'), txn_count=('spend','count'), avg_txn=('spend','mean')).reset_index().sort_values('total_spend', ascending=False)
            cat['share_pct'] = 100*cat['total_spend']/cat['total_spend'].sum()
            periods[period] = cat
        return periods

def detect_patterns(df):
    spends = df[df['flow']=='out'].copy()
    patterns = {}
    weekend = spends[spends['day_of_week'].isin(['Saturday','Sunday'])]['spend'].mean()
    weekday = spends[~spends['day_of_week'].isin(['Saturday','Sunday'])]['spend'].mean()
    patterns['weekend_avg'] = float(np.nan_to_num(weekend))
    patterns['weekday_avg'] = float(np.nan_to_num(weekday))
    patterns['weekend_spike'] = bool(weekend > weekday)
    by_month = spends.copy(); by_month['day'] = by_month['date'].dt.day
    m_summary = {}
    for m,g in by_month.groupby('month_name'):
        start_avg = g[g['day']<=3]['spend'].mean() if not g[g['day']<=3].empty else 0
        end_avg = g[g['day']>= (g['day'].max()-2)]['spend'].mean() if not g[g['day']>= (g['day'].max()-2)].empty else 0
        m_summary[m] = {'start_avg': float(np.nan_to_num(start_avg)), 'end_avg': float(np.nan_to_num(end_avg))}
    patterns['month_start_end'] = m_summary
    top_merchants = spends.groupby('merchant').agg(total_spend=('spend','sum'), txn_count=('spend','count')).reset_index().sort_values('txn_count', ascending=False).head(10)
    patterns['top_merchants'] = top_merchants.to_dict(orient='records')
    return patterns

def behavior_score(df):
    spends = df[df['flow']=='out'].copy()
    monthly = spends.groupby('month_name')['spend'].sum().sort_index()
    if len(monthly) < 2:
        return {'final_score':50, 'explanation':'Need at least 2 months of data.'}
    m_mean = monthly.mean(); m_std = monthly.std(ddof=0)
    monthly_stability = max(0, 1 - (m_std / (m_mean+1e-9)))
    monthly_stability_score = np.clip(monthly_stability * 100, 0, 100)
    quarterly = spends.groupby('quarter')['spend'].sum().sort_index()
    if len(quarterly) < 2:
        quarterly_consistency_score = 50
    else:
        q_mean = quarterly.mean(); q_std = quarterly.std(ddof=0)
        quarterly_consistency = max(0, 1 - (q_std / (q_mean+1e-9)))
        quarterly_consistency_score = np.clip(quarterly_consistency * 100, 0, 100)
    cat = spends.groupby('category')['spend'].sum()
    shares = (cat / cat.sum()).values if len(cat)>0 else np.array([1.0])
    concentration = np.sum(shares**2)
    concentration_score = (1 - abs(concentration - 1/len(shares))) if len(shares)>0 else 0.5
    concentration_score = np.clip(concentration_score * 100, 0, 100)
    threshold = monthly.mean() + 1.25*monthly.std(ddof=0)
    overspend_months = (monthly > threshold).sum()
    overspend_pct = overspend_months / len(monthly)
    overspend_score = max(0, 1 - overspend_pct) * 100
    final = (0.4 * monthly_stability_score + 0.3 * quarterly_consistency_score + 0.2 * concentration_score + 0.1 * overspend_score)
    final = float(np.clip(final, 0, 100))
    explanation = {
        'monthly_stability_score': float(monthly_stability_score),
        'quarterly_consistency_score': float(quarterly_consistency_score),
        'category_concentration_score': float(concentration_score),
        'overspend_score': float(overspend_score),
        'final_score': final
    }
    return explanation

def persona_label(score):
    s = score if isinstance(score, (int,float)) else score.get('final_score',50)
    if s >= 80: return 'Disciplined & Stable'
    elif s >= 60: return 'Moderate Spender'
    elif s >= 40: return 'Unstable / Risky Patterns'
    else: return 'Impulsive / High-risk'

def plot_time_series(df, period_col, value_col, title):
    plt.figure(figsize=(10,4))
    x = df[period_col].astype(str)
    y = df[value_col]
    plt.plot(x, y, marker='o')
    plt.xticks(rotation=45)
    plt.title(title)
    plt.tight_layout()
    plt.grid(alpha=0.25)
    plt.show()

# -------------------------
# Runner
# -------------------------
def run_analysis():
    print('Behavioral Spending Model — Analysis Only')
    # Load data: Colab upload preferred, else FILE_PATH fallback
    df = None
    if FILE_PATH is None:
        try:
            from google.colab import files
            uploaded = files.upload()
            first = list(uploaded.keys())[0]
            print('Loaded file:', first)
            df = load_user_file(io.BytesIO(uploaded[first]))
        except Exception:
            # not in Colab or upload canceled
            raise RuntimeError("Colab upload failed. To run locally set FILE_PATH to your file path or run inside Colab and upload the file.")
    else:
        df = load_user_file(FILE_PATH)

    print('Raw preview:')
    display(df.head(6))

    print('Preprocessing...')
    dfp = preprocess(df)
    display(Markdown('**Preprocessed sample**'))
    display(dfp.head(10))

    print('Aggregating timeframes (focus: monthly & quarterly)...')
    agg = aggregate_timeframes(dfp)
    display(Markdown('**Monthly aggregation**'))
    display(agg['monthly'])
    display(Markdown('**Quarterly aggregation**'))
    display(agg['quarterly'])

    print('\nTop categories overall:')
    overall_cat = category_stats(dfp, timeframe='overall')
    display(overall_cat.head(20))

    print('\nDetecting patterns...')
    patterns = detect_patterns(dfp)
    print('Weekend avg spend:', patterns['weekend_avg'])
    print('Weekday avg spend:', patterns['weekday_avg'])
    print('Weekend spike (weekend > weekday):', patterns['weekend_spike'])
    print('Top merchants by frequency:')
    display(pd.DataFrame(patterns['top_merchants']))

    print('\nBehavior scoring...')
    score_expl = behavior_score(dfp)
    final_score = score_expl['final_score'] if isinstance(score_expl, dict) else score_expl
    print('Final behavior score:', final_score)
    print('Persona label:', persona_label(score_expl))
    display(Markdown('**Score breakdown**'))
    display(Markdown('```' + json.dumps(score_expl, indent=2) + '```'))

    print('\nPlotting monthly & quarterly spend series:')
    try:
        plot_time_series(agg['monthly'], 'period', 'total_spend', 'Monthly Total Spend')
        plot_time_series(agg['quarterly'], 'period', 'total_spend', 'Quarterly Total Spend')
    except Exception as e:
        print('Plotting error:', e)

    print('\nDone. If you want additional visuals (category heatmap, merchant timeline), or automatic merchant->category mapping, tell me and I will add them. 😊')

# Run
if __name__ == '__main__':
    run_analysis()
