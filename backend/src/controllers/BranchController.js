import { BranchService } from '../services/BranchService.js';


export const BranchController = {

async createBranch(req, res, next) {
    try {
        const { name, address, phone } = req.body; 
        const newBranch = await BranchService.createBranch({ name, address, phone });
        res.status(201).json({
            status: 'success',
            message: 'Branch created successfully',
            data: newBranch,
        });
    }   catch (error) {
        next(error);
    }
},

async getAllBranches(req, res, next) {
    try {
        const branches = await BranchService.getAllBranches();
        res.status(200).json({
            status: 'success',
            message: 'Branches fetched successfully',
            data: branches,
        });
    } catch (error) {
        next(error);
    }
},

async getBranchById(req, res, next) {
    try {
        const { branch_id } = req.body;
      if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "branch_id" is required.',
                });
            }

        const branch = await BranchService.getBranchById(branch_id);
        res.status(200).json({
            status: 'success',
            count: branch.length,
            data: branch,
        });
    } catch (error) {
        next(error);
    }
},
 async updateBranch(req, res, next) {
        try {
            const { branch_id, name, address, phone } = req.body; 
            if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "branch_id" is required in request body.',
                });
            }
            const updatedBranch = await BranchService.updateBranch(branch_id, { name, address, phone });
            res.status(200).json({
                status: 'success',
                message: 'Branch updated successfully',
                data: updatedBranch,
            });
        } catch (error) {
            next(error);
        }   
    },
    
    async deleteBranch(req, res, next) {
        try {
            const { branch_id } = req.body;
             if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "branch_id" is required.',
                });
            }
            const deletedBranch = await BranchService.deleteBranch(branch_id);
            res.status(200).json({
                status: 'success',
                message: 'Branch deleted successfully',
                data: deletedBranch,
            });
        } catch (error) {
            next(error);
        }
    }



}
