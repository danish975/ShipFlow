import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Plus, ArrowRight } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchShipments } from '../store/slices/shipmentSlice';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { ShipmentStatus, IShipment } from '../types';

const Shipments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shipments, isLoading, meta } = useSelector((state: RootState) => state.shipments);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params: Record<string, string | number> = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchShipments(params));
  }, [dispatch, page, search, statusFilter]);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Shipments</h1>
          <p className="page-subtitle">Manage and track all your shipments</p>
        </div>
        <Link to="/shipments/create" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Shipment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar placeholder="Search by tracking number or city..." onSearch={handleSearch} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          {Object.values(ShipmentStatus).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Shipment List */}
      {isLoading ? (
        <LoadingSpinner text="Loading shipments..." />
      ) : shipments.length === 0 ? (
        <EmptyState
          title="No shipments found"
          description={search || statusFilter ? 'Try adjusting your filters.' : 'Create your first shipment to get started.'}
          action={!search && !statusFilter ? { label: 'Create Shipment', onClick: () => {} } : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Tracking</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">Destination</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">Package</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {shipments.map((shipment: IShipment) => (
                  <tr key={shipment._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">{shipment.trackingNumber}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-surface-600 dark:text-surface-300">
                        {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm text-surface-500">{shipment.packageDetails.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={shipment.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-xs text-surface-400">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/shipments/${shipment._id}`} className="btn-ghost p-1.5">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default Shipments;
