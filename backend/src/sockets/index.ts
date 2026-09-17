import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { JwtPayload } from '../types';
import { Shipment } from '../models/Shipment';

let io: SocketIOServer | null = null;

export const getSocketIO = (): SocketIOServer | null => io;

export const setupSocketIO = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware for Socket.IO
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      (socket as Socket & { user: JwtPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user;
    logger.info(`Socket connected: ${socket.id} (user: ${user.userId})`);

    // Join user-specific room for notifications
    socket.join(`user:${user.userId}`);

    // Join shipment tracking room (with authorization)
    socket.on('track:join', async (trackingNumber: string) => {
      try {
        const shipment = await Shipment.findOne({ trackingNumber });

        if (!shipment) {
          socket.emit('error', { message: 'Shipment not found' });
          return;
        }

        // Authorization: only the customer, assigned agent, or admin can track
        const isCustomer = shipment.customerId.toString() === user.userId;
        const isAgent = shipment.deliveryAgentId?.toString() === user.userId;
        const isAdmin = user.role === 'admin' || user.role === 'operations_manager';

        if (!isCustomer && !isAgent && !isAdmin) {
          socket.emit('error', { message: 'Not authorized to track this shipment' });
          return;
        }

        socket.join(`shipment:${trackingNumber}`);
        socket.emit('track:joined', { trackingNumber, status: shipment.status });
        logger.debug(`User ${user.userId} joined tracking room: shipment:${trackingNumber}`);
      } catch (error) {
        logger.error('Error joining tracking room:', error);
        socket.emit('error', { message: 'Failed to join tracking room' });
      }
    });

    // Leave shipment tracking room
    socket.on('track:leave', (trackingNumber: string) => {
      socket.leave(`shipment:${trackingNumber}`);
      logger.debug(`User ${user.userId} left tracking room: shipment:${trackingNumber}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  logger.info('Socket.IO configured');
  return io;
};
