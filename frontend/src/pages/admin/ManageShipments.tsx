import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { shipmentApi } from '../../services/shipmentApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { IShipment, IUser, ShipmentStatus, PaginationMeta } from '../../types';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageShipments: React.FC = () => {
  const [shipments, setShipments] = useState<IShipment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModal, setAssignModal] = useState<IShipment | null>(null);
  const [agents, setAgents] = useState<IUser[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const response = await adminApi.getShipments(params);
      setShipments(response.data.data.shipments);
      setMeta(response.data.meta || null);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const openAssignModal = async (shipment: IShipment) => {
    setAssignModal(shipment);
    try {
      const response = await adminApi.getUsers({ role: 'agent', limit: 50 });
      setAgents(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !selectedAgent) return;
    try {
      await shipmentApi.assignAgent(assignModal._id, selectedAgent);
      toast.success('Agent assigned successfully');
      setAssignModal(null);
      setSelectedAgent('');
      fetchShipments();
    } catch (error) {
      toast.error('Failed to assign agent');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Manage Shipments</h1>
        <p className="page-subtitle">View and manage all shipments across the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar placeholder="Search by tracking number..." onSearch={(q) => { setSearch(q); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-full sm:w-48">
          <option value="">All Statuses</option>
          {Object.values(ShipmentStatus).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Tracking</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase hidden md:table-cell">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase hidden lg:table-cell">Agent</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {shipments.map((s) => {
                  const customer = typeof s.customerId === 'object' ? s.customerId : null;
                  const agent = typeof s.deliveryAgentId === 'object' ? s.deliveryAgentId : null;
                  return (
                    <tr key={s._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-3 text-sm font-medium text-surface-900 dark:text-white">{s.trackingNumber}</td>
                      <td className="px-6 py-3 text-sm text-surface-500 hidden md:table-cell">{customer?.name || '-'}</td>
                      <td className="px-6 py-3 text-sm text-surface-500 hidden lg:table-cell">{agent?.name || '-'}</td>
                      <td className="px-6 py-3"><StatusBadge status={s.status} size="sm" /></td>
                      <td className="px-6 py-3">
                        {s.status === ShipmentStatus.CREATED && (
                          <button onClick={() => openAssignModal(s)} className="btn-ghost text-xs gap-1 py-1 px-2">
                            <UserPlus className="w-3.5 h-3.5" />
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}

      {/* Assign Modal */}
      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Delivery Agent">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">
            Assign an agent to shipment <strong>{assignModal?.trackingNumber}</strong>
          </p>
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="input">
            <option value="">Select an agent...</option>
            {agents.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAssignModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAssign} disabled={!selectedAgent} className="btn-primary">Assign Agent</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageShipments;
