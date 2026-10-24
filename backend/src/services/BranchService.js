import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BranchRepository } from '../repositories/BranchRepository.js';
import { UserRepository } from '../repositories/UsersRepository.js';
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

    async createBranch({ name, address, phone, status = 'Active', admin_id = null }) {
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

            if (admin_id) {
                try {
                    await UserRepository.updateuser(admin_id, { branch_id: Number(created.branch_id) });
                } catch (e) {
                    console.warn('[BranchService] Failed to assign admin to new branch:', e.message);
                }
            }

            return { ...created, status: status || 'Active' };
        }
        return created;
    },

    async getAllBranches() {
        const branches = await BranchRepository.getAllBranches();
        const statusMap = getStatusMap();

        let allUsers = [];
        try {
            allUsers = await UserRepository.findusers();
        } catch (e) {
            console.warn('[BranchService] Failed to load users for allocated admin lookup:', e.message);
        }

        const adminUsers = (allUsers || []).filter(u => {
            const r = String(u.role_id || '').toUpperCase();
            return r.includes('ADMIN') || r.includes('SUPER') || r === 'MANAGER';
        });

        return (branches || []).map(b => {
            const branchAdmin = adminUsers.find(u => String(u.branch_id) === String(b.branch_id));
            return {
                ...b,
                status: b.status || statusMap[b.branch_id] || 'Active',
                allocated_admin: branchAdmin ? {
                    user_id: branchAdmin.user_id,
                    name: branchAdmin.name,
                    email: branchAdmin.email,
                    role_id: branchAdmin.role_id
                } : null
            };
        });
    },

    async getBranchById(branch_id) {
        const branch = await BranchRepository.getBranchById(branch_id);
        if (branch) {
            const statusMap = getStatusMap();
            let allocatedAdmin = null;
            try {
                const allUsers = await UserRepository.findusers();
                const found = (allUsers || []).find(u => {
                    const r = String(u.role_id || '').toUpperCase();
                    const isAdmin = r.includes('ADMIN') || r.includes('SUPER') || r === 'MANAGER';
                    return isAdmin && String(u.branch_id) === String(branch.branch_id);
                });
                if (found) {
                    allocatedAdmin = {
                        user_id: found.user_id,
                        name: found.name,
                        email: found.email,
                        role_id: found.role_id,
                    };
                }
            } catch (e) {}

            return {
                ...branch,
                status: branch.status || statusMap[branch.branch_id] || 'Active',
                allocated_admin: allocatedAdmin,
            };
        }
        return branch;
    },

    async updateBranch(branch_id, { name, address, phone, status = null, admin_id = null }) {
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

        if (admin_id) {
            try {
                await UserRepository.updateuser(admin_id, { branch_id: Number(branch_id) });
            } catch (e) {
                console.warn('[BranchService] Failed to assign admin to branch:', e.message);
            }
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
