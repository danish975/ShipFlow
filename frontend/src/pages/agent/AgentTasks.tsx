import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { agentApi } from '../../services/agentApi';
import { shipmentApi } from '../../services/shipmentApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { IShipment, IUser, ShipmentStatus, PaginationMeta } from '../../types';
import { ArrowRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppDispatch } from '../../store/store';

const NEXT_STATUS: Partial<Record<ShipmentStatus, { label: string; status: ShipmentStatus }>> = {
  [ShipmentStatus.ASSIGNED]: { label: 'Pick Up', status: ShipmentStatus.PICKED_UP },
  [ShipmentStatus.PICKED_UP]: { label: 'Start Transit', status: ShipmentStatus.IN_TRANSIT },
  [ShipmentStatus.IN_TRANSIT]: { label: 'Out for Delivery', status: ShipmentStatus.OUT_FOR_DELIVERY },
  [ShipmentStatus.OUT_FOR_DELIVERY]: { label: 'Mark Delivered', status: ShipmentStatus.DELIVERED },
};

const AgentTasks: React.FC = () => {
  const [shipments, setShipments] = useState<IShipment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const response = await agentApi.getShipments(params);
      setShipments(response.data.data.shipments);
      setMeta(response.data.meta || null);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusUpdate = async (shipment: IShipment, newStatus: ShipmentStatus) => {
    setUpdating(shipment._id);
    try {
      await shipmentApi.updateStatus(shipment._id, newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Tasks</h1>
        <p className="page-subtitle">Manage your assigned deliveries</p>
      </div>

      <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-full sm:w-48">
        <option value="">All Statuses</option>
        <option value="ASSIGNED">Assigned</option>
        <option value="PICKED_UP">Picked Up</option>
        <option value="IN_TRANSIT">In Transit</option>
        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
        <option value="DELIVERED">Delivered</option>
      </select>

      {loading ? <LoadingSpinner /> : shipments.length === 0 ? (
        <EmptyState title="No tasks found" description="No deliveries assigned to you yet." />
      ) : (
        <div className="space-y-4">
          {shipments.map((s) => {
            const customer = typeof s.customerId === 'object' ? s.customerId as IUser : null;
            const nextAction = NEXT_STATUS[s.status];
            return (
              <div key={s._id} className="card p-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-surface-900 dark:text-white">{s.trackingNumber}</p>
                        <StatusBadge status={s.status} size="sm" />
                      </div>
                      <p className="text-xs text-surface-500">
                        {customer?.name} • {customer?.phone}
                      </p>
                      <p className="text-xs text-surface-400 mt-1">
                        📍 {s.deliveryAddress.street}, {s.deliveryAddress.city}, {s.deliveryAddress.state}
                      </p>
                      <p className="text-xs text-surface-400">
                        📦 {s.packageDetails.description} ({s.packageDetails.weight}kg)
                      </p>
                    </div>
                  </div>
                  {nextAction && (
                    <button
                      onClick={() => handleStatusUpdate(s, nextAction.status)}
                      disabled={updating === s._id}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      {updating === s._id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {nextAction.label}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default AgentTasks;
