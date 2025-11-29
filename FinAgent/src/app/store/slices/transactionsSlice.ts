import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../../types';
import { logout } from './authSlice';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'income' | 'expense';
  searchQuery: string;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all',
  searchQuery: '',
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.unshift(action.payload);
    },
    addManyTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = [...action.payload, ...state.items];
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setFilter: (state, action: PayloadAction<'all' | 'income' | 'expense'>) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearTransactions: (state) => {
      state.items = [];
      state.filter = 'all';
      state.searchQuery = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Clear transactions when user logs out
    builder.addCase(logout, (state) => {
      state.items = [];
      state.filter = 'all';
      state.searchQuery = '';
      state.error = null;
      state.loading = false;
    });
  },
});

export const {
  setTransactions,
  addTransaction,
  addManyTransactions,
  updateTransaction,
  deleteTransaction,
  setFilter,
  setSearchQuery,
  setLoading,
  setError,
  clearTransactions,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;