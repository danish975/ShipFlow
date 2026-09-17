import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { toggleTheme, toggleSidebar } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { fetchNotifications, markAllNotificationsRead } from '../store/slices/notificationSlice';
import { disconnectSocket } from '../services/socket';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.ui);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-surface-200/50 dark:border-surface-700/50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => dispatch(toggleSidebar())} className="btn-ghost p-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              ShipFlow
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button onClick={() => dispatch(toggleTheme())} className="btn-ghost p-2 rounded-xl">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost p-2 rounded-xl relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse-soft">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 animate-slide-down overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllNotificationsRead())}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-surface-400 text-center">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 border-b border-surface-50 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors ${
                          !n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-surface-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 text-center text-sm text-primary-600 hover:bg-surface-50 dark:hover:bg-surface-700/50 font-medium"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 btn-ghost px-3 py-2 rounded-xl"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300 max-w-24 truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-4 h-4 text-surface-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 animate-slide-down overflow-hidden">
                <div className="p-4 border-b border-surface-100 dark:border-surface-700">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{user?.email}</p>
                  <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 mt-2">
                    {user?.role}
                  </span>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
