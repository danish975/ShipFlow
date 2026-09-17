import { ConsumeMessage } from 'amqplib';
import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ShipmentEventMessage } from '../types';
import { Exception, ExceptionSeverity, ExceptionStatus } from '../models/Exception';

export const startSLAConsumer = async (): Promise<void> => {
  try {
    const channel = rabbitmqConnection.getChannel();
    
    await channel.consume(env.rabbitmqSlaQueue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const event: ShipmentEventMessage = JSON.parse(msg.content.toString());
        logger.info(`SLA consumer received event: ${event.eventType} for shipment ${event.shipmentId}`);

        let exceptionType = '';
        let description = '';
        let severity = ExceptionSeverity.MEDIUM;

        if (event.eventType === 'shipment.sla_at_risk') {
          exceptionType = 'SLA_AT_RISK';
          description = `Shipment ${event.trackingNumber} is at risk of breaching SLA`;
          severity = ExceptionSeverity.MEDIUM;
        } else if (event.eventType === 'shipment.sla_breached') {
          exceptionType = 'SLA_BREACHED';
          description = `Shipment ${event.trackingNumber} breached SLA`;
          severity = ExceptionSeverity.CRITICAL;
        }

        if (exceptionType) {
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
            logger.info(`Created SLA exception for shipment ${event.shipmentId}`);
          }
        }

        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing SLA message:', error);
        channel.nack(msg, false, false);
      }
    });

    logger.info('SLA consumer started');
  } catch (error) {
    logger.error('Failed to start SLA consumer:', error);
  }
};
