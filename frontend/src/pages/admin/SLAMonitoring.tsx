import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface SLAMetrics {
  totalShipments: number;
  onTimeShipments: number;
  atRiskShipments: number;
  breachedShipments: number;
  compliancePercentage: number;
}

const SLAMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SLAMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSLA = async () => {
      try {
        const response = await api.get('/sla/metrics');
        setMetrics(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch SLA metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchSLA();
  }, []);

  if (loading || !metrics) return <div className="p-4">Loading SLA Metrics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SLA Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500 uppercase">Compliance</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{metrics.compliancePercentage}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500 uppercase">On Time</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{metrics.onTimeShipments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500 uppercase">At Risk</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{metrics.atRiskShipments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500 uppercase">Breached</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{metrics.breachedShipments}</p>
        </div>
      </div>
    </div>
  );
};

export default SLAMonitoring;
