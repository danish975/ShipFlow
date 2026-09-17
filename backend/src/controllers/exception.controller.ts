import { Request, Response, NextFunction } from 'express';
import { Exception, ExceptionStatus } from '../models/Exception';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { UserRole } from '../types';

export const getExceptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const skip = (Number(page) - 1) * Number(limit);

    const [exceptions, total] = await Promise.all([
      Exception.find(filter)
        .populate('shipmentId', 'trackingNumber status')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Exception.countDocuments(filter)
    ]);

    ApiResponse.success(res, { exceptions }, 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const resolveException = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.OPERATIONS_MANAGER)) {
      throw ApiError.forbidden('Not authorized to resolve exceptions');
    }

    const exception = await Exception.findById(id);
    if (!exception) {
      throw ApiError.notFound('Exception not found');
    }

    exception.status = ExceptionStatus.RESOLVED;
    exception.resolutionNotes = resolutionNotes;
    exception.resolvedAt = new Date();
    exception.resolvedBy = req.user.userId as any;
    
    await exception.save();

    ApiResponse.success(res, { exception });
  } catch (error) {
    next(error);
  }
};
