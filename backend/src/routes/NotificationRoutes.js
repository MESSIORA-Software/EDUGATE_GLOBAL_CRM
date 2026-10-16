import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { NotificationValidator } from '../validators/NotificationValidator.js';
import { NotificationController } from '../controllers/NotificationController.js';

const router = Router();

// Every user may read their OWN notifications; all queries are scoped to req.user.
router.use(authenticateToken);

router.get('/', NotificationValidator.validateList, NotificationController.list);
router.get('/unread-count', NotificationController.unreadCount);
// Static path must be registered before the parameterized route.
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationValidator.validateId, NotificationController.markRead);

export default router;
