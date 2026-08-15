import amqp, { Connection, Channel } from 'amqplib';
import { env } from './env';
import { logger } from '../utils/logger';

class RabbitMQConnection {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(env.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(10);

      this.reconnectAttempts = 0;
      this.isConnecting = false;
      logger.info('RabbitMQ connected');

      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed. Attempting reconnection...');
        this.channel = null;
        this.connection = null;
        this.reconnect();
      });
    } catch (error) {
      this.isConnecting = false;
      logger.error('RabbitMQ connection failed:', error);
      await this.reconnect();
    }
  }

  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('RabbitMQ max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    logger.info(`RabbitMQ reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    await new Promise((resolve) => setTimeout(resolve, delay));
    await this.connect();
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available. Ensure connection is established.');
    }
    return this.channel;
  }

  getConnection(): Connection {
    if (!this.connection) {
      throw new Error('RabbitMQ connection not available.');
    }
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.channel = null;
      this.connection = null;
      logger.info('RabbitMQ connection closed gracefully');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export const rabbitmqConnection = new RabbitMQConnection();
