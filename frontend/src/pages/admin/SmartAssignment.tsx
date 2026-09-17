import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const SmartAssignment: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Mocked or simple fetch for agents for simplicity in UI
        const response = await api.get('/admin/users'); // Assuming this endpoint can return users
        const agentsOnly = response.data.data.users.filter((u: any) => u.role === 'agent');
        setAgents(agentsOnly);
      } catch (error) {
        toast.error('Failed to load agents');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Smart Assignment</h1>
      <p className="mb-4 text-gray-600">
        Smart Assignment runs automatically in the background when a shipment is created and validated.
        Below are the delivery partners available in the system.
      </p>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td className="px-6 py-4 whitespace-nowrap">{agent.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agent.email} | {agent.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartAssignment;
