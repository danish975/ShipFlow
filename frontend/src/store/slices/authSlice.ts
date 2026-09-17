import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUser, LoginFormData, RegisterFormData } from '../../types';
import { authApi } from '../../services/authApi';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('shipflow_user') || 'null'),
  token: localStorage.getItem('shipflow_token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('shipflow_token'),
  error: null,
};

export const login = createAsyncThunk('auth/login', async (data: LoginFormData, { rejectWithValue }) => {
  try {
    const response = await authApi.login(data);
    const { user, token } = response.data.data;
    localStorage.setItem('shipflow_token', token);
    localStorage.setItem('shipflow_user', JSON.stringify(user));
    return { user, token };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data: RegisterFormData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(data);
    const { user, token } = response.data.data;
    localStorage.setItem('shipflow_token', token);
    localStorage.setItem('shipflow_user', JSON.stringify(user));
    return { user, token };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getMe();
    return response.data.data.user;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('shipflow_token');
      localStorage.removeItem('shipflow_user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // GetMe
    builder.addCase(getMe.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(getMe.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('shipflow_token');
      localStorage.removeItem('shipflow_user');
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
