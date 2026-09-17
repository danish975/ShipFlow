import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Truck, CheckCircle2, Clock, ArrowRight, Plus } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchShipments } from '../store/slices/shipmentSlice';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { ShipmentStatus, IShipment } from '../types';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shipments, isLoading, meta } = useSelector((state: RootState) => state.shipments);

  useEffect(() => {
    dispatch(fetchShipments({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }));
  }, [dispatch]);

  const total = meta?.total || shipments.length;
  const active = shipments.filter((s) =>
    [ShipmentStatus.CREATED, ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY].includes(s.status)
  ).length;
  const delivered = shipments.filter((s) => s.status === ShipmentStatus.DELIVERED).length;
  const pending = shipments.filter((s) => s.status === ShipmentStatus.CREATED).length;

  if (isLoading && shipments.length === 0) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your shipping overview.</p>
        </div>
        <Link to="/shipments/create" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Shipment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Shipments" value={total} icon={Package} color="primary" />
        <StatsCard title="Active" value={active} icon={Truck} color="amber" />
        <StatsCard title="Delivered" value={delivered} icon={CheckCircle2} color="accent" />
        <StatsCard title="Pending" value={pending} icon={Clock} color="red" />
      </div>

      {/* Recent Shipments */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-700">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Recent Shipments</h2>
          <Link to="/shipments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {shipments.length === 0 ? (
          <EmptyState
            title="No shipments yet"
            description="Create your first shipment to get started."
            action={{ label: 'Create Shipment', onClick: () => {} }}
          />
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {shipments.slice(0, 5).map((shipment: IShipment) => (
              <Link
                key={shipment._id}
                to={`/shipments/${shipment._id}`}
                className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      {shipment.trackingNumber}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={shipment.status} size="sm" />
                  <ArrowRight className="w-4 h-4 text-surface-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
