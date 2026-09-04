import { Router } from 'express';
import { UserRoleController } from '../controllers/UserRoleController.js';
import { UserRoleValidator } from '../validators/UserRoleValidator.js';

const router = Router();

// 1. Get all roles
router.get('/', UserRoleController.getAll);

// 2. Get role by ID (reads role_id from req.body)
router.post('/find-by-id', UserRoleController.getById);

// 3. Create new role
router.post('/', UserRoleValidator.validateCreateRole, UserRoleController.create);

// 4. Update role (reads role_id & role_name from req.body)
router.put('/', UserRoleValidator.validateUpdateRole, UserRoleController.update);

// 5. Delete role (reads role_id from req.body)
router.delete('/', UserRoleController.delete);

export default router;
