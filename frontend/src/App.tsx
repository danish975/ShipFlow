import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import ShipmentDetail from './pages/ShipmentDetail';
import CreateShipment from './pages/CreateShipment';
import TrackShipment from './pages/TrackShipment';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageShipments from './pages/admin/ManageShipments';
import Analytics from './pages/admin/Analytics';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTasks from './pages/agent/AgentTasks';

// ─── Auth Guard ────────────────────────────────────────
interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to role-appropriate dashboard
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === UserRole.AGENT) return <Navigate to="/agent" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// ─── Guest Guard (redirect authenticated users away from login) ──
const GuestRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === UserRole.AGENT) return <Navigate to="/agent" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// ─── App ───────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <Routes>
      {/* Public / Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/shipments/create" element={<CreateShipment />} />
          <Route path="/shipments/:id" element={<ShipmentDetail />} />
          <Route path="/track" element={<TrackShipment />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/shipments" element={<ManageShipments />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.AGENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/tasks" element={<AgentTasks />} />
        </Route>
      </Route>

      {/* Shared authenticated routes (all roles) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 — redirect to appropriate page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
