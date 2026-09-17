import mongoose, { Schema, Document, Types } from 'mongoose';

export enum ExceptionSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ExceptionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export interface IException extends Document {
  _id: Types.ObjectId;
  shipmentId: Types.ObjectId;
  type: string; // e.g., 'DELIVERY_FAILED', 'SLA_BREACHED', 'NO_DRIVER'
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  description: string;
  assignedTo?: Types.ObjectId; // Operations Manager ID
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const exceptionSchema = new Schema<IException>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(ExceptionSeverity),
      default: ExceptionSeverity.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ExceptionStatus),
      default: ExceptionStatus.OPEN,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

exceptionSchema.index({ status: 1, severity: 1 });
exceptionSchema.index({ createdAt: -1 });

export const Exception = mongoose.model<IException>('Exception', exceptionSchema);
