import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  // Log error (without sensitive info)
  logger.error('Error:', {
    message: err.message,
    code: err instanceof ApiError ? err.code : 'UNKNOWN',
    stack: env.isDevelopment ? err.stack : undefined,
  });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: err.message,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Mongoose duplicate key error
  const isMongoDuplicate =
    err.name === 'MongoServerError' &&
    ((err as unknown as Record<string, unknown>).code === 11000 ||
      (err as unknown as Record<string, unknown>).code === 11001);

  if (isMongoDuplicate) {
    res.status(409).json({
      success: false,
      message: 'Duplicate field value',
      code: 'DUPLICATE_KEY',
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID',
    });
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    message: env.isProduction ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
};
