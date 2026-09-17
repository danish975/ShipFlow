import api from './api';
import { ApiResponse, IShipment, IShipmentEvent, CreateShipmentFormData, ShipmentStatus } from '../types';

export const shipmentApi = {
  create: (data: CreateShipmentFormData) =>
    api.post<ApiResponse<{ shipment: IShipment }>>('/shipments', data),

  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ shipments: IShipment[] }>>('/shipments', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<{ shipment: IShipment; validNextStatuses: ShipmentStatus[] }>>(`/shipments/${id}`),

  track: (trackingNumber: string) =>
    api.get<ApiResponse<{ shipment: IShipment; events: IShipmentEvent[] }>>(`/shipments/track/${trackingNumber}`),

  updateStatus: (id: string, status: ShipmentStatus) =>
    api.patch<ApiResponse<{ shipment: IShipment; validNextStatuses: ShipmentStatus[] }>>(`/shipments/${id}/status`, { status }),

  assignAgent: (id: string, agentId: string) =>
    api.patch<ApiResponse<{ shipment: IShipment }>>(`/shipments/${id}/assign`, { agentId }),

  cancel: (id: string) =>
    api.delete<ApiResponse<{ shipment: IShipment }>>(`/shipments/${id}`),
};
