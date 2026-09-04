import { roleRepository } from '../repositories/UserRoleRepository.js';

// System roles that should NOT be deleted or renamed
const PROTECTED_ROLES = ['SUPER_ADMIN'];

export const roleService = {
    // Get all roles
    async getAllRoles() {
        return await roleRepository.findAll();
    },

    // Get single role
    async getRoleById(roleId) {
        const role = await roleRepository.findById(roleId);
        if (!role) {
            const error = new Error(`Role with ID '${roleId}' not found`);
            error.statusCode = 404;
            throw error;
        }
        return role;
    },

    // Create role
    async createRole({ role_id, role_name, created_by = null }) {

        // Check duplicate
        const existingRole = await roleRepository.findById(role_id);
        if (existingRole) {
            const error = new Error(`Role with ID '${role_id}' already exists`);
            error.statusCode = 409;
            throw error;
        }

        const roleData = {
            role_id: role_id,
            role_name: role_name,
            created_by: created_by || null,
        };

        return await roleRepository.create(roleData);
    },

    // Update role
    async updateRole(roleId, { role_name }) {

        // Check if role exists
        await this.getRoleById(roleId);

        const updateData = {
            role_name: role_name
        };

        return await roleRepository.update(roleId, updateData);
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

        return await roleRepository.delete(roleId);
    }
};
