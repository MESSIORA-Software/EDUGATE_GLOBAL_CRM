import { Router } from 'express';
import { OppertunityController } from '../controllers/OppertunityController.js';

const router = Router();

router.post('/createoppertunity', OppertunityController.createOppertunity);
router.put('/updateoppertunity', OppertunityController.updateOppertunity);
router.get('/getoppertunitybyID', OppertunityController.getOppertunityById);
router.get('/getoppertunitiesbystatus', OppertunityController.getOppertunitiesbyoppertunityStatus);
export default router;      