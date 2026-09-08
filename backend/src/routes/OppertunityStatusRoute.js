import { Router } from 'express';
import { OppertunityStatusController } from '../controllers/OppertunityStatusControllers.js';

const router = Router();

router.post('/createoppertunitystatus', OppertunityStatusController.createOppertunityStatus);
router.get('/getalloppertunitystatuses', OppertunityStatusController.getAllOppertunityStatuses);
router.put('/updateoppertunitystatus', OppertunityStatusController.updateOppertunityStatus);
router.delete('/deleteoppertunitystatus', OppertunityStatusController.deleteOppertunityStatus);

export default router;      