import { Router } from 'express';
import { getAssignedShipments, getAgentStats } from '../controllers/agent.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate, authorize(UserRole.AGENT));

/**
 * @swagger
 * /agent/shipments:
 *   get:
 *     tags: [Agent]
 *     summary: Get assigned shipments for delivery agent
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of assigned shipments }
 */
router.get('/shipments', getAssignedShipments);

/**
 * @swagger
 * /agent/stats:
 *   get:
 *     tags: [Agent]
 *     summary: Get agent delivery statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Agent stats }
 */
router.get('/stats', getAgentStats);

export default router;
