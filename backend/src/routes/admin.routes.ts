import { Router } from 'express';
import { getDashboard, getUsers, getAllShipments, getAnalytics } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize(UserRole.ADMIN));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard statistics }
 *       403: { description: Admin access required }
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: role, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: List of users }
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /admin/shipments:
 *   get:
 *     tags: [Admin]
 *     summary: Get all shipments (admin view)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of all shipments }
 */
router.get('/shipments', getAllShipments);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get analytics data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Analytics statistics }
 */
router.get('/analytics', getAnalytics);

export default router;
