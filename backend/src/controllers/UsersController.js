import { userService } from '../services/UsersService.js';

export const usersController = {
    async getAll(req, res, next) {
        try {
            const users = await userService.getAllUsers();
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
            const { branch_id, name, email, password_hash, role_id, status, created_by } = req.body;
            const newUser = await userService.createUser({ branch_id, name, email, password_hash, role_id, status, created_by });
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
            const { user_id, branch_id, name, email, password_hash, role_id, status } = req.body;
            if (!user_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "user_id" is required in request body.',
                });
            }
            const updateduser = await userService.updateuser(user_id, { branch_id, name, email, password_hash, role_id, status });
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
    }

}