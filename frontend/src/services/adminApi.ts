import api from './api';
import { ApiResponse, DashboardData, AnalyticsData, IUser, IShipment } from '../types';

export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardData>>('/admin/dashboard'),

  getUsers: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ users: IUser[] }>>('/admin/users', { params }),

  getShipments: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ shipments: IShipment[] }>>('/admin/shipments', { params }),

  getAnalytics: () =>
    api.get<ApiResponse<AnalyticsData>>('/admin/analytics'),
};
