import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BranchRepository } from '../repositories/BranchRepository.js';
import { userService } from './UsersService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statusFilePath = path.join(__dirname, '../database/branches_status_store.json');

const getStatusMap = () => {
    try {
        if (fs.existsSync(statusFilePath)) {
            const raw = fs.readFileSync(statusFilePath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {}
    return {};
};

const saveStatusMap = (map) => {
    try {
        fs.writeFileSync(statusFilePath, JSON.stringify(map, null, 2), 'utf-8');
    } catch (e) {}
};

export const BranchService = {

    async createBranch({ name, address, phone, status = 'Active' }) {
        const branchData = {
            name: name,
            address: address,
            phone: phone
        };

        const created = await BranchRepository.createbranch(branchData);
        if (created?.branch_id) {
            const statusMap = getStatusMap();
            statusMap[created.branch_id] = status || 'Active';
            saveStatusMap(statusMap);
            return { ...created, status: status || 'Active' };
        }
        return created;
    },

    async getAllBranches() {
        const branches = await BranchRepository.getAllBranches();
        const statusMap = getStatusMap();
        return (branches || []).map(b => ({
            ...b,
            status: b.status || statusMap[b.branch_id] || 'Active'
        }));
    },

    async getBranchById(branch_id) {
        const branch = await BranchRepository.getBranchById(branch_id);
        if (branch) {
            const statusMap = getStatusMap();
            return {
                ...branch,
                status: branch.status || statusMap[branch.branch_id] || 'Active'
            };
        }
        return branch;
    },

    async updateBranch(branch_id, { name, address, phone, status = null }) {
        const branchData = {
            name: name,
            address: address,
            phone: phone
        };
        const updated = await BranchRepository.updateBranch(branch_id, branchData);
        const statusMap = getStatusMap();
        if (status) {
            statusMap[branch_id] = status;
            saveStatusMap(statusMap);
        }
        return {
            ...updated,
            status: status || statusMap[branch_id] || 'Active'
        };
    },

    async deleteBranch(branch_id) {
        // Prevent deletion if users are currently assigned to this branch
        const assignedUsers = await userService.findUsersByBranch(branch_id);
        if (assignedUsers && assignedUsers.length > 0) {
            const error = new Error(`Cannot delete branch because ${assignedUsers.length} user(s) are assigned to it.`);
            error.statusCode = 400;
            throw error;
        }

        const statusMap = getStatusMap();
        delete statusMap[branch_id];
        saveStatusMap(statusMap);

        return await BranchRepository.deleteBranch(branch_id);
    }

};
