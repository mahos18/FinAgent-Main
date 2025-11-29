export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  avatar?: string;
  occupation?: 'employed' | 'freelancer' | 'student' | 'other';
  monthlyIncome?: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  merchant: string;
  date: string;
  category: string;
  source: 'manual' | 'sms_mock' | 'csv' | 'bank_sync';
  description?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface Message {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ConversationMessage {
  id: number;
  user_id: number;
  sender: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  linked: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterResponse {
  email: string;
  name: string;
  id: number;
  is_active: boolean;
}