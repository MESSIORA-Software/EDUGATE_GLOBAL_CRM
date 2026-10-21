import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { NotificationValidator } from '../validators/NotificationValidator.js';
import { NotificationController } from '../controllers/NotificationController.js';

const router = Router();

router.use(authenticateToken);

router.get('/', NotificationValidator.validateList, NotificationController.list);
router.get('/unread-count', NotificationController.unreadCount);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationValidator.validateId, NotificationController.markRead);

export default router;
