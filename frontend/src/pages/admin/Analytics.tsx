import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AnalyticsData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminApi.getAnalytics();
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;
  if (!data) return <p className="text-center text-surface-500">Failed to load analytics</p>;

  const formatMs = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  const categoryData = data.categoryDistribution.map((item) => ({
    name: item._id || 'Unknown',
    value: item.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Advanced platform analytics and insights</p>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Delivered', value: data.deliveryStats.totalDelivered },
          { label: 'Avg Delivery Time', value: formatMs(data.deliveryStats.avgDeliveryTime) },
          { label: 'Fastest Delivery', value: formatMs(data.deliveryStats.minDeliveryTime) },
          { label: 'Slowest Delivery', value: formatMs(data.deliveryStats.maxDeliveryTime) },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs text-surface-400 uppercase font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Shipments */}
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Daily Shipments (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyShipments.map((d) => ({ date: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Package Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {categoryData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Counters */}
      <div className="card p-6">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Event Counters (via RabbitMQ)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(data.eventCounters).filter(([k]) => k !== 'total_events').map(([key, value]) => (
            <div key={key} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <p className="text-xs text-surface-400 uppercase">{key.replace('shipment.', '')}</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
