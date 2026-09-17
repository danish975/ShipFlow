// ─── Enums ─────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin',
  OPERATIONS_MANAGER = 'operations_manager',
}

export enum ShipmentStatus {
  CREATED = 'CREATED',
  VALIDATED = 'VALIDATED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
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

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IShipment {
  _id: string;
  trackingNumber: string;
  customerId: IUser | string;
  deliveryAgentId?: IUser | string | null;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  packageDetails: IPackageDetails;
  status: ShipmentStatus;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IShipmentEvent {
  _id: string;
  shipmentId: string;
  eventType: string;
  status: ShipmentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  shipmentId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── API Types ─────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
  code?: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface DashboardData {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  cancelledShipments: number;
  totalCustomers: number;
  totalAgents: number;
  statusDistribution: Record<string, number>;
  recentShipments: IShipment[];
  recentEvents: IShipmentEvent[];
  monthlyStats: Array<{ month: string; count: number }>;
}

export interface AnalyticsData {
  eventCounters: Record<string, number>;
  deliveryStats: {
    avgDeliveryTime: number;
    minDeliveryTime: number;
    maxDeliveryTime: number;
    totalDelivered: number;
  };
  dailyShipments: Array<{ _id: string; count: number }>;
  categoryDistribution: Array<{ _id: string; count: number }>;
}

export interface AgentStatsData {
  assigned: number;
  pickedUp: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  totalActive: number;
  todaysTasks: IShipment[];
}

// ─── Form Types ────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateShipmentFormData {
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  packageDetails: IPackageDetails;
  estimatedDelivery?: string;
}
