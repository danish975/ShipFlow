import dotenv from 'dotenv';
import { z } from 'zod';

import path from 'path';
import fs from 'fs';

const rootEnvPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RABBITMQ_URL: z.string().default(''),
  RABBITMQ_EXCHANGE: z.string().default('shipflow.events'),
  RABBITMQ_NOTIFICATION_QUEUE: z.string().default('shipflow.notifications'),
  RABBITMQ_TRACKING_QUEUE: z.string().default('shipflow.tracking'),
  RABBITMQ_ANALYTICS_QUEUE: z.string().default('shipflow.analytics'),
  RABBITMQ_EXCEPTION_QUEUE: z.string().default('shipflow.exceptions'),
  RABBITMQ_SLA_QUEUE: z.string().default('shipflow.sla'),
  RABBITMQ_ASSIGNMENT_QUEUE: z.string().default('shipflow.assignment'),
  RABBITMQ_DLX: z.string().default('shipflow.dlx'),
  RABBITMQ_DLQ: z.string().default('shipflow.dlq'),
  CLIENT_URL: z.string().default('http://localhost'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  mongodbUri: parsed.data.MONGODB_URI,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  rabbitmqUrl: parsed.data.RABBITMQ_URL,
  rabbitmqExchange: parsed.data.RABBITMQ_EXCHANGE,
  rabbitmqNotificationQueue: parsed.data.RABBITMQ_NOTIFICATION_QUEUE,
  rabbitmqTrackingQueue: parsed.data.RABBITMQ_TRACKING_QUEUE,
  rabbitmqAnalyticsQueue: parsed.data.RABBITMQ_ANALYTICS_QUEUE,
  rabbitmqExceptionQueue: parsed.data.RABBITMQ_EXCEPTION_QUEUE,
  rabbitmqSlaQueue: parsed.data.RABBITMQ_SLA_QUEUE,
  rabbitmqAssignmentQueue: parsed.data.RABBITMQ_ASSIGNMENT_QUEUE,
  rabbitmqDlx: parsed.data.RABBITMQ_DLX,
  rabbitmqDlq: parsed.data.RABBITMQ_DLQ,
  clientUrl: parsed.data.CLIENT_URL,
  rateLimitWindowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
  rateLimitMax: parseInt(parsed.data.RATE_LIMIT_MAX, 10),
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
};
