import { ConsumeMessage } from 'amqplib';
import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ShipmentEventMessage } from '../types';

const MAX_RETRIES = 3;
const processedEvents = new Set<string>();

setInterval(() => {
  processedEvents.clear();
}, 10 * 60 * 1000);

// In-memory analytics counters (could be backed by Redis in production)
export const analyticsCounters: Record<string, number> = {
  'shipment.created': 0,
  'shipment.assigned': 0,
  'shipment.picked_up': 0,
  'shipment.in_transit': 0,
  'shipment.out_for_delivery': 0,
  'shipment.delivered': 0,
  'shipment.cancelled': 0,
  total_events: 0,
};

const processMessage = async (msg: ConsumeMessage): Promise<void> => {
  const event: ShipmentEventMessage = JSON.parse(msg.content.toString());

  const idempotencyKey = `analytics:${event.eventId}`;
  if (processedEvents.has(idempotencyKey)) {
    logger.debug(`Duplicate analytics event skipped: ${event.eventId}`);
    return;
  }

  // Update analytics counters
  if (analyticsCounters[event.eventType] !== undefined) {
    analyticsCounters[event.eventType]++;
  }
  analyticsCounters.total_events++;

  processedEvents.add(idempotencyKey);
  logger.info(`Analytics event processed: ${event.eventType}`, {
    eventId: event.eventId,
    totalEvents: analyticsCounters.total_events,
  });
};

export const startAnalyticsConsumer = async (): Promise<void> => {
  const channel = rabbitmqConnection.getChannel();

  await channel.consume(
    env.rabbitmqAnalyticsQueue,
    async (msg: any) => {
      if (!msg) return;

      const retryCount = (msg.properties.headers?.['x-retry-count'] as number) || 0;

      try {
        await processMessage(msg);
        channel.ack(msg);
      } catch (error) {
        logger.error('Analytics consumer error:', error);

        if (retryCount >= MAX_RETRIES) {
          logger.error(`Max retries reached for analytics message, sending to DLQ`, {
            messageId: msg.properties.messageId,
          });
          channel.nack(msg, false, false);
        } else {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            try {
              channel.nack(msg, false, true);
            } catch {
              logger.error('Failed to nack analytics message for retry');
            }
          }, delay);
        }
      }
    },
    { noAck: false }
  );

  logger.info('Analytics consumer started');
};

export const getAnalyticsCounters = (): Record<string, number> => {
  return { ...analyticsCounters };
};
