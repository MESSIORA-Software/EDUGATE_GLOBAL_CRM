import { Router } from 'express';
import { workerAuth } from '../middleware/workerAuth.js';
import { NotificationProcessorController } from '../controllers/NotificationProcessorController.js';

const router = Router();

// Bearer NOTIFICATION_WORKER_SECRET required; NOT reachable with a user JWT.
router.use(workerAuth);

router.post('/process', NotificationProcessorController.process);
router.post('/requeue-failed', NotificationProcessorController.requeueFailed);

export default router;
