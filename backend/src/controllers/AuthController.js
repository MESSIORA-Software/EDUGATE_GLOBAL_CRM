import { authService } from '../services/AuthService.js';

export const authController = {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });
            
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    async getMe(req, res, next) {
        try {
            // req.user is set by authMiddleware
            const user = await authService.getMe(req.user.user_id);
            
            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },
    async logout(req, res, next) {
        try {
            // req.user is supplied by authenticateToken middleware
            const result = await authService.logout(req.user?.user_id);
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    },

    async resetPassword(req, res, next) {
        try {
            const { email, currentPassword, newPassword } = req.body;
            const result = await authService.resetPassword({ email, currentPassword, newPassword });
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    },

    async verifyPassword(req, res, next) {
        try {
            const { password, email } = req.body;
            const userId = req.user?.user_id;
            const result = await authService.verifyPassword({ userId, email, password });
            res.status(200).json({
                status: 'success',
                message: 'Password verified successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
};
