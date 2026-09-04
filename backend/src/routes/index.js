import { Router } from 'express';
import UserRoleRoutes from './UserRoleRoutes.js';

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

export default router;
