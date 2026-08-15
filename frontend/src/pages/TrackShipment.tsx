import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { trackShipment, clearTrackingData } from '../store/slices/shipmentSlice';
import { RootState, AppDispatch } from '../store/store';
import TrackingTimeline from '../components/TrackingTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { Search, Package, MapPin } from 'lucide-react';

const TrackShipment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trackingShipment, trackingEvents, isLoading, error } = useSelector((state: RootState) => state.shipments);
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      dispatch(trackShipment(trackingNumber.trim()));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="page-title">Track Your Shipment</h1>
        <p className="page-subtitle">Enter your tracking number to see real-time status updates</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. SF-A1B2C3D4"
            className="input pl-12 py-3 text-lg"
          />
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary px-8">
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Track'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {isLoading && <LoadingSpinner text="Tracking shipment..." />}

      {trackingShipment && (
        <div className="space-y-6 animate-slide-up">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">{trackingShipment.trackingNumber}</h2>
              <StatusBadge status={trackingShipment.status} size="lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <MapPin className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 uppercase font-medium">From</p>
                  <p className="text-sm text-surface-700 dark:text-surface-300">{trackingShipment.pickupAddress.city}, {trackingShipment.pickupAddress.state}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent-50 dark:bg-accent-900/30">
                  <MapPin className="w-4 h-4 text-accent-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 uppercase font-medium">To</p>
                  <p className="text-sm text-surface-700 dark:text-surface-300">{trackingShipment.deliveryAddress.city}, {trackingShipment.deliveryAddress.state}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 uppercase font-medium">Package</p>
                  <p className="text-sm text-surface-700 dark:text-surface-300">{trackingShipment.packageDetails.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Shipment Timeline</h3>
            <TrackingTimeline currentStatus={trackingShipment.status} events={trackingEvents} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
