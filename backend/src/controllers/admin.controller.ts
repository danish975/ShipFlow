import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Shipment } from '../models/Shipment';
import { ShipmentEvent } from '../models/ShipmentEvent';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { ShipmentStatus, PaginationMeta } from '../types';
import { getAnalyticsCounters } from '../consumers/analytics.consumer';

export const getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalShipments,
      statusCounts,
      totalCustomers,
      totalAgents,
      recentShipments,
      recentEvents,
      monthlyData,
    ] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'agent' }),
      Shipment.find()
        .populate('customerId', 'name email')
        .populate('deliveryAgentId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      ShipmentEvent.find()
        .populate('shipmentId', 'trackingNumber')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Shipment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    const statusDistribution: Record<string, number> = {};
    statusCounts.forEach((item: { _id: string; count: number }) => {
      statusDistribution[item._id] = item.count;
    });

    const activeStatuses = [
      ShipmentStatus.CREATED,
      ShipmentStatus.ASSIGNED,
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
    ];
    const activeShipments = activeStatuses.reduce(
      (sum, s) => sum + (statusDistribution[s] || 0),
      0
    );

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = monthlyData.map((item: { _id: { year: number; month: number }; count: number }) => ({
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      count: item.count,
    }));

    ApiResponse.success(res, {
      totalShipments,
      activeShipments,
      deliveredShipments: statusDistribution[ShipmentStatus.DELIVERED] || 0,
      cancelledShipments: statusDistribution[ShipmentStatus.CANCELLED] || 0,
      totalCustomers,
      totalAgents,
      statusDistribution,
      recentShipments,
      recentEvents,
      monthlyStats: monthlyStats.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const meta: PaginationMeta = { page, limit, total, totalPages: Math.ceil(total / limit) };
    ApiResponse.success(res, { users }, 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getAllShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.city': { $regex: search, $options: 'i' } },
      ];
    }

    const [shipments, total] = await Promise.all([
      Shipment.find(filter)
        .populate('customerId', 'name email')
        .populate('deliveryAgentId', 'name email phone')
        .sort({ createdAt: -1 })
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

export const getAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const counters = getAnalyticsCounters();

    // Get delivery time stats
    const deliveryStats = await Shipment.aggregate([
      { $match: { status: ShipmentStatus.DELIVERED } },
      {
        $project: {
          deliveryTime: { $subtract: ['$updatedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          avgDeliveryTime: { $avg: '$deliveryTime' },
          minDeliveryTime: { $min: '$deliveryTime' },
          maxDeliveryTime: { $max: '$deliveryTime' },
          totalDelivered: { $sum: 1 },
        },
      },
    ]);

    // Daily shipment counts for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyShipments = await Shipment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category distribution
    const categoryDistribution = await Shipment.aggregate([
      { $group: { _id: '$packageDetails.category', count: { $sum: 1 } } },
    ]);

    ApiResponse.success(res, {
      eventCounters: counters,
      deliveryStats: deliveryStats[0] || {
        avgDeliveryTime: 0,
        minDeliveryTime: 0,
        maxDeliveryTime: 0,
        totalDelivered: 0,
      },
      dailyShipments,
      categoryDistribution,
    });
  } catch (error) {
    next(error);
  }
};
