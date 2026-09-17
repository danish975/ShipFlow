import { Shipment } from '../models/Shipment';
import { ShipmentStatus } from '../types';

export class SLAService {
  static async getSLAMetrics() {
    const totalShipments = await Shipment.countDocuments();
    
    // Delivered shipments
    const deliveredShipments = await Shipment.find({ status: ShipmentStatus.DELIVERED });
    let onTime = 0;
    let breached = 0;
    
    for (const shipment of deliveredShipments) {
      if (shipment.deliveryTime && shipment.createdAt) {
        const hoursTaken = (shipment.deliveryTime.getTime() - shipment.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursTaken <= (shipment.slaTargetHours || 72)) {
          onTime++;
        } else {
          breached++;
        }
      }
    }

    // Active shipments at risk
    const now = new Date();
    const activeShipments = await Shipment.find({ 
      status: { $nin: [ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED, ShipmentStatus.RETURNED] }
    });
    
    let atRisk = 0;
    for (const shipment of activeShipments) {
      const targetTime = new Date(shipment.createdAt.getTime() + (shipment.slaTargetHours || 72) * 60 * 60 * 1000);
      const hoursRemaining = (targetTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // If less than 12 hours remaining and not delivered, it's at risk
      if (hoursRemaining > 0 && hoursRemaining <= 12) {
        atRisk++;
      } else if (hoursRemaining <= 0) {
        breached++;
      }
    }

    const totalCalculated = onTime + breached;
    const compliancePercentage = totalCalculated > 0 ? (onTime / totalCalculated) * 100 : 100;

    return {
      totalShipments,
      onTimeShipments: onTime,
      atRiskShipments: atRisk,
      breachedShipments: breached,
      compliancePercentage: Math.round(compliancePercentage * 100) / 100,
    };
  }
}
