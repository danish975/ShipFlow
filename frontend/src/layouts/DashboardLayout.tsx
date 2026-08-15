import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../hooks/useSocket';

const DashboardLayout: React.FC = () => {
  useSocket(); // Initialize Socket.IO connection

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-64 min-h-[calc(100vh-4rem)] pt-2">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
