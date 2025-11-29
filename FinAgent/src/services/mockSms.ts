import { Transaction } from '../types';

export interface MockSms {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export const mockSmsData: MockSms[] = [
  {
    id: 'sms1',
    sender: 'HDFC Bank',
    message: 'Rs. 1,250.00 debited from A/C XX1234 on 20-Nov-25 at Starbucks Coffee. Avl Bal: Rs. 45,320.50',
    timestamp: '2025-11-20T10:30:00Z',
  },
  {
    id: 'sms2',
    sender: 'ICICI Bank',
    message: 'Rs. 5,000.00 credited to A/C XX5678 by NEFT on 19-Nov-25. Info: Salary Transfer. Avl Bal: Rs. 50,570.50',
    timestamp: '2025-11-19T09:15:00Z',
  },
  {
    id: 'sms3',
    sender: 'SBI',
    message: 'INR 850.00 debited from A/C XX9012 on 18-Nov-25 at Swiggy. Available Balance: INR 49,720.50',
    timestamp: '2025-11-18T19:45:00Z',
  },
  {
    id: 'sms4',
    sender: 'AXIS Bank',
    message: 'Rs. 2,300.00 spent on Card XX3456 at Amazon on 17-Nov-25. Total Outstanding: Rs. 15,230.00',
    timestamp: '2025-11-17T14:20:00Z',
  },
  {
    id: 'sms5',
    sender: 'Paytm',
    message: 'Rs. 500.00 added to Paytm Wallet via UPI. Balance: Rs. 1,245.00',
    timestamp: '2025-11-16T11:00:00Z',
  },
  {
    id: 'sms6',
    sender: 'HDFC Bank',
    message: 'Rs. 12,000.00 credited to A/C XX1234 on 15-Nov-25. Info: Freelance Payment. Avl Bal: Rs. 58,320.50',
    timestamp: '2025-11-15T16:30:00Z',
  },
  {
    id: 'sms7',
    sender: 'PhonePe',
    message: 'You paid Rs. 350.00 to Uber via UPI on 14-Nov-25. UPI Ref: 123456789',
    timestamp: '2025-11-14T08:45:00Z',
  },
  {
    id: 'sms8',
    sender: 'ICICI Bank',
    message: 'Rs. 4,500.00 debited from A/C XX5678 on 13-Nov-25 for Electricity Bill Payment. Avl Bal: Rs. 54,070.50',
    timestamp: '2025-11-13T12:10:00Z',
  },
];

export function parseSmsToTransaction(sms: MockSms): Transaction {
  const amountMatch = sms.message.match(/Rs\.?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  const isCredit =
    sms.message.toLowerCase().includes('credited') ||
    sms.message.toLowerCase().includes('added') ||
    sms.message.toLowerCase().includes('received');

  const merchantMatch = sms.message.match(/at\s+([A-Za-z\s]+?)(?:\.|on|Avl|Available|Total|UPI)/i);
  let merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown';

  if (merchant === 'Unknown') {
    const toMatch = sms.message.match(/to\s+([A-Za-z\s]+?)(?:\s+via|on|UPI)/i);
    merchant = toMatch ? toMatch[1].trim() : sms.sender;
  }

  const category = inferCategory(merchant, isCredit);

  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    type: isCredit ? 'income' : 'expense',
    merchant,
    date: sms.timestamp,
    category,
    source: 'sms_mock',
    description: sms.message,
  };
}

function inferCategory(merchant: string, isIncome: boolean): string {
  if (isIncome) return 'Income';

  const lower = merchant.toLowerCase();
  if (lower.includes('starbucks') || lower.includes('cafe') || lower.includes('restaurant')) return 'Food & Dining';
  if (lower.includes('amazon') || lower.includes('flipkart') || lower.includes('shopping')) return 'Shopping';
  if (lower.includes('uber') || lower.includes('ola') || lower.includes('transport')) return 'Transport';
  if (lower.includes('swiggy') || lower.includes('zomato')) return 'Food Delivery';
  if (lower.includes('electricity') || lower.includes('water') || lower.includes('bill')) return 'Bills & Utilities';
  if (lower.includes('paytm') || lower.includes('wallet')) return 'Wallet';

  return 'Others';
}