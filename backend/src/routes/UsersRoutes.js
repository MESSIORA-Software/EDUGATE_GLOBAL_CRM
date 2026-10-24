import { Router } from 'express';
import { usersController } from '../controllers/UsersController.js';
import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/role/:role_id', usersController.getUsersByRole);
router.get('/role', usersController.getUsersByRole);
router.get('/', usersController.getAll);
router.get('/user', usersController.getUserById);
router.post('/', usersController.createuser);
router.put('/', optionalAuthenticateToken, usersController.updateuser);
router.delete('/', usersController.deleteuser);
router.get('/branch', usersController.findUsersByBranch);
export default router;