import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique tracking number in format: SF-XXXXXXXX
 */
export const generateTrackingNumber = (): string => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `SF-${uuid}`;
};

/**
 * Generates a unique event ID for idempotent processing
 */
export const generateEventId = (): string => {
  return uuidv4();
};
