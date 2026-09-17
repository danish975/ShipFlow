import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { agentApi } from '../../services/agentApi';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { AgentStatsData, IShipment, IUser } from '../../types';

const AgentDashboard: React.FC = () => {
  const [data, setData] = useState<AgentStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await agentApi.getStats();
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading agent dashboard..." />;
  if (!data) return <p className="text-center text-surface-500">Failed to load dashboard</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Agent Dashboard</h1>
        <p className="page-subtitle">Your delivery overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Tasks" value={data.totalActive} icon={Package} color="amber" />
        <StatsCard title="In Transit" value={data.inTransit} icon={Truck} color="primary" />
        <StatsCard title="Out for Delivery" value={data.outForDelivery} icon={MapPin} color="accent" />
        <StatsCard title="Delivered" value={data.delivered} icon={CheckCircle2} color="accent" />
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="p-6 border-b border-surface-100 dark:border-surface-700">
          <h3 className="font-semibold text-surface-900 dark:text-white">Today's Tasks</h3>
        </div>
        {data.todaysTasks.length === 0 ? (
          <EmptyState title="No tasks for today" description="You're all caught up! Check back later." />
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {data.todaysTasks.map((s: IShipment) => {
              const customer = typeof s.customerId === 'object' ? s.customerId as IUser : null;
              return (
                <div key={s._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">{s.trackingNumber}</p>
                      <p className="text-xs text-surface-500">
                        {customer?.name} • {s.deliveryAddress.city}, {s.deliveryAddress.state}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
