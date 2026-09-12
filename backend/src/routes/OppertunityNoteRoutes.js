import { Router } from 'express';
import { OppertunityNoteController } from '../controllers/OppertunityNoteController.js';

const router = Router();

router.post('/createoppertunitynote', OppertunityNoteController.createOppertunityNote);
router.put('/updateoppertunitynote', OppertunityNoteController.updateOppertunityNote);
router.get('/getoppertunitynotebyid', OppertunityNoteController.getOppertunityNoteById);

export default router;