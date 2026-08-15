import { Request, Response, NextFunction } from 'express';
import { Shipment } from '../models/Shipment';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { ShipmentStatus, PaginationMeta } from '../types';

export const getAssignedShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: Record<string, unknown> = {
      deliveryAgentId: req.user.userId,
    };

    if (status) {
      filter.status = status;
    }

    const [shipments, total] = await Promise.all([
      Shipment.find(filter)
        .populate('customerId', 'name email phone')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Shipment.countDocuments(filter),
    ]);

    const meta: PaginationMeta = { page, limit, total, totalPages: Math.ceil(total / limit) };
    ApiResponse.success(res, { shipments }, 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getAgentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const statusCounts = await Shipment.aggregate([
      { $match: { deliveryAgentId: req.user.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats: Record<string, number> = {};
    statusCounts.forEach((item: { _id: string; count: number }) => {
      stats[item._id] = item.count;
    });

    // Today's tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysTasks = await Shipment.find({
      deliveryAgentId: req.user.userId,
      status: { $in: [ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY] },
      updatedAt: { $gte: todayStart },
    })
      .populate('customerId', 'name email phone')
      .sort({ updatedAt: -1 })
      .lean();

    const activeStatuses = [
      ShipmentStatus.ASSIGNED,
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
    ];

    ApiResponse.success(res, {
      assigned: stats[ShipmentStatus.ASSIGNED] || 0,
      pickedUp: stats[ShipmentStatus.PICKED_UP] || 0,
      inTransit: stats[ShipmentStatus.IN_TRANSIT] || 0,
      outForDelivery: stats[ShipmentStatus.OUT_FOR_DELIVERY] || 0,
      delivered: stats[ShipmentStatus.DELIVERED] || 0,
      totalActive: activeStatuses.reduce((sum, s) => sum + (stats[s] || 0), 0),
      todaysTasks,
    });
  } catch (error) {
    next(error);
  }
};
