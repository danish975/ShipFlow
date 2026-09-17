import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface Exception {
  _id: string;
  shipmentId: { _id: string; trackingNumber: string; status: string };
  type: string;
  severity: string;
  status: string;
  description: string;
  createdAt: string;
}

const ExceptionCenter: React.FC = () => {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exceptions');
      setExceptions(response.data.data.exceptions);
    } catch (error) {
      toast.error('Failed to load exceptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/exceptions/${id}/resolve`, { resolutionNotes: 'Resolved from dashboard' });
      toast.success('Exception resolved');
      fetchExceptions();
    } catch (error) {
      toast.error('Failed to resolve exception');
    }
  };

  if (loading) return <div className="p-4">Loading Exceptions...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exception Center</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exceptions.map((ex) => (
              <tr key={ex._id}>
                <td className="px-6 py-4 whitespace-nowrap">{ex.shipmentId?.trackingNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ex.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    ex.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    ex.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ex.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{ex.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {ex.status !== 'RESOLVED' && (
                    <button onClick={() => handleResolve(ex._id)} className="text-indigo-600 hover:text-indigo-900">
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExceptionCenter;
