import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Shipment } from '../models/Shipment';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { generateTrackingNumber } from '../utils/tracking';
import { isValidTransition, canCancel, getValidNextStatuses } from '../services/shipment.service';
import { publishShipmentEvent } from '../producers/shipment.producer';
import { ShipmentStatus, UserRole, PaginationMeta } from '../types';

export const createShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { pickupAddress, deliveryAddress, packageDetails, estimatedDelivery } = req.body;
    const trackingNumber = generateTrackingNumber();

    const shipment = await Shipment.create({
      trackingNumber,
      customerId: req.user.userId,
      pickupAddress,
      deliveryAddress,
      packageDetails,
      status: ShipmentStatus.CREATED,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
    });

    // Publish event to RabbitMQ
    await publishShipmentEvent(
      shipment._id.toString(),
      shipment.trackingNumber,
      req.user.userId,
      ShipmentStatus.CREATED
    );

    ApiResponse.created(res, { shipment });
  } catch (error) {
    next(error);
  }
};

export const getShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Role-based filtering
    if (req.user.role === UserRole.CUSTOMER) {
      filter.customerId = req.user.userId;
    } else if (req.user.role === UserRole.AGENT) {
      filter.deliveryAgentId = req.user.userId;
    }
    // Admin sees all

    if (status && Object.values(ShipmentStatus).includes(status as ShipmentStatus)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.city': { $regex: search, $options: 'i' } },
        { 'pickupAddress.city': { $regex: search, $options: 'i' } },
      ];
    }

    const [shipments, total] = await Promise.all([
      Shipment.find(filter)
        .populate('customerId', 'name email')
        .populate('deliveryAgentId', 'name email phone')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Shipment.countDocuments(filter),
    ]);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    ApiResponse.success(res, { shipments }, 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getShipmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const shipment = await Shipment.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('deliveryAgentId', 'name email phone');

    if (!shipment) {
      throw ApiError.notFound('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    // Authorization check
    const isOwner = shipment.customerId._id.toString() === req.user.userId;
    const isAssignedAgent = shipment.deliveryAgentId?._id?.toString() === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      throw ApiError.forbidden('Not authorized to view this shipment');
    }

    ApiResponse.success(res, { shipment, validNextStatuses: getValidNextStatuses(shipment.status) });
  } catch (error) {
    next(error);
  }
};

export const trackByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('customerId', 'name')
      .populate('deliveryAgentId', 'name');

    if (!shipment) {
      throw ApiError.notFound('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    // Import ShipmentEvent to get history
    const { ShipmentEvent } = await import('../models/ShipmentEvent');
    const events = await ShipmentEvent.find({ shipmentId: shipment._id }).sort({ createdAt: 1 }).lean();

    ApiResponse.success(res, { shipment, events });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { status } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      throw ApiError.notFound('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    // Authorization: only assigned agent or admin can update status
    const isAssignedAgent = shipment.deliveryAgentId?.toString() === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isAssignedAgent && !isAdmin) {
      throw ApiError.forbidden('Not authorized to update this shipment');
    }

    // Validate status transition
    if (!isValidTransition(shipment.status, status as ShipmentStatus)) {
      throw ApiError.badRequest(
        `Invalid status transition from ${shipment.status} to ${status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const previousStatus = shipment.status;
    shipment.status = status as ShipmentStatus;
    await shipment.save();

    // Publish event to RabbitMQ
    await publishShipmentEvent(
      shipment._id.toString(),
      shipment.trackingNumber,
      shipment.customerId.toString(),
      status as ShipmentStatus,
      previousStatus,
      shipment.deliveryAgentId?.toString()
    );

    ApiResponse.success(res, { shipment, validNextStatuses: getValidNextStatuses(shipment.status) });
  } catch (error) {
    next(error);
  }
};

export const assignAgent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { agentId } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      throw ApiError.notFound('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    if (shipment.status !== ShipmentStatus.CREATED) {
      throw ApiError.badRequest('Can only assign agent to newly created shipments', 'INVALID_ASSIGNMENT');
    }

    // Verify agent exists and has agent role
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== UserRole.AGENT) {
      throw ApiError.badRequest('Invalid delivery agent', 'INVALID_AGENT');
    }

    const previousStatus = shipment.status;
    shipment.deliveryAgentId = new mongoose.Types.ObjectId(agentId);
    shipment.status = ShipmentStatus.ASSIGNED;
    await shipment.save();

    await shipment.populate('deliveryAgentId', 'name email phone');

    // Publish event
    await publishShipmentEvent(
      shipment._id.toString(),
      shipment.trackingNumber,
      shipment.customerId.toString(),
      ShipmentStatus.ASSIGNED,
      previousStatus,
      agentId
    );

    ApiResponse.success(res, { shipment });
  } catch (error) {
    next(error);
  }
};

export const cancelShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      throw ApiError.notFound('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    // Only customer who owns it or admin can cancel
    const isOwner = shipment.customerId.toString() === req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('Not authorized to cancel this shipment');
    }

    if (!canCancel(shipment.status)) {
      throw ApiError.badRequest(
        `Cannot cancel shipment in ${shipment.status} status`,
        'CANNOT_CANCEL'
      );
    }

    const previousStatus = shipment.status;
    shipment.status = ShipmentStatus.CANCELLED;
    await shipment.save();

    // Publish event
    await publishShipmentEvent(
      shipment._id.toString(),
      shipment.trackingNumber,
      shipment.customerId.toString(),
      ShipmentStatus.CANCELLED,
      previousStatus,
      shipment.deliveryAgentId?.toString()
    );

    ApiResponse.success(res, { shipment });
  } catch (error) {
    next(error);
  }
};
