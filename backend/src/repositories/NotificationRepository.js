import { supabase } from '../database/supabaseClient.js';

/**
 * Log the real database error server-side, throw a sanitized error to the
 * centralized error handler (no SQL / schema details reach clients).
 */
export function toServiceError(error, context) {
    console.error(`[NotificationRepository] ${context} failed:`, error?.code, error?.message);
    const err = new Error(`Failed to ${context}.`);
    err.statusCode = 500;
    return err;
}

const COLUMNS = 'notification_id, type, entity_type, entity_id, title, payload, created_at, read_at';

/**
 * Every user-facing query is scoped by recipient_user_id = authenticated user.
 */
export const NotificationRepository = {

    /**
     * Cursor pagination (notification_id DESC). Fetches limit + 1 rows so the
     * caller can tell whether another page exists.
     */
    async list(userId, { limit, cursor, type, read }) {
        let query = supabase
            .from('notifications')
            .select(COLUMNS)
            .eq('recipient_user_id', userId)
            .order('notification_id', { ascending: false })
            .limit(limit + 1);

        if (cursor) query = query.lt('notification_id', cursor);
        if (type) query = query.eq('type', type);
        if (read === true) query = query.not('read_at', 'is', null);
        if (read === false) query = query.is('read_at', null);

        const { data, error } = await query;
        if (error) throw toServiceError(error, 'list notifications');
        return data;
    },

    async countUnread(userId) {
        const { count, error } = await supabase
            .from('notifications')
            .select('notification_id', { count: 'exact', head: true })
            .eq('recipient_user_id', userId)
            .is('read_at', null);

        if (error) throw toServiceError(error, 'count unread notifications');
        return count ?? 0;
    },

    async findOwned(userId, notificationId) {
        const { data, error } = await supabase
            .from('notifications')
            .select(COLUMNS)
            .eq('notification_id', notificationId)
            .eq('recipient_user_id', userId)
            .maybeSingle();

        if (error) throw toServiceError(error, 'fetch notification');
        return data;
    },

    /** Marks one notification read (only if it belongs to the user and is unread). */
    async markRead(userId, notificationId) {
        const { data, error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('notification_id', notificationId)
            .eq('recipient_user_id', userId)
            .is('read_at', null)
            .select(COLUMNS)
            .maybeSingle();

        if (error) throw toServiceError(error, 'mark notification as read');
        return data;
    },

    /** Single UPDATE in PostgreSQL; returns only the affected row count. */
    async markAllRead(userId) {
        const { count, error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() }, { count: 'exact' })
            .eq('recipient_user_id', userId)
            .is('read_at', null);

        if (error) throw toServiceError(error, 'mark notifications as read');
        return count ?? 0;
    },

    /**
     * Idempotent batch insert: UNIQUE(event_id, recipient_user_id) + ignoreDuplicates
     * means a retried event can never create a duplicate notification.
     */
    async insertBatch(rows) {
        if (!rows.length) return;
        const { error } = await supabase
            .from('notifications')
            .upsert(rows, { onConflict: 'event_id,recipient_user_id', ignoreDuplicates: true });

        if (error) throw toServiceError(error, 'insert notifications');
    },
};
