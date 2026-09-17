import { ConsumeMessage } from 'amqplib';
import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ShipmentEventMessage } from '../types';
import { Exception, ExceptionSeverity, ExceptionStatus } from '../models/Exception';

export const startExceptionConsumer = async (): Promise<void> => {
  try {
    const channel = rabbitmqConnection.getChannel();
    
    await channel.consume(env.rabbitmqExceptionQueue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const event: ShipmentEventMessage = JSON.parse(msg.content.toString());
        logger.info(`Exception consumer received event: ${event.eventType} for shipment ${event.shipmentId}`);

        let exceptionType = '';
        let description = '';
        let severity = ExceptionSeverity.MEDIUM;

        if (event.eventType === 'shipment.delivery_failed') {
          exceptionType = 'DELIVERY_FAILED';
          description = `Delivery failed for shipment ${event.trackingNumber}`;
          severity = ExceptionSeverity.HIGH;
        } else if (event.eventType === 'shipment.cancelled') {
          exceptionType = 'SHIPMENT_CANCELLED';
          description = `Shipment ${event.trackingNumber} was cancelled`;
          severity = ExceptionSeverity.LOW;
        }

        if (exceptionType) {
          // Idempotency: check if exception already exists
          const existing = await Exception.findOne({
            shipmentId: event.shipmentId,
            type: exceptionType,
            status: ExceptionStatus.OPEN
          });

          if (!existing) {
            await Exception.create({
              shipmentId: event.shipmentId,
              type: exceptionType,
              severity,
              description,
            });
            logger.info(`Created exception for shipment ${event.shipmentId}`);
          }
        }

        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing exception message:', error);
        channel.nack(msg, false, false);
      }
    });

    logger.info('Exception consumer started');
  } catch (error) {
    logger.error('Failed to start exception consumer:', error);
  }
};
