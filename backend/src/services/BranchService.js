import { BranchRepository } from '../repositories/BranchRepository.js';




export const BranchService = {

    async createBranch({ name, address, phone }) {

        const branchData = {
            name: name,
            address: address,
            phone: phone
        };

        return await BranchRepository.createbranch(branchData);
    },

    async getAllBranches() {
        return await BranchRepository.getAllBranches();
    },

    async getBranchById(branch_id) {
        return await BranchRepository.getBranchById(branch_id);
    },

    async updateBranch(branch_id, { name, address, phone }) {
        const branchData = {
            name: name,
            address: address,
            phone: phone
        };
        return await BranchRepository.updateBranch(branch_id, branchData);
    },

    async deleteBranch(branch_id) {
        return await BranchRepository.deleteBranch(branch_id);
    }

}
