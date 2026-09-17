import React from 'react';
import { ShipmentStatus, IShipmentEvent } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TrackingTimelineProps {
  currentStatus: ShipmentStatus;
  events?: IShipmentEvent[];
}

const TIMELINE_STEPS = [
  { status: ShipmentStatus.CREATED, label: 'Created', description: 'Shipment has been created' },
  { status: ShipmentStatus.ASSIGNED, label: 'Assigned', description: 'Delivery agent assigned' },
  { status: ShipmentStatus.PICKED_UP, label: 'Picked Up', description: 'Package collected from sender' },
  { status: ShipmentStatus.IN_TRANSIT, label: 'In Transit', description: 'On the way to destination' },
  { status: ShipmentStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', description: 'On the way to you' },
  { status: ShipmentStatus.DELIVERED, label: 'Delivered', description: 'Successfully delivered' },
];

const STATUS_ORDER: ShipmentStatus[] = [
  ShipmentStatus.CREATED,
  ShipmentStatus.ASSIGNED,
  ShipmentStatus.PICKED_UP,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
  ShipmentStatus.DELIVERED,
];

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ currentStatus, events = [] }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === ShipmentStatus.CANCELLED;

  const getEventTime = (status: ShipmentStatus): string | null => {
    const event = events.find((e) => e.status === status);
    return event ? new Date(event.createdAt).toLocaleString() : null;
  };

  return (
    <div className="relative">
      {isCancelled && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            This shipment has been cancelled
          </p>
        </div>
      )}

      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = currentIndex >= index && !isCancelled;
          const isCurrent = currentIndex === index && !isCancelled;
          const eventTime = getEventTime(step.status);

          return (
            <div key={step.status} className="relative flex gap-4">
              {/* Vertical line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[32px] w-0.5 h-full ${
                    isCompleted && currentIndex > index
                      ? 'bg-accent-500'
                      : 'bg-surface-200 dark:bg-surface-700'
                  }`}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {isCompleted ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? 'bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/40'
                      : 'bg-accent-500'
                  }`}>
                    {isCurrent ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-100 dark:bg-surface-700 border-2 border-surface-300 dark:border-surface-600">
                    <Circle className="w-4 h-4 text-surface-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="pb-8 flex-1">
                <p className={`text-sm font-semibold ${
                  isCompleted
                    ? 'text-surface-900 dark:text-white'
                    : 'text-surface-400 dark:text-surface-500'
                }`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${
                  isCompleted
                    ? 'text-surface-500 dark:text-surface-400'
                    : 'text-surface-300 dark:text-surface-600'
                }`}>
                  {step.description}
                </p>
                {eventTime && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                    {eventTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;
