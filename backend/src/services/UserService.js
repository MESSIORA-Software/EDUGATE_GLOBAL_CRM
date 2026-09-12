import { UserRepository } from '../repositories/UserRepository.js';

export const UserService = {
    async getUsersByBranch(branchId) {
        if (!branchId) {
            const error = new Error('Field "branch_id" is required.');
            error.statusCode = 400;
            throw error;
        }

        return await UserRepository.findByBranch(branchId);
    },

    async getAllUsers() {
        return await UserRepository.findAll();
    }
};
