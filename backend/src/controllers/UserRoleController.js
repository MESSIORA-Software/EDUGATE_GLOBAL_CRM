import { roleService } from '../services/UserRoleService.js';

export const UserRoleController = {
    // GET /api/roles
    async getAll(req, res, next) {
        try {
            const roles = await roleService.getAllRoles();
            res.status(200).json({
                status: 'success',
                count: roles.length,
                data: roles,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/roles/:id
    async getById(req, res, next) {
        try {
            const { role_id } = req.body;
            if (!role_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "role_id" is required in request body.',
                });
            }
            const role = await roleService.getRoleById(role_id);
            res.status(200).json({
                status: 'success',
                data: role,
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/roles
    async create(req, res, next) {
        try {
            const { role_id, role_name, created_by } = req.body;
            const newRole = await roleService.createRole({ role_id, role_name, created_by });
            res.status(201).json({
                status: 'success',
                message: 'Role created successfully',
                data: newRole,
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/roles/:id
    async update(req, res, next) {
        try {
            const { role_id } = req.body;
            if (!role_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "role_id" is required in request body.',
                });
            }
            const updatedRole = await roleService.updateRole(role_id, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Role updated successfully',
                data: updatedRole,
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/roles/:id
    async delete(req, res, next) {
        try {
            const { role_id } = req.body;
            if (!role_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "role_id" is required in request body.',
                });
            }
            await roleService.deleteRole(role_id);
            res.status(200).json({
                status: 'success',
                message: `Role '${role_id}' deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    }
};
