import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

const BASE_URL = 'http://10.0.2.2:8000'; // http://127.0.0.1:8000/ []web     Replace with your FastAPI backend URL
// For local development: 'http://192.168.1.x:8000' or 'http://10.0.2.2:8000' for Android emulator

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token, logout user
          await tokenStorage.clearTokens();
          processQueue(new Error('No refresh token'), null);
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store new tokens
        await tokenStorage.setToken(access_token);
        if (newRefreshToken) {
          await tokenStorage.setRefreshToken(newRefreshToken);
        }

        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear tokens and force logout
        await tokenStorage.clearTokens();
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  async register(name: string, email: string, password: string) {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data; // Returns { email, name, id, is_active }
  },

  async login(email: string, password: string) {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data; // Returns { access_token, refresh_token, token_type }
  },

  async getCurrentUser() {
    const response = await apiClient.get('/users/me');
    return response.data; // Returns { email, name, id, is_active }
  },

  async updateProfile(data: {
    name?: string;
    occupation?: 'employed' | 'freelancer' | 'student' | 'other';
    monthlyIncome?: number;
  }) {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  async logout() {
    try {
      // If you have a logout endpoint
      // await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await tokenStorage.clearTokens();
    }
  },
};

export const advisorAPI = {
  async sendMessage(message: string) {
    const response = await apiClient.post('/advisor/message', { message });
    return response.data;
  },

  async getConversationHistory() {
    const response = await apiClient.get('/advisor/conversations');
    return response.data;
  },
};

// Transaction API calls
export const transactionAPI = {
  async getAll() {
    const response = await apiClient.get('/transactions');
    return response.data; // Returns array of transactions
  },

  async create(transaction: {
    amount: number;
    type: string;
    merchant: string;
    category: string;
    date: string;
    source: 'manual' | 'sms_mock' | 'csv' | 'bank_sync';
    description?: string;
  }) {
    const response = await apiClient.post('/transactions', transaction);
    return response.data;
  },

  async update(id: number, transaction: Partial<{
    amount: number;
    type: string;
    merchant: string;
    category: string;
    date: string;
    source: string;
    description: string;
  }>) {
    const response = await apiClient.patch(`/transactions/${id}`, transaction);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },
  

  
};