import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Package, PackagePlus, Bell, User, Users,
  BarChart3, Truck, ClipboardList, Search, X,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { setSidebarOpen } from '../store/slices/uiSlice';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Customer
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: [UserRole.CUSTOMER] },
  { to: '/shipments', label: 'My Shipments', icon: <Package className="w-5 h-5" />, roles: [UserRole.CUSTOMER] },
  { to: '/shipments/create', label: 'New Shipment', icon: <PackagePlus className="w-5 h-5" />, roles: [UserRole.CUSTOMER] },
  { to: '/track', label: 'Track', icon: <Search className="w-5 h-5" />, roles: [UserRole.CUSTOMER] },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, roles: [UserRole.CUSTOMER] },
  { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" />, roles: [UserRole.CUSTOMER] },

  // Agent
  { to: '/agent', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: [UserRole.AGENT] },
  { to: '/agent/tasks', label: 'My Tasks', icon: <ClipboardList className="w-5 h-5" />, roles: [UserRole.AGENT] },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, roles: [UserRole.AGENT] },
  { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" />, roles: [UserRole.AGENT] },

  // Admin
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  { to: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  { to: '/admin/shipments', label: 'All Shipments', icon: <Truck className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, roles: [UserRole.ADMIN] },
];

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => user && item.roles.includes(user.role as UserRole));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="font-bold text-lg">ShipFlow</span>
            </div>
            <button onClick={() => dispatch(setSidebarOpen(false))} className="btn-ghost p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/admin' || item.to === '/agent'}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 shadow-sm'
                      : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-800 hover:translate-x-0.5'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
