/**
 * NotificationRecipientPolicy — the ONE place that decides who is notified and
 * what a notification contains. Pure functions (no I/O) so it is fully testable.
 *
 * Recipients are derived only from trusted data: the outbox event written by
 * database triggers, plus `users` rows (active + role_id) loaded by the service.
 * Nothing here ever reads a recipient from a client request.
 */

export const EVENT_TYPES = Object.freeze([
    'NEW_LEAD', 'NEW_MESSAGE', 'STAFF_ASSIGNMENT', 'CALENDAR_EVENT', 'STATUS_CHANGE',
]);

/** Event cannot ever be processed successfully (retrying is pointless). */
export class PermanentEventError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PermanentEventError';
    }
}

// Allowlisted keys copied from the event payload into the user-visible payload.
const PAYLOAD_ALLOWLIST = Object.freeze({
    NEW_LEAD:         ['opportunity_id', 'client_id', 'assigned_staff_id', 'status_id'],
    NEW_MESSAGE:      ['message_id', 'conversation_id', 'client_id', 'channel', 'message_type'],
    STAFF_ASSIGNMENT: ['opportunity_id', 'conversation_id', 'client_id', 'assigned_staff_id', 'previous_assignee_id'],
    CALENDAR_EVENT:   ['event_id', 'action', 'event_date', 'start_time', 'end_time', 'client_id'],
    STATUS_CHANGE:    ['opportunity_id', 'client_id', 'old_status_id', 'new_status_id'],
});

const toId = (v) => {
    const n = Number(v);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
};

function validate(event) {
    if (!event || !EVENT_TYPES.includes(event.event_type)) {
        throw new PermanentEventError(`Unsupported event type: ${event?.event_type}`);
    }
    if (!event.payload || typeof event.payload !== 'object' || Array.isArray(event.payload)) {
        throw new PermanentEventError('Invalid event payload');
    }
    if (!toId(event.entity_id)) {
        throw new PermanentEventError('Invalid entity id');
    }
}

/**
 * @param {Object} event       outbox event
 * @param {Array<{user_id:number, role_id:string}>} activeUsers  ACTIVE candidate users
 * @param {string[]} adminRoleIds
 * @returns {number[]} distinct recipient user IDs (actor excluded)
 */
export function resolveRecipients(event, activeUsers, adminRoleIds) {
    validate(event);

    const activeById = new Map(activeUsers.map((u) => [Number(u.user_id), u]));
    const adminIds = activeUsers
        .filter((u) => adminRoleIds.includes(u.role_id))
        .map((u) => Number(u.user_id));

    const staffId = toId(event.payload.assigned_staff_id);
    const staffIsActive = staffId !== null && activeById.has(staffId);

    let recipients;
    switch (event.event_type) {
        case 'NEW_MESSAGE':
            // assigned staff; unassigned (or inactive assignee) => admins
            recipients = staffIsActive ? [staffId] : adminIds;
            break;
        case 'NEW_LEAD':          // assigned staff (if any) + admins
        case 'STAFF_ASSIGNMENT':  // NEW assignee (payload.assigned_staff_id) + admins
        case 'CALENDAR_EVENT':    // assigned staff + admins
        case 'STATUS_CHANGE':     // assigned staff + admins
            recipients = [...(staffIsActive ? [staffId] : []), ...adminIds];
            break;
        default:
            throw new PermanentEventError(`Unsupported event type: ${event.event_type}`);
    }

    const actorId = toId(event.actor_user_id);
    return [...new Set(recipients)].filter((id) => id !== actorId);
}

const safeToken = (v, fallback) =>
    typeof v === 'string' && /^[a-z_]{1,20}$/.test(v) ? v : fallback;

export function buildTitle(event, recipientId) {
    const p = event.payload;
    switch (event.event_type) {
        case 'NEW_LEAD':
            return 'New lead received';
        case 'NEW_MESSAGE':
            return `New ${safeToken(p.channel, 'client')} message`;
        case 'STAFF_ASSIGNMENT': {
            const what = event.entity_type === 'conversation' ? 'conversation' : 'opportunity';
            return toId(p.assigned_staff_id) === recipientId
                ? `You have been assigned to a ${what}`
                : `A ${what} was assigned to a staff member`;
        }
        case 'CALENDAR_EVENT':
            return ({
                CREATED: 'Calendar event scheduled',
                RESCHEDULED: 'Calendar event rescheduled',
                ASSIGNED: 'Calendar event assigned',
            })[p.action] || 'Calendar event updated';
        case 'STATUS_CHANGE':
            return 'Opportunity status changed';
        default:
            throw new PermanentEventError(`Unsupported event type: ${event.event_type}`);
    }
}

/** Minimal, allowlisted, primitive-only payload (no message bodies / PII). */
export function buildPayload(event) {
    const out = {};
    for (const key of PAYLOAD_ALLOWLIST[event.event_type] || []) {
        const v = event.payload[key];
        if (v === null || v === undefined) continue;
        if (typeof v === 'number' || typeof v === 'boolean') out[key] = v;
        else if (typeof v === 'string' && v.length <= 40) out[key] = v;
    }
    return out;
}

/** Notification rows (one per recipient) for a single event. */
export function buildNotificationRows(event, recipientIds) {
    const payload = buildPayload(event);
    return recipientIds.map((recipientId) => ({
        event_id: event.event_id,
        recipient_user_id: recipientId,
        type: event.event_type,
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        title: buildTitle(event, recipientId),
        payload,
    }));
}
