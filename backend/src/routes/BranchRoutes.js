import { Router } from 'express';
import { BranchController } from '../controllers/BranchController.js';
import { BranchValidator } from '../validators/BranchValidator.js';

const router = Router();

// 1. Create Branch
router.post('/createbranch', BranchValidator.validateCreateBranch, BranchController.createBranch);

// 2. Fetch All Branch
router.get('/allbranches', BranchController.getAllBranches);

// 3. Find branch by ID
router.get('/branch/:branch_id', BranchController.getBranchById);
router.get('/branch', BranchController.getBranchById);
router.post('/branch', BranchController.getBranchById);

// 4. Update Branch
router.post('/updatebranch', BranchValidator.validateUpdateBranch, BranchController.updateBranch);
router.put('/updatebranch', BranchValidator.validateUpdateBranch, BranchController.updateBranch);

// 5. Delete Branch
router.delete('/deletebranch/:branch_id', BranchController.deleteBranch);
router.delete('/deletebranch', BranchController.deleteBranch);

export default router;
