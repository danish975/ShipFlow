import api from './api';
import { ApiResponse, AuthResponse, LoginFormData, RegisterFormData, IUser } from '../types';

export const authApi = {
  register: (data: RegisterFormData) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginFormData) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () =>
    api.post<ApiResponse<{ message: string }>>('/auth/logout'),

  getMe: () =>
    api.get<ApiResponse<{ user: IUser }>>('/auth/me'),
};
