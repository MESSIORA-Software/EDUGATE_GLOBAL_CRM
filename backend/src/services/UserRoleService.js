import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { roleRepository } from '../repositories/UserRoleRepository.js';
import { userService } from './UsersService.js';
import { supabase } from '../database/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statusFilePath = path.join(__dirname, '../database/roles_status_store.json');

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

// System roles that should NOT be deleted or renamed
const PROTECTED_ROLES = ['SUPER_ADMIN', 'EDUGATE_SUPER_ADMIN'];

export const roleService = {
    // Get all roles
    async getAllRoles() {
        const roles = await roleRepository.findAll();
        const statusMap = getStatusMap();
        return roles.map(r => ({
            ...r,
            status: r.status || statusMap[r.role_id] || 'Active'
        }));
    },

    // Get single role
    async getRoleById(roleId) {
        const role = await roleRepository.findById(roleId);
        if (!role) {
            const error = new Error(`Role with ID '${roleId}' not found`);
            error.statusCode = 404;
            throw error;
        }
        const statusMap = getStatusMap();
        return {
            ...role,
            status: role.status || statusMap[role.role_id] || 'Active'
        };
    },

    // Create role
    async createRole({ role_id, role_name, created_by = null, status = 'Active' }) {
        let baseId = (role_id || role_name || '')
            .toString()
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        if (!baseId || baseId === 'EDUGATE') {
            const error = new Error('Role ID could not be generated or is required');
            error.statusCode = 400;
            throw error;
        }

        const finalRoleId = baseId.startsWith('EDUGATE_') ? baseId : `EDUGATE_${baseId}`;

        // Check duplicate
        const existingRole = await roleRepository.findById(finalRoleId);
        if (existingRole) {
            const error = new Error(`Role with ID '${finalRoleId}' already exists`);
            error.statusCode = 409;
            throw error;
        }

        const roleStatus = (status === 'Inactive' || status === 'inactive') ? 'Inactive' : 'Active';

        const roleData = {
            role_id: finalRoleId,
            role_name: role_name.trim(),
            created_by: created_by || null,
        };

        let created;
        try {
            created = await roleRepository.create({ ...roleData, status: roleStatus });
        } catch (dbErr) {
            created = await roleRepository.create(roleData);
        }

        const statusMap = getStatusMap();
        statusMap[finalRoleId] = roleStatus;
        saveStatusMap(statusMap);

        return { ...created, status: roleStatus };
    },

    // Update role
    async updateRole(roleId, { role_name, new_role_id = null, status = null }) {
        // Check if role exists
        const existingRole = await this.getRoleById(roleId);

        const trimmedName = (role_name || existingRole.role_name).trim();

        let formattedNewId = null;
        if (new_role_id && String(new_role_id).trim()) {
            let base = String(new_role_id)
                .trim()
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            if (base && base !== 'EDUGATE') {
                formattedNewId = base.startsWith('EDUGATE_') ? base : `EDUGATE_${base}`;
            }
        }

        const statusMap = getStatusMap();
        const roleStatus = status
            ? ((status === 'Inactive' || status === 'inactive') ? 'Inactive' : 'Active')
            : (statusMap[roleId] || existingRole.status || 'Active');

        // If ID isn't changing or wasn't provided
        if (!formattedNewId || formattedNewId === roleId) {
            const updateData = {
                role_name: trimmedName,
            };
            let updated;
            try {
                updated = await roleRepository.update(roleId, { ...updateData, status: roleStatus });
            } catch (e) {
                updated = await roleRepository.update(roleId, updateData);
            }

            statusMap[roleId] = roleStatus;
            saveStatusMap(statusMap);
            return { ...updated, status: roleStatus };
        }

        // Check if target ID already exists
        const duplicateRole = await roleRepository.findById(formattedNewId);
        if (duplicateRole && duplicateRole.role_id !== roleId) {
            const error = new Error(`Role with ID '${formattedNewId}' already exists`);
            error.statusCode = 409;
            throw error;
        }

        // Attempt direct update first
        try {
            let updated;
            try {
                updated = await roleRepository.update(roleId, {
                    role_id: formattedNewId,
                    role_name: trimmedName,
                    status: roleStatus,
                });
            } catch (e) {
                updated = await roleRepository.update(roleId, {
                    role_id: formattedNewId,
                    role_name: trimmedName,
                });
            }

            // Cascade update in users table
            try {
                await supabase
                    .from('users')
                    .update({ role_id: formattedNewId })
                    .eq('role_id', roleId);
            } catch (userErr) {
                console.warn('Could not cascade update users role_id:', userErr.message);
            }

            statusMap[formattedNewId] = roleStatus;
            delete statusMap[roleId];
            saveStatusMap(statusMap);

            return { ...updated, status: roleStatus };
        } catch (directUpdateError) {
            // Fallback: create new role + migrate users + delete old role
            let created;
            try {
                created = await roleRepository.create({
                    role_id: formattedNewId,
                    role_name: trimmedName,
                    created_by: existingRole.created_by || null,
                    status: roleStatus,
                });
            } catch (e) {
                created = await roleRepository.create({
                    role_id: formattedNewId,
                    role_name: trimmedName,
                    created_by: existingRole.created_by || null,
                });
            }

            try {
                await supabase
                    .from('users')
                    .update({ role_id: formattedNewId })
                    .eq('role_id', roleId);
            } catch (userErr) {
                console.warn('Could not cascade update users role_id:', userErr.message);
            }

            try {
                await roleRepository.delete(roleId);
            } catch (delErr) {
                console.warn('Could not delete old role after migration:', delErr.message);
            }

            statusMap[formattedNewId] = roleStatus;
            delete statusMap[roleId];
            saveStatusMap(statusMap);

            return { ...created, status: roleStatus };
        }
    },

    // Delete role
    async deleteRole(roleId) {

        // Prevent deleting core system roles
        if (PROTECTED_ROLES.includes(roleId)) {
            const error = new Error(`Protected system role '${roleId}' cannot be deleted`);
            error.statusCode = 403;
            throw error;
        }

        // Check if exists
        await this.getRoleById(roleId);

        // Prevent deletion if users are currently assigned to this role
        const assignedUsers = await userService.getUsersByRole(roleId);
        if (assignedUsers && assignedUsers.length > 0) {
            const error = new Error(`Cannot delete role '${roleId}' because ${assignedUsers.length} user(s) are assigned to it.`);
            error.statusCode = 400;
            throw error;
        }

        const statusMap = getStatusMap();
        delete statusMap[roleId];
        saveStatusMap(statusMap);

        return await roleRepository.delete(roleId); 
    }
};
