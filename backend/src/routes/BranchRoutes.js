import { Router } from 'express';
import { BranchController } from '../controllers/BranchController.js';

const router = Router();

router.post('/createbranch', BranchController.createBranch);
router.get('/allbranches', BranchController.getAllBranches);
router.get('/branch/:branch_id', BranchController.getBranchById);
router.put('/updatebranch', BranchController.updateBranch);
router.delete('/deletebranch/:branch_id', BranchController.deleteBranch);
export default router;
