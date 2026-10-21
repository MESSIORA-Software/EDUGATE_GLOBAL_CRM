import { supabase } from '../database/supabaseClient.js';
import { toServiceError } from './NotificationRepository.js';

/**
 * Outbox access. All claiming / state transitions happen inside PostgreSQL
 * functions (FOR UPDATE SKIP LOCKED) invoked via RPC.
 */
export const NotificationEventRepository = {

    async claim(batchSize, leaseSeconds) {
        const { data, error } = await supabase.rpc('claim_notification_events', {
            p_batch_size: batchSize,
            p_lease_seconds: leaseSeconds,
        });
        if (error) throw toServiceError(error, 'claim notification events');
        return data || [];
    },

    async complete(eventIds, lockToken) {
        if (!eventIds.length) return 0;
        const { data, error } = await supabase.rpc('complete_notification_events', {
            p_event_ids: eventIds,
            p_lock_token: lockToken,
        });
        if (error) throw toServiceError(error, 'complete notification events');
        return data;
    },

    /** Returns the new status ('pending' | 'failed') or null if the lease was lost. */
    async fail(eventId, lockToken, message, retryAfterSeconds, permanent = false) {
        const { data, error } = await supabase.rpc('fail_notification_event', {
            p_event_id: eventId,
            p_lock_token: lockToken,
            p_error: message,
            p_retry_after_seconds: retryAfterSeconds,
            p_permanent: permanent,
        });
        if (error) throw toServiceError(error, 'record notification event failure');
        return data;
    },

    async requeueFailed(limit) {
        const { data, error } = await supabase.rpc('requeue_failed_notification_events', { p_limit: limit });
        if (error) throw toServiceError(error, 'requeue failed notification events');
        return data;
    },

    /**
     * Trusted recipient candidates, resolved from the users table only:
     * ACTIVE users that hold an admin role OR are one of the given staff IDs.
     * One query per batch (no N+1).
     */
    async findActiveRecipientCandidates(adminRoleIds, staffIds) {
        const ids = [...new Set(staffIds)].filter((n) => Number.isSafeInteger(n) && n > 0);
        const roles = adminRoleIds.filter((r) => /^[A-Z_]+$/.test(r));

        const filters = [];
        if (roles.length) filters.push(`role_id.in.(${roles.join(',')})`);
        if (ids.length) filters.push(`user_id.in.(${ids.join(',')})`);
        if (!filters.length) return [];

        const { data, error } = await supabase
            .from('users')
            .select('user_id, role_id')
            .ilike('status', 'active')
            .or(filters.join(','));

        if (error) throw toServiceError(error, 'resolve notification recipients');
        return (data || []).map((u) => ({ user_id: Number(u.user_id), role_id: u.role_id }));
    },
};
