import { Router } from 'express';
import UserRoleRoutes from './UserRoleRoutes.js';
import UsersRoutes from './UsersRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Edugate CRM Backend API is running smoothly',
        timestamp: new Date().toISOString(),
    });
});

// User Role Endpoint
router.use('/roles', UserRoleRoutes);
router.use('/users', UsersRoutes);
export default router;
