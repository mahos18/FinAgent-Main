import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account } from '../../../types';

interface ProfileState {
  accounts: Account[];
  notificationsEnabled: boolean;
  biometricsEnabled: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  accounts: [],
  notificationsEnabled: true,
  biometricsEnabled: false,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleBiometrics: (state) => {
      state.biometricsEnabled = !state.biometricsEnabled;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAccounts, addAccount, toggleNotifications, toggleBiometrics, setLoading, setError } =
  profileSlice.actions;
export default profileSlice.reducer;