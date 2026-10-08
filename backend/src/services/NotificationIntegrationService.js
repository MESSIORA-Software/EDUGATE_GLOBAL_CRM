let notificationHandler = null;

export const NotificationIntegrationService = {

    /**
     * Register a notification handler (to be called by Module 11 when implemented).
     * @param {Function} handler - async (payload) => void
     */
    registerHandler(handler) {
        if (typeof handler === 'function') {
            notificationHandler = handler;
        }
    },

    /**
     * Clear registered handler (primarily for testing).
     */
    clearHandler() {
        notificationHandler = null;
    },

    /**
     * Trigger a notification for a calendar event action.
     * 
     * Target audience:
     * - assigned staff member (if assigned)
     * - relevant admin users / creator
     * 
     * Notification type: CALENDAR_EVENT
     * 
     * @param {Object} params
     * @param {string} params.action - 'CREATED' | 'UPDATED' | 'DELETED'
     * @param {Object} params.event - The event object from database
     * @param {Object} params.actorUser - JWT payload of user performing the action
     * @param {Array<number|string>} [params.adminUserIds] - Optional list of admin user IDs
     * @returns {Promise<Object>} Formatted notification payload
     */
    async triggerCalendarEventNotification({ action, event, actorUser, adminUserIds = [] }) {
        const targetUserIds = new Set();

        // 1. Target assigned staff member
        if (event.assigned_staff_id) {
            targetUserIds.add(Number(event.assigned_staff_id));
        }

        // 2. Target event creator if different from actor
        if (event.created_by) {
            targetUserIds.add(Number(event.created_by));
        }

        // 3. Target admin users
        if (Array.isArray(adminUserIds)) {
            adminUserIds.forEach(id => {
                if (id) targetUserIds.add(Number(id));
            });
        }

        const payload = {
            type: 'CALENDAR_EVENT',
            action, // 'CREATED', 'UPDATED', 'DELETED'
            event_id: event.event_id,
            title: event.title,
            reason: event.reason,
            event_date: event.event_date,
            assigned_staff_id: event.assigned_staff_id || null,
            client_id: event.client_id || null,
            actor_user_id: actorUser ? actorUser.user_id : null,
            target_user_ids: Array.from(targetUserIds),
            created_at: new Date().toISOString(),
        };

        // Dispatch to registered handler if present
        if (notificationHandler) {
            try {
                await notificationHandler(payload);
            } catch (err) {
                console.error('[NotificationIntegrationService] Registered handler failed:', err.message);
            }
        } else {
            console.log(`[NotificationIntegrationService] CALENDAR_EVENT notification triggered (${action}):`, {
                event_id: payload.event_id,
                title: payload.title,
                target_users: payload.target_user_ids,
            });
        }

        return payload;
    }
};
