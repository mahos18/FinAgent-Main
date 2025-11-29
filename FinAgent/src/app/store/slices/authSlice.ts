// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { User } from '../../../types';
// import { updateUserProfile } from '../thunks/authThunks';

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
//       state.loading = false;
//       state.isAuthenticated = true;
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.error = null;
//     },
//     loginFailure: (state, action: PayloadAction<string>) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.error = null;
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(updateUserProfile.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateUserProfile.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.user) {
//           state.user = { ...state.user, ...action.payload };
//         }
//       })
//       .addCase(updateUserProfile.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
// export default authSlice.reducer;

// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../types';
import { authAPI } from '../../../services/api';
import { tokenStorage } from '../../../services/tokenStorage';

/**
 * NOTE: We define thunks here (same file) to avoid circular imports.
 * Thunks are declared BEFORE the slice so builder.addCase references are available.
 */

/* -------------------- Thunks -------------------- */

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    credentials: { name: string; email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(loginStart());

      const registerData = await authAPI.register(
        credentials.name,
        credentials.email,
        credentials.password
      );

      const loginData = await authAPI.login(credentials.email, credentials.password);

      await tokenStorage.setToken(loginData.access_token);
      await tokenStorage.setRefreshToken(loginData.refresh_token);

      const user: User = {
        id: registerData.id,
        email: registerData.email,
        name: registerData.name,
        is_active: registerData.is_active,
        // optional fields left undefined
      };

      dispatch(loginSuccess({ user, token: loginData.access_token }));
      return { user, token: loginData.access_token };
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Registration failed. Please try again.';
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

      const loginData = await authAPI.login(credentials.email, credentials.password);

      await tokenStorage.setToken(loginData.access_token);
      await tokenStorage.setRefreshToken(loginData.refresh_token);

      const userData = await authAPI.getCurrentUser();

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_active: userData.is_active,
      };

      dispatch(loginSuccess({ user, token: loginData.access_token }));
      return { user, token: loginData.access_token };
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(message));
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always dispatch logout to clear local state
    dispatch(logout());
    await tokenStorage.clearTokens();
  }
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await tokenStorage.getToken();

      if (!token) {
        return rejectWithValue('No token found');
      }

      // Try to fetch current user (backend will validate token)
      const userData = await authAPI.getCurrentUser();

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_active: userData.is_active,
      };

      dispatch(loginSuccess({ user, token }));
      return { user, token };
    } catch (error: any) {
      await tokenStorage.clearTokens();
      return rejectWithValue(error?.message || 'Session invalid');
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
      const message = error?.response?.data?.detail || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

/* -------------------- Slice -------------------- */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        // loginSuccess already dispatched inside thunk; keep safe
        if (action.payload?.user) state.user = action.payload.user;
        if (action.payload?.token) state.token = action.payload.token;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          // merge updated fields into existing user object
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
