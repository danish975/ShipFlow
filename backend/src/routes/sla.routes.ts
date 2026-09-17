import { Router } from 'express';
import { SLAService } from '../services/sla.service';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.OPERATIONS_MANAGER as any));

router.get('/metrics', async (req, res, next) => {
  try {
    const metrics = await SLAService.getSLAMetrics();
    ApiResponse.success(res, metrics);
  } catch (error) {
    next(error);
  }
});

export default router;
