import { UserService } from '../services/UserService.js';

export const UserController = {
    // Fetch Users According to Branch (GET /api/users/branch)
    async getUsersByBranch(req, res, next) {
        try {
            const branch_id = req.query.branch_id || req.body?.branch_id || req.params?.branch_id;

            if (!branch_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "branch_id" is required in query parameters or request body.',
                });
            }

            const users = await UserService.getUsersByBranch(branch_id);

            res.status(200).json({
                status: 'success',
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    // Get All Users (GET /api/users)
    async getAllUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json({
                status: 'success',
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }
};
