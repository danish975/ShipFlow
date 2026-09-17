import React from 'react';
import { ShipmentStatus } from '../types';
import {
  Package, Truck, CheckCircle2, XCircle, Clock, MapPin, PackageCheck,
} from 'lucide-react';

const statusConfig: Record<ShipmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [ShipmentStatus.CREATED]: { label: 'Created', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: <Package className="w-3.5 h-3.5" /> },
  [ShipmentStatus.VALIDATED]: { label: 'Validated', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [ShipmentStatus.ASSIGNED]: { label: 'Assigned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: <Clock className="w-3.5 h-3.5" /> },
  [ShipmentStatus.PICKED_UP]: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: <PackageCheck className="w-3.5 h-3.5" /> },
  [ShipmentStatus.IN_TRANSIT]: { label: 'In Transit', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: <Truck className="w-3.5 h-3.5" /> },
  [ShipmentStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: <MapPin className="w-3.5 h-3.5" /> },
  [ShipmentStatus.DELIVERED]: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  [ShipmentStatus.DELIVERY_FAILED]: { label: 'Delivery Failed', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: <XCircle className="w-3.5 h-3.5" /> },
  [ShipmentStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: <XCircle className="w-3.5 h-3.5" /> },
  [ShipmentStatus.RETURNED]: { label: 'Returned', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300', icon: <Package className="w-3.5 h-3.5" /> },
};

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.color} ${sizeClasses[size]}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
