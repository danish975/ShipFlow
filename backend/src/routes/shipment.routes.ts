import { Router } from 'express';
import {
  createShipment,
  getShipments,
  getShipmentById,
  trackByNumber,
  updateStatus,
  assignAgent,
  cancelShipment,
} from '../controllers/shipment.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import { z } from 'zod';

const router = Router();

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const createShipmentSchema = z.object({
  body: z.object({
    pickupAddress: addressSchema,
    deliveryAddress: addressSchema,
    packageDetails: z.object({
      weight: z.number().min(0.1),
      dimensions: z.string().min(1),
      description: z.string().min(1),
      category: z.enum(['electronics', 'clothing', 'food', 'furniture', 'documents', 'fragile', 'other']),
    }),
    estimatedDelivery: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['CREATED', 'VALIDATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELLED', 'RETURNED']),
    recipientName: z.string().optional(),
    otp: z.string().optional(),
  }),
});

const assignAgentSchema = z.object({
  body: z.object({
    agentId: z.string().min(1),
  }),
});

/**
 * @swagger
 * /shipments:
 *   post:
 *     tags: [Shipments]
 *     summary: Create a new shipment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickupAddress, deliveryAddress, packageDetails]
 *             properties:
 *               pickupAddress: { $ref: '#/components/schemas/Shipment/properties/pickupAddress' }
 *               deliveryAddress: { $ref: '#/components/schemas/Shipment/properties/deliveryAddress' }
 *               packageDetails: { $ref: '#/components/schemas/Shipment/properties/packageDetails' }
 *               estimatedDelivery: { type: string, format: date-time }
 *     responses:
 *       201: { description: Shipment created }
 *       400: { description: Validation error }
 */
router.post('/', authenticate, authorize(UserRole.CUSTOMER), validate(createShipmentSchema), createShipment);

/**
 * @swagger
 * /shipments:
 *   get:
 *     tags: [Shipments]
 *     summary: Get shipments (filtered by role)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: sortBy, schema: { type: string } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc] } }
 *     responses:
 *       200: { description: List of shipments }
 */
router.get('/', authenticate, getShipments);

/**
 * @swagger
 * /shipments/track/{trackingNumber}:
 *   get:
 *     tags: [Shipments]
 *     summary: Track a shipment by tracking number
 *     parameters:
 *       - { in: path, name: trackingNumber, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Shipment tracking info }
 *       404: { description: Shipment not found }
 */
router.get('/track/:trackingNumber', trackByNumber);

/**
 * @swagger
 * /shipments/{id}:
 *   get:
 *     tags: [Shipments]
 *     summary: Get shipment by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Shipment details }
 *       404: { description: Shipment not found }
 */
router.get('/:id', authenticate, getShipmentById);

/**
 * @swagger
 * /shipments/{id}/status:
 *   patch:
 *     tags: [Shipments]
 *     summary: Update shipment status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED] }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/:id/status', authenticate, authorize(UserRole.AGENT, UserRole.ADMIN, UserRole.OPERATIONS_MANAGER as any), validate(updateStatusSchema), updateStatus);

/**
 * @swagger
 * /shipments/{id}/assign:
 *   patch:
 *     tags: [Shipments]
 *     summary: Assign a delivery agent to a shipment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agentId]
 *             properties:
 *               agentId: { type: string }
 *     responses:
 *       200: { description: Agent assigned }
 */
router.patch('/:id/assign', authenticate, authorize(UserRole.ADMIN), validate(assignAgentSchema), assignAgent);

/**
 * @swagger
 * /shipments/{id}:
 *   delete:
 *     tags: [Shipments]
 *     summary: Cancel a shipment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Shipment cancelled }
 */
router.delete('/:id', authenticate, cancelShipment);

export default router;
