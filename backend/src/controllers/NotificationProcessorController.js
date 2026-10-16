import { NotificationService } from '../services/NotificationService.js';

/**
 * Internal worker endpoints (secret-protected, called by Supabase pg_net).
 * Deliberately separate from NotificationController (user-facing).
 */
export const NotificationProcessorController = {

    // POST /api/internal/notifications/process
    async process(req, res, next) {
        try {
            const summary = await NotificationService.processBounded();
            return res.status(200).json({ status: 'success', data: summary });
        } catch (error) {
            console.error('[NotificationProcessor] run failed:', error.message);
            next(Object.assign(new Error('Notification processing failed.'), { statusCode: 500 }));
        }
    },

    // POST /api/internal/notifications/requeue-failed
    async requeueFailed(req, res, next) {
        try {
            const requeued = await NotificationService.requeueFailed(100);
            return res.status(200).json({ status: 'success', data: { requeued } });
        } catch (error) {
            console.error('[NotificationProcessor] requeue failed:', error.message);
            next(Object.assign(new Error('Requeue failed.'), { statusCode: 500 }));
        }
    },
};
