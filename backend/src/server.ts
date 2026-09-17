import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { connectDB } from './config/db';
import { rabbitmqConnection } from './config/rabbitmq';
import { setupQueues } from './queues/setup';
import { setupSocketIO } from './sockets';
import { startNotificationConsumer } from './consumers/notification.consumer';
import { startTrackingConsumer } from './consumers/tracking.consumer';
import { startAnalyticsConsumer } from './consumers/analytics.consumer';
import { startAssignmentConsumer } from './consumers/assignment.consumer';
import { startExceptionConsumer } from './consumers/exception.consumer';
import { startSLAConsumer } from './consumers/sla.consumer';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import shipmentRoutes from './routes/shipment.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import agentRoutes from './routes/agent.routes';
import exceptionRoutes from './routes/exception.routes';
import slaRoutes from './routes/sla.routes';

const app = express();
const server = http.createServer(app);

// ─── Security Middleware ───────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ───────────────────────────────────────────
if (!env.isTest) {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
    skip: (req) => req.url === '/health',
  }));
}

// ─── Rate Limiting ─────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── API Documentation ────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ShipFlow API Documentation',
}));

// ─── Health Endpoints ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health/db', async (_req, res) => {
  try {
    const mongoose = await import('mongoose');
    const state = mongoose.default.connection.readyState;
    const states: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
      status: state === 1 ? 'ok' : 'error',
      connection: states[state] || 'unknown',
    });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

app.get('/health/rabbitmq', (_req, res) => {
  const connected = rabbitmqConnection.isConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    connected,
  });
});

// ─── API Routes ────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/exceptions', exceptionRoutes);
app.use('/api/v1/sla', slaRoutes);

// ─── 404 Handler ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
});

// ─── Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to RabbitMQ and setup queues (optional — skip if not configured)
    await rabbitmqConnection.connect();
    if (rabbitmqConnection.isConnected()) {
      await setupQueues();

      // Start consumers
      await startNotificationConsumer();
      await startTrackingConsumer();
      await startAnalyticsConsumer();
      await startAssignmentConsumer();
      await startExceptionConsumer();
      await startSLAConsumer();
    } else {
      logger.warn('RabbitMQ not connected — event queues and consumers disabled');
    }

    // Setup Socket.IO
    setupSocketIO(server);

    // Start HTTP server
    server.listen(env.port, () => {
      logger.info(`🚀 ShipFlow API running on port ${env.port}`);
      logger.info(`📚 API Docs: http://localhost:${env.port}/api-docs`);
      logger.info(`🏥 Health: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await rabbitmqConnection.close();
    const { disconnectDB } = await import('./config/db');
    await disconnectDB();
    logger.info('Server shut down gracefully');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

export { app, server };
