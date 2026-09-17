import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { IUser, PaginationMeta } from '../../types';
import { Shield, User, Truck } from 'lucide-react';

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  customer: <User className="w-4 h-4" />,
  agent: <Truck className="w-4 h-4" />,
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  customer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  agent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 20 };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;
        const response = await adminApi.getUsers(params);
        setUsers(response.data.data.users);
        setMeta(response.data.meta || null);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">View and manage all platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar placeholder="Search users..." onSearch={handleSearch} />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input w-full sm:w-40"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">{user.name.charAt(0)}</span>
                      </div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500 hidden md:table-cell">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${roleColors[user.role]} gap-1`}>
                      {roleIcons[user.role]}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-surface-400 hidden sm:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default ManageUsers;
