import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Budget } from '../../../types';

interface BudgetState {
  budgets: Budget[];
  totalBudget: number;
  totalSpent: number;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  totalBudget: 0,
  totalSpent: 0,
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.totalBudget = action.payload.reduce((sum, b) => sum + b.limit, 0);
      state.totalSpent = action.payload.reduce((sum, b) => sum + b.spent, 0);
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
      state.totalBudget += action.payload.limit;
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        const oldLimit = state.budgets[index].limit;
        state.budgets[index] = action.payload;
        state.totalBudget = state.totalBudget - oldLimit + action.payload.limit;
      }
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      const budget = state.budgets.find((b) => b.id === action.payload);
      if (budget) {
        state.totalBudget -= budget.limit;
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBudgets, addBudget, updateBudget, deleteBudget, setLoading, setError } = budgetSlice.actions;
export default budgetSlice.reducer;