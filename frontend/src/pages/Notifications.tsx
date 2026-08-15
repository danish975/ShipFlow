import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../store/slices/notificationSlice';
import { RootState, AppDispatch } from '../store/store';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { Bell, CheckCheck, Package } from 'lucide-react';

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading, meta } = useSelector((state: RootState) => state.notifications);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotifications({ page, limit: 20 }));
  }, [dispatch, page]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => dispatch(markAllNotificationsRead())} className="btn-secondary">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading && notifications.length === 0 ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="card overflow-hidden divide-y divide-surface-100 dark:divide-surface-700">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && dispatch(markNotificationRead(n._id))}
              className={`p-4 flex items-start gap-4 cursor-pointer transition-colors ${
                !n.read
                  ? 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
              }`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                !n.read
                  ? 'bg-primary-100 dark:bg-primary-900/40'
                  : 'bg-surface-100 dark:bg-surface-700'
              }`}>
                <Bell className={`w-5 h-5 ${!n.read ? 'text-primary-600' : 'text-surface-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.read ? 'text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-400'}`}>
                    {n.title}
                  </p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-surface-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default Notifications;
