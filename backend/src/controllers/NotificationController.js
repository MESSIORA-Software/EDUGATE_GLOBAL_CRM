import { NotificationService } from '../services/NotificationService.js';

/** The recipient is ALWAYS the authenticated user — never read from the request. */
const currentUserId = (req) => {
    const id = Number(req.user?.user_id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw Object.assign(new Error('Invalid authenticated user.'), { statusCode: 401 });
    }
    return id;
};

export const NotificationController = {

    // GET /api/notifications
    async list(req, res, next) {
        try {
            const { data, next_cursor } = await NotificationService.list(currentUserId(req), req.validated);
            return res.status(200).json({
                status: 'success',
                count: data.length,
                next_cursor,
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/notifications/unread-count
    async unreadCount(req, res, next) {
        try {
            const unread = await NotificationService.unreadCount(currentUserId(req));
            return res.status(200).json({ status: 'success', data: { unread_count: unread } });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/notifications/:id/read
    async markRead(req, res, next) {
        try {
            const notification = await NotificationService.markRead(currentUserId(req), req.validated.id);
            return res.status(200).json({
                status: 'success',
                message: 'Notification marked as read.',
                data: notification,
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/notifications/read-all
    async markAllRead(req, res, next) {
        try {
            const updated = await NotificationService.markAllRead(currentUserId(req));
            return res.status(200).json({
                status: 'success',
                message: 'All notifications marked as read.',
                data: { updated_count: updated },
            });
        } catch (error) {
            next(error);
        }
    },
};
