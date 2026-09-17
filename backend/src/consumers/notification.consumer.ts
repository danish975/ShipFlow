import { ConsumeMessage } from 'amqplib';
import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { Notification } from '../models/Notification';
import { ShipmentEventMessage, NotificationType, ShipmentEventType } from '../types';
import { getSocketIO } from '../sockets';

const MAX_RETRIES = 3;
const processedEvents = new Set<string>();

// Clean up old event IDs every 10 minutes to prevent memory leak
setInterval(() => {
  processedEvents.clear();
}, 10 * 60 * 1000);

const eventToNotificationType: Record<string, NotificationType> = {
  [ShipmentEventType.CREATED]: NotificationType.SHIPMENT_CREATED,
  [ShipmentEventType.ASSIGNED]: NotificationType.SHIPMENT_ASSIGNED,
  [ShipmentEventType.PICKED_UP]: NotificationType.SHIPMENT_PICKED_UP,
  [ShipmentEventType.IN_TRANSIT]: NotificationType.SHIPMENT_IN_TRANSIT,
  [ShipmentEventType.OUT_FOR_DELIVERY]: NotificationType.SHIPMENT_OUT_FOR_DELIVERY,
  [ShipmentEventType.DELIVERED]: NotificationType.SHIPMENT_DELIVERED,
  [ShipmentEventType.CANCELLED]: NotificationType.SHIPMENT_CANCELLED,
};

const getNotificationContent = (event: ShipmentEventMessage): { title: string; message: string } => {
  const titles: Record<string, string> = {
    [ShipmentEventType.CREATED]: 'Shipment Created',
    [ShipmentEventType.ASSIGNED]: 'Agent Assigned',
    [ShipmentEventType.PICKED_UP]: 'Package Picked Up',
    [ShipmentEventType.IN_TRANSIT]: 'Package In Transit',
    [ShipmentEventType.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [ShipmentEventType.DELIVERED]: 'Package Delivered',
    [ShipmentEventType.CANCELLED]: 'Shipment Cancelled',
  };

  const messages: Record<string, string> = {
    [ShipmentEventType.CREATED]: `Your shipment ${event.trackingNumber} has been created and is pending assignment.`,
    [ShipmentEventType.ASSIGNED]: `A delivery agent has been assigned to your shipment ${event.trackingNumber}.`,
    [ShipmentEventType.PICKED_UP]: `Your package ${event.trackingNumber} has been picked up and is being processed.`,
    [ShipmentEventType.IN_TRANSIT]: `Your package ${event.trackingNumber} is now in transit to the destination.`,
    [ShipmentEventType.OUT_FOR_DELIVERY]: `Your package ${event.trackingNumber} is out for delivery!`,
    [ShipmentEventType.DELIVERED]: `Your package ${event.trackingNumber} has been delivered successfully!`,
    [ShipmentEventType.CANCELLED]: `Your shipment ${event.trackingNumber} has been cancelled.`,
  };

  return {
    title: titles[event.eventType] || 'Shipment Update',
    message: messages[event.eventType] || `Shipment ${event.trackingNumber} status updated to ${event.status}`,
  };
};

const processMessage = async (msg: ConsumeMessage): Promise<void> => {
  const event: ShipmentEventMessage = JSON.parse(msg.content.toString());

  // Idempotency check
  if (processedEvents.has(event.eventId)) {
    logger.debug(`Duplicate event skipped: ${event.eventId}`);
    return;
  }

  const notificationType = eventToNotificationType[event.eventType];
  if (!notificationType) {
    logger.warn(`Unknown event type: ${event.eventType}`);
    return;
  }

  const { title, message } = getNotificationContent(event);

  // Create notification for the customer
  const notification = await Notification.create({
    userId: event.customerId,
    shipmentId: event.shipmentId,
    type: notificationType,
    title,
    message,
  });

  // Also create notification for the delivery agent if assigned
  if (event.deliveryAgentId && event.eventType === ShipmentEventType.ASSIGNED) {
    await Notification.create({
      userId: event.deliveryAgentId,
      shipmentId: event.shipmentId,
      type: notificationType,
      title: 'New Shipment Assigned',
      message: `Shipment ${event.trackingNumber} has been assigned to you.`,
    });

    // Emit to agent via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`user:${event.deliveryAgentId}`).emit('notification', {
        type: notificationType,
        title: 'New Shipment Assigned',
        message: `Shipment ${event.trackingNumber} has been assigned to you.`,
        shipmentId: event.shipmentId,
      });
    }
  }

  // Emit notification to customer via Socket.IO
  const io = getSocketIO();
  if (io) {
    io.to(`user:${event.customerId}`).emit('notification', {
      _id: notification._id,
      type: notificationType,
      title,
      message,
      shipmentId: event.shipmentId,
      read: false,
      createdAt: notification.createdAt,
    });
  }

  processedEvents.add(event.eventId);
  logger.info(`Notification created for event: ${event.eventType}`, {
    eventId: event.eventId,
    userId: event.customerId,
  });
};

export const startNotificationConsumer = async (): Promise<void> => {
  const channel = rabbitmqConnection.getChannel();

  await channel.consume(
    env.rabbitmqNotificationQueue,
    async (msg: any) => {
      if (!msg) return;

      const retryCount = (msg.properties.headers?.['x-retry-count'] as number) || 0;

      try {
        await processMessage(msg);
        channel.ack(msg);
      } catch (error) {
        logger.error('Notification consumer error:', error);

        if (retryCount >= MAX_RETRIES) {
          // Send to dead-letter queue
          logger.error(`Max retries reached for message, sending to DLQ`, {
            messageId: msg.properties.messageId,
            retryCount,
          });
          channel.nack(msg, false, false); // reject without requeue → DLX
        } else {
          // Requeue with incremented retry count after exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            try {
              channel.nack(msg, false, true); // requeue
            } catch {
              logger.error('Failed to nack message for retry');
            }
          }, delay);
        }
      }
    },
    { noAck: false }
  );

  logger.info('Notification consumer started');
};
