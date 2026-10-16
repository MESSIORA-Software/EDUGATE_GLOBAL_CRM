import crypto from 'crypto';
import { config } from '../config/index.js';

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest();

/**
 * Protects internal worker endpoints (called by Supabase pg_net, not by users).
 * Fails closed: if the secret / service-role key are not configured the endpoint
 * is unavailable. Constant-time comparison of SHA-256 digests.
 */
export const workerAuth = (req, res, next) => {
    const secret = config.notifications.workerSecret;

    if (!secret || secret.length < 32 || !config.supabase.serviceRoleKey) {
        return res.status(503).json({
            status: 'error',
            message: 'Worker endpoint is not configured.',
        });
    }

    const match = /^Bearer (.+)$/.exec(req.headers['authorization'] || '');
    if (!match || !crypto.timingSafeEqual(sha256(match[1]), sha256(secret))) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized.',
        });
    }

    next();
};
