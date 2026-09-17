import { rabbitmqConnection } from '../config/rabbitmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Sets up all RabbitMQ exchanges, queues, and bindings.
 * Uses a topic exchange for flexible routing.
 */
export const setupQueues = async (): Promise<void> => {
  const channel = rabbitmqConnection.getChannel();

  // ── Dead Letter Exchange & Queue ──────────────────────
  await channel.assertExchange(env.rabbitmqDlx, 'direct', { durable: true });
  await channel.assertQueue(env.rabbitmqDlq, {
    durable: true,
    arguments: {
      'x-message-ttl': 86400000, // 24 hours
    },
  });
  await channel.bindQueue(env.rabbitmqDlq, env.rabbitmqDlx, 'dead-letter');

  logger.info('Dead letter exchange and queue configured');

  // ── Main Exchange ─────────────────────────────────────
  await channel.assertExchange(env.rabbitmqExchange, 'topic', { durable: true });

  // ── Notification Queue ────────────────────────────────
  await channel.assertQueue(env.rabbitmqNotificationQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': env.rabbitmqDlx,
      'x-dead-letter-routing-key': 'dead-letter',
    },
  });
  // Bind to all shipment events
  await channel.bindQueue(env.rabbitmqNotificationQueue, env.rabbitmqExchange, 'shipment.*');

  // ── Tracking Queue ────────────────────────────────────
  await channel.assertQueue(env.rabbitmqTrackingQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': env.rabbitmqDlx,
      'x-dead-letter-routing-key': 'dead-letter',
    },
  });
  await channel.bindQueue(env.rabbitmqTrackingQueue, env.rabbitmqExchange, 'shipment.*');

  await channel.assertQueue(env.rabbitmqAnalyticsQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': env.rabbitmqDlx,
      'x-dead-letter-routing-key': 'dead-letter',
    },
  });
  await channel.bindQueue(env.rabbitmqAnalyticsQueue, env.rabbitmqExchange, 'shipment.*');

  // ── Exception Queue ───────────────────────────────────
  await channel.assertQueue(env.rabbitmqExceptionQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': env.rabbitmqDlx,
      'x-dead-letter-routing-key': 'dead-letter',
    },
  });
  // Listen to failure events
  await channel.bindQueue(env.rabbitmqExceptionQueue, env.rabbitmqExchange, 'shipment.delivery_failed');
  await channel.bindQueue(env.rabbitmqExceptionQueue, env.rabbitmqExchange, 'shipment.cancelled');

  // ── SLA Queue ─────────────────────────────────────────
  await channel.assertQueue(env.rabbitmqSlaQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': env.rabbitmqDlx,
      'x-dead-letter-routing-key': 'dead-letter',
    },
  });
  await channel.bindQueue(env.rabbitmqSlaQueue, env.rabbitmqExchange, 'shipment.sla_at_risk');
  await channel.bindQueue(env.rabbitmqSlaQueue, env.rabbitmqExchange, 'shipment.sla_breached');

  // ── Assignment Queue ──────────────────────────────────
  await channel.assertQueue(env.rabbitmqAssignmentQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': env.rabbitmqDlx,
      'x-dead-letter-routing-key': 'dead-letter',
    },
  });
  // Listen to shipment.validated to auto-assign
  await channel.bindQueue(env.rabbitmqAssignmentQueue, env.rabbitmqExchange, 'shipment.validated');

  logger.info('All RabbitMQ queues and bindings configured');
};
