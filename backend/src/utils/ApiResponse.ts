import { Response } from 'express';
import { PaginationMeta } from '../types';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, meta?: PaginationMeta): void {
    const response: Record<string, unknown> = {
      success: true,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T): void {
    ApiResponse.success(res, data, 201);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  static error(res: Response, statusCode: number, message: string, code: string): void {
    res.status(statusCode).json({
      success: false,
      message,
      code,
    });
  }
}
