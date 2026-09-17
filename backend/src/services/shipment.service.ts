import { ShipmentStatus } from '../types';

/**
 * Defines valid status transitions for the shipment state machine.
 * Any transition not listed here is rejected by the backend.
 */
const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.CREATED]: [ShipmentStatus.VALIDATED, ShipmentStatus.CANCELLED],
  [ShipmentStatus.VALIDATED]: [ShipmentStatus.ASSIGNED, ShipmentStatus.CANCELLED],
  [ShipmentStatus.ASSIGNED]: [ShipmentStatus.PICKED_UP, ShipmentStatus.CANCELLED],
  [ShipmentStatus.PICKED_UP]: [ShipmentStatus.IN_TRANSIT],
  [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.OUT_FOR_DELIVERY],
  [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED, ShipmentStatus.DELIVERY_FAILED],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.DELIVERY_FAILED]: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.RETURNED],
  [ShipmentStatus.CANCELLED]: [],
  [ShipmentStatus.RETURNED]: [],
};

/**
 * Validates whether a status transition is allowed.
 */
export const isValidTransition = (currentStatus: ShipmentStatus, newStatus: ShipmentStatus): boolean => {
  const validNextStatuses = VALID_TRANSITIONS[currentStatus];
  return validNextStatuses.includes(newStatus);
};

/**
 * Returns the list of valid next statuses for a given status.
 */
export const getValidNextStatuses = (currentStatus: ShipmentStatus): ShipmentStatus[] => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

/**
 * Checks if a shipment can be cancelled from its current status.
 */
export const canCancel = (currentStatus: ShipmentStatus): boolean => {
  return VALID_TRANSITIONS[currentStatus]?.includes(ShipmentStatus.CANCELLED) ?? false;
};

/**
 * Maps ShipmentStatus to ShipmentEventType routing key
 */
export const statusToEventType = (status: ShipmentStatus): string => {
  const mapping: Record<ShipmentStatus, string> = {
    [ShipmentStatus.CREATED]: 'shipment.created',
    [ShipmentStatus.VALIDATED]: 'shipment.validated',
    [ShipmentStatus.ASSIGNED]: 'shipment.assigned',
    [ShipmentStatus.PICKED_UP]: 'shipment.picked_up',
    [ShipmentStatus.IN_TRANSIT]: 'shipment.in_transit',
    [ShipmentStatus.OUT_FOR_DELIVERY]: 'shipment.out_for_delivery',
    [ShipmentStatus.DELIVERED]: 'shipment.delivered',
    [ShipmentStatus.DELIVERY_FAILED]: 'shipment.delivery_failed',
    [ShipmentStatus.CANCELLED]: 'shipment.cancelled',
    [ShipmentStatus.RETURNED]: 'shipment.returned',
  };
  return mapping[status];
};
