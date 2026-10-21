import { Router } from 'express';
import { OppertunityController } from '../controllers/OppertunityController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/createoppertunity', authenticateToken, OppertunityController.createOppertunity);
router.put('/updateoppertunity', authenticateToken, OppertunityController.updateOppertunity);
router.get('/getoppertunitybyID', optionalAuthenticateToken, OppertunityController.getOppertunityById);
router.get('/getoppertunitiesbystatus', optionalAuthenticateToken, OppertunityController.getOppertunitiesbyoppertunityStatus);
export default router;      