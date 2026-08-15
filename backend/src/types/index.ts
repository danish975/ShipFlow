import { Document, Types } from 'mongoose';

// ─── Enums ─────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum ShipmentStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ShipmentEventType {
  CREATED = 'shipment.created',
  ASSIGNED = 'shipment.assigned',
  PICKED_UP = 'shipment.picked_up',
  IN_TRANSIT = 'shipment.in_transit',
  OUT_FOR_DELIVERY = 'shipment.out_for_delivery',
  DELIVERED = 'shipment.delivered',
  CANCELLED = 'shipment.cancelled',
}

export enum NotificationType {
  SHIPMENT_CREATED = 'shipment_created',
  SHIPMENT_ASSIGNED = 'shipment_assigned',
  SHIPMENT_PICKED_UP = 'shipment_picked_up',
  SHIPMENT_IN_TRANSIT = 'shipment_in_transit',
  SHIPMENT_OUT_FOR_DELIVERY = 'shipment_out_for_delivery',
  SHIPMENT_DELIVERED = 'shipment_delivered',
  SHIPMENT_CANCELLED = 'shipment_cancelled',
}

// ─── Interfaces ────────────────────────────────────────

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IPackageDetails {
  weight: number;
  dimensions: string;
  description: string;
  category: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IShipment extends Document {
  _id: Types.ObjectId;
  trackingNumber: string;
  customerId: Types.ObjectId;
  deliveryAgentId?: Types.ObjectId;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  packageDetails: IPackageDetails;
  status: ShipmentStatus;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipmentEvent extends Document {
  _id: Types.ObjectId;
  shipmentId: Types.ObjectId;
  eventType: ShipmentEventType;
  status: ShipmentStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  shipmentId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ─── API Types ─────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// ─── RabbitMQ Event ────────────────────────────────────

export interface ShipmentEventMessage {
  eventId: string;
  eventType: ShipmentEventType;
  shipmentId: string;
  trackingNumber: string;
  customerId: string;
  deliveryAgentId?: string;
  status: ShipmentStatus;
  previousStatus?: ShipmentStatus;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ─── Dashboard Types ───────────────────────────────────

export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  cancelledShipments: number;
  totalCustomers: number;
  totalAgents: number;
  statusDistribution: Record<string, number>;
  recentShipments: IShipment[];
  monthlyStats: Array<{ month: string; count: number }>;
}

export interface AgentStats {
  assigned: number;
  pickedUp: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  totalCompleted: number;
}
