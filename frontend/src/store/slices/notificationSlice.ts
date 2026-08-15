import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { INotification, PaginationMeta } from '../../types';
import { notificationApi } from '../../services/notificationApi';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  meta: PaginationMeta | null;
  isLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  meta: null,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params: Record<string, string | number> | undefined) => {
    const response = await notificationApi.getAll(params);
    return { notifications: response.data.data.notifications, unreadCount: response.data.data.unreadCount, meta: response.data.meta };
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => {
    await notificationApi.markAsRead(id);
    return id;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    await notificationApi.markAllRead();
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.meta = action.payload.meta || null;
    });
    builder.addCase(fetchNotifications.rejected, (state) => { state.isLoading = false; });

    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const index = state.notifications.findIndex((n) => n._id === action.payload);
      if (index >= 0) {
        state.notifications[index].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => { n.read = true; });
      state.unreadCount = 0;
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
