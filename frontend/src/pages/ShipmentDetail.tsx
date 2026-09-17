import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipmentById, cancelShipmentAction, clearCurrentShipment } from '../store/slices/shipmentSlice';
import { RootState, AppDispatch } from '../store/store';
import { useSocket } from '../hooks/useSocket';
import StatusBadge from '../components/StatusBadge';
import TrackingTimeline from '../components/TrackingTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Package, Truck, Calendar, XCircle, ArrowLeft } from 'lucide-react';
import { IUser, ShipmentStatus } from '../types';
import toast from 'react-hot-toast';

const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { joinTrackingRoom, leaveTrackingRoom } = useSocket();
  const { currentShipment: shipment, isLoading, validNextStatuses } = useSelector((state: RootState) => state.shipments);

  useEffect(() => {
    if (id) dispatch(fetchShipmentById(id));
    return () => { dispatch(clearCurrentShipment()); };
  }, [id, dispatch]);

  useEffect(() => {
    if (shipment) {
      joinTrackingRoom(shipment.trackingNumber);
      return () => leaveTrackingRoom(shipment.trackingNumber);
    }
  }, [shipment?.trackingNumber]);

  const handleCancel = async () => {
    if (!shipment || !window.confirm('Are you sure you want to cancel this shipment?')) return;
    const result = await dispatch(cancelShipmentAction(shipment._id));
    if (cancelShipmentAction.fulfilled.match(result)) {
      toast.success('Shipment cancelled');
    } else {
      toast.error((result.payload as string) || 'Failed to cancel');
    }
  };

  if (isLoading || !shipment) return <LoadingSpinner text="Loading shipment..." />;

  const canCancel = [ShipmentStatus.CREATED, ShipmentStatus.ASSIGNED].includes(shipment.status);
  const customer = shipment.customerId as IUser;
  const agent = shipment.deliveryAgentId as IUser | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            {shipment.trackingNumber}
            <StatusBadge status={shipment.status} size="lg" />
          </h1>
          <p className="page-subtitle">Created {new Date(shipment.createdAt).toLocaleDateString()}</p>
        </div>
        {canCancel && (
          <button onClick={handleCancel} className="btn-danger">
            <XCircle className="w-4 h-4" /> Cancel Shipment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-surface-900 dark:text-white">Pickup</h3>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300">{shipment.pickupAddress.street}</p>
              <p className="text-sm text-surface-500">{shipment.pickupAddress.city}, {shipment.pickupAddress.state} {shipment.pickupAddress.zipCode}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-accent-600" />
                <h3 className="font-semibold text-surface-900 dark:text-white">Delivery</h3>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300">{shipment.deliveryAddress.street}</p>
              <p className="text-sm text-surface-500">{shipment.deliveryAddress.city}, {shipment.deliveryAddress.state} {shipment.deliveryAddress.zipCode}</p>
            </div>
          </div>

          {/* Package Info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-surface-900 dark:text-white">Package Details</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-surface-400 uppercase">Weight</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{shipment.packageDetails.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase">Dimensions</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{shipment.packageDetails.dimensions}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase">Category</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">{shipment.packageDetails.category}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase">Description</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{shipment.packageDetails.description}</p>
              </div>
            </div>
          </div>

          {/* Agent */}
          {agent && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-surface-900 dark:text-white">Delivery Agent</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <span className="text-accent-700 font-semibold">{agent.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{agent.name}</p>
                  <p className="text-xs text-surface-500">{agent.email}</p>
                </div>
              </div>
            </div>
          )}

          {shipment.estimatedDelivery && (
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-surface-900 dark:text-white">Estimated Delivery</h3>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300 mt-2">
                {new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Tracking Timeline</h3>
          <TrackingTimeline currentStatus={shipment.status} />
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;
