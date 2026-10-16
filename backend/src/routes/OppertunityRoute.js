import { Router } from 'express';
import { OppertunityController } from '../controllers/OppertunityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// All opportunity endpoints require JWT authentication. The actor
// (created_by / updated_by) is derived from the token, never from the body.
router.use(authenticateToken);

router.post('/createoppertunity', OppertunityController.createOppertunity);
router.put('/updateoppertunity', OppertunityController.updateOppertunity);
router.get('/getoppertunitybyID', OppertunityController.getOppertunityById);
router.get('/getoppertunitiesbystatus', OppertunityController.getOppertunitiesbyoppertunityStatus);
export default router;      