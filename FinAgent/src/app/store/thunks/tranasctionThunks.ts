import { createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction } from '../../../types';
import { transactionAPI } from '../../../services/api';
import { setTransactions, addTransaction, setLoading, setError } from '../slices/transactionsSlice';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const transactions = await transactionAPI.getAll();
      dispatch(setTransactions(transactions));
      dispatch(setLoading(false));
      return transactions;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch transactions';
      dispatch(setError(message));
      dispatch(setLoading(false));
      return rejectWithValue(message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (
    transaction: {
      amount: number;
      type: string;
      merchant: string;
      category: string;
      date: string;
      source: 'manual' | 'sms_mock' | 'csv' | 'bank_sync';
      description?: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const newTransaction = await transactionAPI.create(transaction);
      dispatch(addTransaction(newTransaction));
      dispatch(setLoading(false));
      return newTransaction;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create transaction';
      dispatch(setError(message));
      dispatch(setLoading(false));
      return rejectWithValue(message);
    }
  }
);

export const deleteTransactionById = createAsyncThunk(
  'transactions/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await transactionAPI.delete(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete transaction';
      return rejectWithValue(message);
    }
  }
);