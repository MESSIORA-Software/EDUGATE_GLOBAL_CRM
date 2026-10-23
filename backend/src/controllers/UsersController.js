import { userService } from '../services/UsersService.js';

export const usersController = {
    async getAll(req, res, next) {
        try {
            const { role_id, role } = req.query;
            let users = await userService.getAllUsers();
            if (role_id || role) {
                const targetRole = String(role_id || role).toUpperCase();
                users = (users || []).filter(u => String(u.role_id || '').toUpperCase() === targetRole);
            }
            res.status(200).json({
                status: 'success',
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    async getUsersByRole(req, res, next) {
        try {
            const role_id = req.params.role_id || req.query.role_id;
            const users = await userService.getUsersByRole(role_id);
            res.status(200).json({
                status: 'success',
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserById(req, res, next) {
        try {
            const { user_id } = req.body;
            if (!user_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "user_id" is required in request body.',
                });
            }
            const user = await userService.getUserById(user_id);
            res.status(200).json({
                status: 'success',
                count: user.length,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async createuser(req, res, next) {
        try {
            const { branch_id, name, email, password_hash, password, role_id, status, created_by } = req.body;
            const finalPasswordHash = password_hash || password || 'hashed_password_123';
            const newUser = await userService.createUser({
                branch_id,
                name,
                email,
                password: password || password_hash,
                password_hash: finalPasswordHash,
                role_id,
                status,
                created_by
            });
            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: newUser,
            });
        } catch (error) {
            next(error);
        }
    },
    async updateuser(req, res, next) {
        try {
            const { user_id, branch_id, name, email, password_hash, password, role_id, status } = req.body;
            if (!user_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "user_id" is required in request body.',
                });
            }
            const updatePayload = { branch_id, name, email, role_id, status };
            const finalPassword = password_hash !== undefined ? password_hash : password;
            if (finalPassword !== undefined) {
                updatePayload.password_hash = finalPassword;
            }
            const updateduser = await userService.updateuser(user_id, updatePayload);
            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data: updateduser,
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteuser(req, res, next) {
        try {
            const { user_id } = req.body;
            if (!user_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "user_id" is required in request body.',
                });
            }
            await userService.deleteUser(user_id);
            res.status(200).json({
                status: 'success',
                message: `User '${user_id}' deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    },

    async findUsersByBranch(req, res, next) {
        try {
            const branch_id = req.query.branch_id || req.body?.branch_id;
            if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "branch_id" is required in query or request body.',
                });
            }

            const users = await userService.findUsersByBranch(branch_id);
            res.status(200).json({
                status: 'success',
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

}