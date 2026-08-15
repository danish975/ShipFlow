import React, { useEffect, useState } from 'react';
import { Package, Users, Truck, XCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardData, IShipment, ShipmentStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#f59e0b', '#f97316', '#10b981', '#ef4444'];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminApi.getDashboard();
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;
  if (!data) return <p className="text-center text-surface-500">Failed to load dashboard</p>;

  const pieData = Object.entries(data.statusDistribution).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Shipments" value={data.totalShipments} icon={Package} color="primary" />
        <StatsCard title="Active" value={data.activeShipments} icon={Truck} color="amber" />
        <StatsCard title="Delivered" value={data.deliveredShipments} icon={CheckCircle2} color="accent" />
        <StatsCard title="Cancelled" value={data.cancelledShipments} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard title="Customers" value={data.totalCustomers} icon={Users} color="primary" />
        <StatsCard title="Delivery Agents" value={data.totalAgents} icon={Truck} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Shipments Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Monthly Shipments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="card">
        <div className="p-6 border-b border-surface-100 dark:border-surface-700">
          <h3 className="font-semibold text-surface-900 dark:text-white">Recent Shipments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Tracking</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase hidden md:table-cell">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {data.recentShipments.map((s: IShipment) => {
                const customer = typeof s.customerId === 'object' ? s.customerId : null;
                return (
                  <tr key={s._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-3 text-sm font-medium text-surface-900 dark:text-white">{s.trackingNumber}</td>
                    <td className="px-6 py-3 text-sm text-surface-500 hidden md:table-cell">{customer?.name || '-'}</td>
                    <td className="px-6 py-3"><StatusBadge status={s.status} size="sm" /></td>
                    <td className="px-6 py-3 text-xs text-surface-400 hidden sm:table-cell">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
