import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ShipmentEventMessage, ShipmentStatus, ShipmentEventType } from '../types';
import { generateEventId } from '../utils/tracking';
import { statusToEventType } from '../services/shipment.service';

/**
 * Publishes a shipment event to RabbitMQ.
 * Uses the topic exchange with the event type as the routing key.
 */
export const publishShipmentEvent = async (
  shipmentId: string,
  trackingNumber: string,
  customerId: string,
  status: ShipmentStatus,
  previousStatus?: ShipmentStatus,
  deliveryAgentId?: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  try {
    const channel = rabbitmqConnection.getChannel();
    const routingKey = statusToEventType(status);
    const eventId = generateEventId();

    const message: ShipmentEventMessage = {
      eventId,
      eventType: routingKey as ShipmentEventType,
      shipmentId,
      trackingNumber,
      customerId,
      deliveryAgentId,
      status,
      previousStatus,
      metadata,
      timestamp: new Date().toISOString(),
    };

    const published = channel.publish(
      env.rabbitmqExchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: eventId,
        timestamp: Date.now(),
        contentType: 'application/json',
        headers: {
          'x-event-id': eventId,
          'x-retry-count': 0,
        },
      }
    );

    if (published) {
      logger.info(`Event published: ${routingKey}`, {
        eventId,
        shipmentId,
        trackingNumber,
        status,
      });
    } else {
      logger.warn(`Event publish returned false (backpressure): ${routingKey}`, { eventId });
    }
  } catch (error) {
    logger.error('Failed to publish shipment event:', error);
    // Don't throw — we don't want to fail the API request if publishing fails
    // The event can be retried or handled by a separate reconciliation process
  }
};
