import { ConsumeMessage } from 'amqplib';
import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ShipmentEvent } from '../models/ShipmentEvent';
import { ShipmentEventMessage, ShipmentEventType } from '../types';
import { getSocketIO } from '../sockets';

const MAX_RETRIES = 3;
const processedEvents = new Set<string>();

setInterval(() => {
  processedEvents.clear();
}, 10 * 60 * 1000);

const processMessage = async (msg: ConsumeMessage): Promise<void> => {
  const event: ShipmentEventMessage = JSON.parse(msg.content.toString());

  // Idempotency check
  const idempotencyKey = `tracking:${event.eventId}`;
  if (processedEvents.has(idempotencyKey)) {
    logger.debug(`Duplicate tracking event skipped: ${event.eventId}`);
    return;
  }

  // Create shipment event record
  await ShipmentEvent.create({
    shipmentId: event.shipmentId,
    eventType: event.eventType as ShipmentEventType,
    status: event.status,
    metadata: {
      ...event.metadata,
      previousStatus: event.previousStatus,
      deliveryAgentId: event.deliveryAgentId,
      eventId: event.eventId,
    },
  });

  // Emit real-time tracking update via Socket.IO
  const io = getSocketIO();
  if (io) {
    io.to(`shipment:${event.trackingNumber}`).emit('tracking:update', {
      shipmentId: event.shipmentId,
      trackingNumber: event.trackingNumber,
      status: event.status,
      previousStatus: event.previousStatus,
      eventType: event.eventType,
      timestamp: event.timestamp,
    });
  }

  processedEvents.add(idempotencyKey);
  logger.info(`Tracking event recorded: ${event.eventType}`, {
    eventId: event.eventId,
    shipmentId: event.shipmentId,
  });
};

export const startTrackingConsumer = async (): Promise<void> => {
  const channel = rabbitmqConnection.getChannel();

  await channel.consume(
    env.rabbitmqTrackingQueue,
    async (msg: any) => {
      if (!msg) return;

      const retryCount = (msg.properties.headers?.['x-retry-count'] as number) || 0;

      try {
        await processMessage(msg);
        channel.ack(msg);
      } catch (error) {
        logger.error('Tracking consumer error:', error);

        if (retryCount >= MAX_RETRIES) {
          logger.error(`Max retries reached for tracking message, sending to DLQ`, {
            messageId: msg.properties.messageId,
          });
          channel.nack(msg, false, false);
        } else {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            try {
              channel.nack(msg, false, true);
            } catch {
              logger.error('Failed to nack tracking message for retry');
            }
          }, delay);
        }
      }
    },
    { noAck: false }
  );

  logger.info('Tracking consumer started');
};
