import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { PaginationMeta } from '../types';

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: req.user.userId };

    if (req.query.unreadOnly === 'true') {
      filter.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.userId, read: false }),
    ]);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    ApiResponse.success(res, { notifications, unreadCount }, 200, meta);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }

    ApiResponse.success(res, { notification });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );

    ApiResponse.success(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
