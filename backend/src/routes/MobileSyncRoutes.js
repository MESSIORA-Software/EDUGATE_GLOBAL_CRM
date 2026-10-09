import { Router } from 'express';
import { MobileSyncController } from '../controllers/MobileSyncController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Requires Staff JWT Token
router.use(authenticateToken);

router.post('/sync-calls', MobileSyncController.syncCalls);
router.post('/sync-sms', MobileSyncController.syncSms);

export default router;
