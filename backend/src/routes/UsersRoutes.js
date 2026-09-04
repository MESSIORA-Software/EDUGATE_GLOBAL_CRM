import { Router } from 'express';
import { usersController } from '../controllers/UsersController.js';

const router = Router();

router.get('/', usersController.getAll);
router.get('/user', usersController.getUserById);
router.post('/', usersController.createuser);
router.put('/', usersController.updateuser);
router.delete('/', usersController.deleteuser);

export default router;