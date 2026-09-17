import { ConsumeMessage } from 'amqplib';
import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ShipmentEventMessage, ShipmentStatus } from '../types';
import { AssignmentService } from '../services/assignment.service';
import { publishShipmentEvent } from '../producers/shipment.producer';
import { Shipment } from '../models/Shipment';
import mongoose from 'mongoose';

export const startAssignmentConsumer = async (): Promise<void> => {
  try {
    const channel = rabbitmqConnection.getChannel();
    
    await channel.consume(env.rabbitmqAssignmentQueue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const event: ShipmentEventMessage = JSON.parse(msg.content.toString());
        logger.info(`Assignment consumer received event: ${event.eventType} for shipment ${event.shipmentId}`);

        if (event.eventType === 'shipment.validated') {
          // Idempotency check: see if shipment is already assigned
          const shipment = await Shipment.findById(event.shipmentId);
          if (shipment && shipment.status === ShipmentStatus.VALIDATED && !shipment.deliveryAgentId) {
            
            const bestAgentId = await AssignmentService.findBestAgent(event.shipmentId);
            
            if (bestAgentId) {
              shipment.deliveryAgentId = new mongoose.Types.ObjectId(bestAgentId);
              const previousStatus = shipment.status;
              shipment.status = ShipmentStatus.ASSIGNED;
              
              shipment.statusHistory.push({
                status: ShipmentStatus.ASSIGNED,
                timestamp: new Date(),
                reason: 'Smart auto-assignment',
              });
              
              await shipment.save();

              await publishShipmentEvent(
                shipment._id.toString(),
                shipment.trackingNumber,
                shipment.customerId.toString(),
                ShipmentStatus.ASSIGNED,
                previousStatus,
                bestAgentId,
                { autoAssigned: true }
              );
              logger.info(`Auto-assigned shipment ${shipment._id} to agent ${bestAgentId}`);
            } else {
              logger.warn(`No suitable agent found for shipment ${event.shipmentId}`);
              // We could publish a NO_DRIVER exception here
            }
          }
        }

        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing assignment message:', error);
        
        // Retry logic: nack without requeueing pushes it to DLQ, or with requeueing retries it.
        // We push to DLX by nacking with requeue=false
        channel.nack(msg, false, false);
      }
    });

    logger.info('Assignment consumer started');
  } catch (error) {
    logger.error('Failed to start assignment consumer:', error);
  }
};
