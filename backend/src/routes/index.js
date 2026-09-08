import { Router } from 'express';
import UserRoleRoutes from './UserRoleRoutes.js';
import UsersRoutes from './UsersRoutes.js';
import  AuthRoutes  from './AuthRoutes.js';
import BranchRoutes from './BranchRoutes.js';
import ClientRoutes from './ClientRoutes.js';
import  OppertunityStatusRoute from './OppertunityStatusRoute.js';

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
router.use('/auth', AuthRoutes);
router.use('/branches', BranchRoutes);
router.use('/clients', ClientRoutes);
router.use('/oppertunity-status', OppertunityStatusRoute);

export default router;
