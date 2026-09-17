import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { QRScanner } from '../../components/QRScanner';

const DeliveryProofForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState('');
  const [otp, setOtp] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Typically you'd have a specific endpoint for delivery proof, 
      // but we will just update the status to DELIVERED
      await api.patch(`/shipments/${id}/status`, { status: 'DELIVERED', recipientName, otp });
      toast.success('Delivery Proof Submitted');
      navigate('/agent/tasks');
    } catch (error) {
      toast.error('Failed to submit delivery proof');
    }
  };

  const handleScan = (text: string) => {
    setShowScanner(false);
    toast.success(`Scanned Tracking Number: ${text}`);
    // You could map this tracking number to the ID or fill in a field
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delivery Proof</h1>
      <button 
        type="button"
        onClick={() => setShowScanner(true)}
        className="mb-4 w-full bg-indigo-100 text-indigo-700 py-2 rounded-md hover:bg-indigo-200"
      >
        Scan QR Code
      </button>
      
      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
          <input 
            type="text" 
            required 
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery OTP</label>
          <input 
            type="text" 
            required
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
          Confirm Delivery
        </button>
      </form>
    </div>
  );
};

export default DeliveryProofForm;
