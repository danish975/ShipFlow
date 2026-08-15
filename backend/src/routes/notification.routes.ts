import { Router } from 'express';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: unreadOnly, schema: { type: boolean } }
 *     responses:
 *       200: { description: List of notifications }
 */
router.get('/', authenticate, getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All notifications marked as read }
 */
router.patch('/read-all', authenticate, markAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Notification marked as read }
 */
router.patch('/:id/read', authenticate, markAsRead);

export default router;
