import { createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../../services/api';
import { tokenStorage } from '../../../services/tokenStorage';
import { loginStart, loginSuccess, loginFailure, logout } from '../slices/authSlice';
import { fetchTransactions } from './tranasctionThunks';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    credentials: { name: string; email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(loginStart());
      
      // Step 1: Register user
      const registerData = await authAPI.register(
        credentials.name,
        credentials.email,
        credentials.password
      );
      
      // Step 2: Automatically login after registration
      const loginData = await authAPI.login(credentials.email, credentials.password);
      
      // Store tokens
      await tokenStorage.setToken(loginData.access_token);
      await tokenStorage.setRefreshToken(loginData.refresh_token);

      // Get user data
      const userData = await authAPI.getCurrentUser();

      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_active: userData.is_active,
        occupation: userData.occupation,
        monthlyIncome: userData.monthlyIncome,
      };

      dispatch(loginSuccess({ user, token: loginData.access_token }));
      
      // Fetch transactions after login
      dispatch(fetchTransactions());
      
      return { user, token: loginData.access_token };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      dispatch(loginFailure(message));
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      
      // Step 1: Login to get tokens
      const loginData = await authAPI.login(credentials.email, credentials.password);
      
      // Store tokens
      await tokenStorage.setToken(loginData.access_token);
      await tokenStorage.setRefreshToken(loginData.refresh_token);

      // Step 2: Get user data
      const userData = await authAPI.getCurrentUser();

      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_active: userData.is_active,
        occupation: userData.occupation,
        monthlyIncome: userData.monthlyIncome,
      };

      dispatch(loginSuccess({ user, token: loginData.access_token }));
      
      // Step 3: Fetch all transactions
      console.log('Fetching user transactions...');
      dispatch(fetchTransactions());

      return { user, token: loginData.access_token };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(message));
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await authAPI.logout();
    dispatch(logout());
  } catch (error) {
    console.error('Logout error:', error);
    dispatch(logout());
  }
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('Getting token from storage...');
      const token = await tokenStorage.getToken();
      
      if (!token) {
        console.log('No token found in storage');
        return rejectWithValue('No token found');
      }

      console.log('Token found, verifying with backend...');
      
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      const apiCall = authAPI.getCurrentUser();

      // Race between API call and timeout
      const userData = await Promise.race([apiCall, timeoutPromise]) as any;
      
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_active: userData.is_active,
        occupation: userData.occupation,
        monthlyIncome: userData.monthlyIncome,
      };

      console.log('User verified:', user);
      dispatch(loginSuccess({ user, token }));
      
      // Fetch transactions after successful auth check
      console.log('Fetching user transactions...');
      dispatch(fetchTransactions());

      return { user, token };
      
    } catch (error: any) {
      console.log('Auth verification failed:', error.message);
      
      // Clear tokens on any error
      await tokenStorage.clearTokens();
      dispatch(logout());
      
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    data: {
      name?: string;
      occupation?: 'employed' | 'freelancer' | 'student' | 'other';
      monthlyIncome?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      return updatedUser;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);