import { Router } from 'express';
import UserRoleRoutes from './UserRoleRoutes.js';
import BranchRoutes from './BranchRoutes.js';
import UserRoutes from './UserRoutes.js';

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

// Branch CRUD Endpoints
router.use('/branches', BranchRoutes);

// User Endpoints (including branch filtering)
router.use('/users', UserRoutes);

export default router;

