import { BranchService } from '../services/BranchService.js';

export const BranchController = {
    // 1. Create Branch (POST /api/branches/createbranch)
    async createBranch(req, res, next) {
        try {
            const { name, address, phone } = req.body;
            const newBranch = await BranchService.createBranch({ name, address, phone });

            res.status(201).json({
                status: 'success',
                message: 'Branch created successfully',
                data: newBranch,
            });
        } catch (error) {
            next(error);
        }
    },

    // 2. Fetch All Branches (GET /api/branches/allbranches)
    async getAllBranches(req, res, next) {
        try {
            const branches = await BranchService.getAllBranches();

            res.status(200).json({
                status: 'success',
                count: branches.length,
                data: branches,
            });
        } catch (error) {
            next(error);
        }
    },

    // 3. Find Branch by ID (GET /api/branches/branch/:branch_id)
    async getBranchById(req, res, next) {
        try {
            const branch_id = req.params.branch_id || req.query.branch_id || req.body?.branch_id;

            if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Branch ID parameter is required.',
                });
            }

            const branch = await BranchService.getBranchById(branch_id);

            res.status(200).json({
                status: 'success',
                data: branch,
            });
        } catch (error) {
            next(error);
        }
    },

    // 4. Update Branch (POST /api/branches/updatebranch)
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

    // 5. Delete Branch (DELETE /api/branches/deletebranch/:branch_id)
    async deleteBranch(req, res, next) {
        try {
            const branch_id = req.params.branch_id || req.body?.branch_id || req.query.branch_id;

            if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Branch ID parameter is required.',
                });
            }

            await BranchService.deleteBranch(branch_id);

            res.status(200).json({
                status: 'success',
                message: `Branch '${branch_id}' deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    }
};
