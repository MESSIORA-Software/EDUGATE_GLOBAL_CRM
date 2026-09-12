import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';

const router = Router();

// Fetch Users According to the branch (GET /api/users/branch)
router.get('/branch', UserController.getUsersByBranch);
router.get('/branch/:branch_id', UserController.getUsersByBranch);

// Fetch All Users
router.get('/', UserController.getAllUsers);

export default router;
