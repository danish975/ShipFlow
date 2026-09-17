import api from './api';
import { ApiResponse, AgentStatsData, IShipment } from '../types';

export const agentApi = {
  getShipments: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ shipments: IShipment[] }>>('/agent/shipments', { params }),

  getStats: () =>
    api.get<ApiResponse<AgentStatsData>>('/agent/stats'),
};
