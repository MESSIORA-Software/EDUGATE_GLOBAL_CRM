import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();


router.post('/login', authController.login);
router.get('/viewmyprofile', authenticateToken, authController.getMe);

export default router;
