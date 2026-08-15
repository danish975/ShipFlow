export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): ApiError {
    return new ApiError(400, message, code);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN'): ApiError {
    return new ApiError(403, message, code);
  }

  static notFound(message: string, code = 'NOT_FOUND'): ApiError {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code = 'CONFLICT'): ApiError {
    return new ApiError(409, message, code);
  }

  static tooMany(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED'): ApiError {
    return new ApiError(429, message, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(500, message, code, false);
  }
}
