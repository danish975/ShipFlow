import mongoose, { Schema } from 'mongoose';
import { IShipmentEvent, ShipmentEventType, ShipmentStatus } from '../types';

const shipmentEventSchema = new Schema<IShipmentEvent>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(ShipmentEventType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ShipmentStatus),
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

shipmentEventSchema.index({ shipmentId: 1, createdAt: -1 });
shipmentEventSchema.index({ eventType: 1 });

export const ShipmentEvent = mongoose.model<IShipmentEvent>('ShipmentEvent', shipmentEventSchema);
