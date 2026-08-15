import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-surface-950 to-primary-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-600/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ShipFlow</h1>
          <p className="text-primary-200/60 mt-1 text-sm">Event-Driven Logistics Platform</p>
        </div>

        {/* Auth form card */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200/40 text-xs mt-6">
          © 2024 ShipFlow. Production-grade logistics platform.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
