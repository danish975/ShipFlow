import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeliveryProof extends Document {
  _id: Types.ObjectId;
  shipmentId: Types.ObjectId;
  agentId: Types.ObjectId;
  recipientName: string;
  otpVerified: boolean;
  timestamp: Date;
  signatureUrl?: string;
  photoUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const deliveryProofSchema = new Schema<IDeliveryProof>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      unique: true, // Only one proof per shipment
      index: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    signatureUrl: {
      type: String,
    },
    photoUrl: {
      type: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
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

export const DeliveryProof = mongoose.model<IDeliveryProof>('DeliveryProof', deliveryProofSchema);
