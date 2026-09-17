import { Router } from 'express';
import { getExceptions, resolveException } from '../controllers/exception.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

// Only Admin and Operations Manager can access these routes
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.OPERATIONS_MANAGER as any));

router.get('/', getExceptions);
router.patch('/:id/resolve', resolveException);

export default router;
