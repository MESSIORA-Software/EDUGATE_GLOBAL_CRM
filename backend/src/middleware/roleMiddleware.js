import { config } from '../config/index.js';

/**
 * Requires the authenticated user to hold an administrator role.
 * Uses the stable role_id from the signed JWT (never display names).
 * Must be mounted after authenticateToken.
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || !config.roles.adminRoleIds.includes(req.user.role_id)) {
        return res.status(403).json({
            status: 'error',
            message: 'Administrator access required.',
        });
    }
    next();
};
