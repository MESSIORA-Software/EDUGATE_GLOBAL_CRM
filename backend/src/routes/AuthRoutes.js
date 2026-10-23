import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();


router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-password', optionalAuthenticateToken, authController.verifyPassword);
router.get('/viewmyprofile', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);

export default router;
