import { Shipment } from '../models/Shipment';
import { User } from '../models/User';
import { UserRole, ShipmentStatus } from '../types';
import { logger } from '../utils/logger';

export class AssignmentService {
  /**
   * Calculates a score for an agent based on workload and availability.
   * Simple algorithm for now: Lower active shipments = higher score.
   */
  static async findBestAgent(shipmentId: string): Promise<string | null> {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) return null;

    // Find all available agents (we'll just use all users with AGENT role for simplicity)
    const agents = await User.find({ role: UserRole.AGENT });
    if (agents.length === 0) {
      logger.warn('No agents available in the system for smart assignment');
      return null;
    }

    let bestAgent = null;
    let minWorkload = Infinity;

    for (const agent of agents) {
      // Calculate workload: count of active shipments assigned to this agent
      const activeShipments = await Shipment.countDocuments({
        deliveryAgentId: agent._id,
        status: { $in: [ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY] }
      });

      if (activeShipments < minWorkload) {
        minWorkload = activeShipments;
        bestAgent = agent;
      }
    }

    return bestAgent ? bestAgent._id.toString() : null;
  }
}
