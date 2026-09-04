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
    }
};
