import { EVENT_TYPES } from '../services/NotificationRecipientPolicy.js';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const ID_REGEX = /^[1-9]\d{0,15}$/;

const bad = (res, message) => res.status(400).json({ status: 'error', message });
const isSingle = (v) => v === undefined || typeof v === 'string';

/** Express validators; normalized values are placed on req.validated. */
export const NotificationValidator = {

    validateList(req, res, next) {
        const { limit, cursor, type, read } = req.query;
        if (![limit, cursor, type, read].every(isSingle)) {
            return bad(res, 'Query parameters must be single values.');
        }

        let parsedLimit = DEFAULT_LIMIT;
        if (limit !== undefined) {
            if (!/^\d{1,3}$/.test(limit) || Number(limit) < 1 || Number(limit) > MAX_LIMIT) {
                return bad(res, `limit must be an integer between 1 and ${MAX_LIMIT}.`);
            }
            parsedLimit = Number(limit);
        }

        let parsedCursor = null;
        if (cursor !== undefined) {
            let decoded = '';
            try { decoded = Buffer.from(cursor, 'base64url').toString('utf8'); } catch (_) { /* invalid */ }
            if (!ID_REGEX.test(decoded)) return bad(res, 'Invalid cursor.');
            parsedCursor = Number(decoded);
        }

        if (type !== undefined && !EVENT_TYPES.includes(type)) {
            return bad(res, `type must be one of: ${EVENT_TYPES.join(', ')}.`);
        }

        let parsedRead;
        if (read !== undefined) {
            if (read !== 'true' && read !== 'false') return bad(res, 'read must be "true" or "false".');
            parsedRead = read === 'true';
        }

        req.validated = { limit: parsedLimit, cursor: parsedCursor, type, read: parsedRead };
        next();
    },

    validateId(req, res, next) {
        const { id } = req.params;
        if (!ID_REGEX.test(id) || !Number.isSafeInteger(Number(id))) {
            return bad(res, 'Invalid notification id.');
        }
        req.validated = { id: Number(id) };
        next();
    },
};
