import api from './api';
import { ApiResponse, INotification } from '../types';

export const notificationApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ notifications: INotification[]; unreadCount: number }>>('/notifications', { params }),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<{ notification: INotification }>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<{ message: string }>>('/notifications/read-all'),
};
