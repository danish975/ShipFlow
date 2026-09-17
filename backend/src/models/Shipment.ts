import mongoose, { Schema } from 'mongoose';
import { IShipment, ShipmentStatus } from '../types';

const addressSchema = new Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const packageDetailsSchema = new Schema(
  {
    weight: { type: Number, required: true, min: 0.1 },
    dimensions: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'clothing', 'food', 'furniture', 'documents', 'fragile', 'other'],
    },
  },
  { _id: false }
);

const shipmentSchema = new Schema<IShipment>(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deliveryAgentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    pickupAddress: {
      type: addressSchema,
      required: true,
    },
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },
    packageDetails: {
      type: packageDetailsSchema,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ShipmentStatus),
      default: ShipmentStatus.CREATED,
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(ShipmentStatus),
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: Schema.Types.Mixed, // ObjectId or string identifier
        },
        reason: {
          type: String,
        },
      }
    ],
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    pickupTime: {
      type: Date,
      default: null,
    },
    deliveryTime: {
      type: Date,
      default: null,
    },
    lastEventAt: {
      type: Date,
      default: Date.now,
    },
    automationMetadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    slaTargetHours: {
      type: Number,
      default: 72, // default 72 hours SLA
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
shipmentSchema.index({ customerId: 1, status: 1 });
shipmentSchema.index({ deliveryAgentId: 1, status: 1 });
shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ status: 1, createdAt: -1 });

export const Shipment = mongoose.model<IShipment>('Shipment', shipmentSchema);
