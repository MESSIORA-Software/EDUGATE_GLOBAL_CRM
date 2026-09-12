import { BranchRepository } from '../repositories/BranchRepository.js';

export const BranchService = {
    async getAllBranches() {
        return await BranchRepository.findAll();
    },

    async getBranchById(branchId) {
        if (!branchId) {
            const error = new Error('Branch ID is required.');
            error.statusCode = 400;
            throw error;
        }

        const branch = await BranchRepository.findById(branchId);
        if (!branch) {
            const error = new Error(`Branch with ID '${branchId}' not found.`);
            error.statusCode = 404;
            throw error;
        }

        return branch;
    },

    async createBranch({ name, address, phone }) {
        if (!name || !address || !phone) {
            const error = new Error('Fields "name", "address", and "phone" are required.');
            error.statusCode = 400;
            throw error;
        }

        return await BranchRepository.create({
            name: name.trim(),
            address: address.trim(),
            phone: phone.trim(),
        });
    },

    async updateBranch(branchId, { name, address, phone }) {
        if (!branchId) {
            const error = new Error('Field "branch_id" is required for updating branch.');
            error.statusCode = 400;
            throw error;
        }

        if (!name || !address || !phone) {
            const error = new Error('Fields "name", "address", and "phone" are required for updating branch.');
            error.statusCode = 400;
            throw error;
        }

        const updatedBranch = await BranchRepository.update(branchId, {
            name: name.trim(),
            address: address.trim(),
            phone: phone.trim(),
        });

        return updatedBranch;
    },

    async deleteBranch(branchId) {
        if (!branchId) {
            const error = new Error('Branch ID is required for deletion.');
            error.statusCode = 400;
            throw error;
        }

        return await BranchRepository.delete(branchId);
    }
};
