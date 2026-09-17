import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let memoryServer: unknown = null;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch {
    logger.warn('MongoDB connection failed, falling back to in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      memoryServer = mongod;
      const uri = mongod.getUri();

      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
      });

      logger.info(`In-memory MongoDB connected: ${conn.connection.host}`);
    } catch (memError) {
      logger.error('In-memory MongoDB failed:', memError);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await (memoryServer as { stop: () => Promise<void> }).stop();
  }
  logger.info('MongoDB disconnected');
};

