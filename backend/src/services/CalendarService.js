import { CalendarRepository } from '../repositories/CalendarRepository.js';
import { UserRepository } from '../repositories/UsersRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
import { roleRepository } from '../repositories/UserRoleRepository.js';
import { NotificationIntegrationService } from './NotificationIntegrationService.js';

/**
 * Resolve whether the current user is an admin or super admin.
 * @param {Object} currentUser - JWT payload (user_id, role_id, role_name)
 * @returns {Promise<boolean>}
 */
async function isAdmin(currentUser) {
    if (!currentUser) return false;

    let roleName = currentUser.role_name;

    if (!roleName && currentUser.role_id) {
        try {
            const role = await roleRepository.findById(currentUser.role_id);
            roleName = role?.role_name;
        } catch (_) {
            // fallback if role resolution fails
        }
    }

    const normalized = (roleName || '').toLowerCase();
    return normalized === 'admin' || normalized === 'super admin';
}

/**
 * Helper to check if a user exists by user_id.
 */
async function checkUserExists(userId) {
    try {
        const user = await UserRepository.finduserbyid(userId);
        return Boolean(user);
    } catch (_) {
        return false;
    }
}

/**
 * Helper to check if a client exists by client_id.
 */
async function checkClientExists(clientId) {
    try {
        const client = await ClientRepository.getClientById(clientId);
        return Boolean(client);
    } catch (_) {
        return false;
    }
}

/**
 * Parse time string HH:MM:SS or HH:MM into total seconds for comparison.
 */
function timeToSeconds(timeStr) {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parts[2] ? parseInt(parts[2], 10) : 0;
    return h * 3600 + m * 60 + s;
}

export const CalendarService = {

    /**
     * Create a new calendar event.
     * @param {Object} currentUser - Authenticated user payload
     * @param {Object} eventPayload - Event creation data from req.body
     * @returns {Promise<Object>} Created event record
     */
    async createEvent(currentUser, eventPayload) {
        const {
            title,
            reason,
            event_date,
            start_time,
            end_time,
            assigned_staff_id,
            client_id,
        } = eventPayload;

        // Verify assigned_staff_id if provided
        if (assigned_staff_id) {
            const staffExists = await checkUserExists(assigned_staff_id);
            if (!staffExists) {
                const err = new Error('Assigned staff member not found.');
                err.statusCode = 400;
                throw err;
            }
        }

        // Verify client_id if provided
        if (client_id) {
            const clientExists = await checkClientExists(client_id);
            if (!clientExists) {
                const err = new Error('Client not found.');
                err.statusCode = 400;
                throw err;
            }
        }

        // Prepare record to insert — force created_by / updated_by from authenticated user
        const eventData = {
            title: title.trim(),
            reason: reason.trim(),
            event_date,
            start_time: start_time || null,
            end_time: end_time || null,
            assigned_staff_id: assigned_staff_id ? Number(assigned_staff_id) : null,
            client_id: client_id ? Number(client_id) : null,
            created_by: currentUser.user_id,
            updated_by: currentUser.user_id,
        };

        const createdEvent = await CalendarRepository.create(eventData);

        // Trigger notification
        await NotificationIntegrationService.triggerCalendarEventNotification({
            action: 'CREATED',
            event: createdEvent,
            actorUser: currentUser,
        });

        return createdEvent;
    },

    /**
     * List calendar events with pagination, filtering, and RBAC scoping.
     * @param {Object} currentUser
     * @param {Object} queryParams - page, limit, date, from, to, staff_id, client_id, search
     * @returns {Promise<{ data: Object[], total: number, page: number, limit: number }>}
     */
    async listEvents(currentUser, queryParams) {
        const {
            page = 1,
            limit = 20,
            date,
            from,
            to,
            staff_id,
            client_id,
            search,
        } = queryParams;

        const adminUser = await isAdmin(currentUser);

        // Non-admin staff filtering rule:
        // If non-admin passes staff_id different from their own, reject/restrict or force scope.
        if (!adminUser && staff_id && Number(staff_id) !== Number(currentUser.user_id)) {
            const err = new Error('You do not have permission to view events for another staff member.');
            err.statusCode = 403;
            throw err;
        }

        // Determine userScopeId for RBAC: non-admin users only see events where
        // assigned_staff_id = user_id OR created_by = user_id
        const userScopeId = adminUser ? null : currentUser.user_id;

        const { data, total } = await CalendarRepository.findAll({
            page,
            limit,
            date,
            dateFrom: from,
            dateTo: to,
            staffId: staff_id ? Number(staff_id) : null,
            clientId: client_id ? Number(client_id) : null,
            search,
            userScopeId,
        });

        return {
            data,
            total,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
        };
    },

    /**
     * Get a single event by event_id with RBAC IDOR protection.
     * @param {Object} currentUser
     * @param {number|string} eventId
     * @returns {Promise<Object>}
     */
    async getEvent(currentUser, eventId) {
        const event = await CalendarRepository.findById(eventId);
        if (!event) {
            const err = new Error('Calendar event not found.');
            err.statusCode = 404;
            throw err;
        }

        const adminUser = await isAdmin(currentUser);
        if (!adminUser) {
            const isAssigned = event.assigned_staff_id && Number(event.assigned_staff_id) === Number(currentUser.user_id);
            const isCreator  = event.created_by && Number(event.created_by) === Number(currentUser.user_id);

            if (!isAssigned && !isCreator) {
                const err = new Error('Calendar event not found.');
                err.statusCode = 404; // 404 prevents IDOR enumeration
                throw err;
            }
        }

        return event;
    },

    /**
     * Update an existing calendar event.
     * @param {Object} currentUser
     * @param {number|string} eventId
     * @param {Object} updatePayload
     * @returns {Promise<Object>} Updated event record
     */
    async updateEvent(currentUser, eventId, updatePayload) {
        const existingEvent = await CalendarRepository.findById(eventId);
        if (!existingEvent) {
            const err = new Error('Calendar event not found.');
            err.statusCode = 404;
            throw err;
        }

        // Authorization check
        const adminUser = await isAdmin(currentUser);
        if (!adminUser) {
            const isAssigned = existingEvent.assigned_staff_id && Number(existingEvent.assigned_staff_id) === Number(currentUser.user_id);
            const isCreator  = existingEvent.created_by && Number(existingEvent.created_by) === Number(currentUser.user_id);

            if (!isAssigned && !isCreator) {
                const err = new Error('You do not have permission to update this calendar event.');
                err.statusCode = 403;
                throw err;
            }
        }

        const {
            title,
            reason,
            event_date,
            start_time,
            end_time,
            assigned_staff_id,
            client_id,
        } = updatePayload;

        // Verify assigned_staff_id if updated
        if (assigned_staff_id !== undefined && assigned_staff_id !== null && assigned_staff_id !== '') {
            const staffExists = await checkUserExists(assigned_staff_id);
            if (!staffExists) {
                const err = new Error('Assigned staff member not found.');
                err.statusCode = 400;
                throw err;
            }
        }

        // Verify client_id if updated
        if (client_id !== undefined && client_id !== null && client_id !== '') {
            const clientExists = await checkClientExists(client_id);
            if (!clientExists) {
                const err = new Error('Client not found.');
                err.statusCode = 400;
                throw err;
            }
        }

        // Logical start_time < end_time check if times are updated
        const newStartTime = start_time !== undefined ? start_time : existingEvent.start_time;
        const newEndTime   = end_time !== undefined ? end_time : existingEvent.end_time;
        if (newStartTime && newEndTime) {
            const startSec = timeToSeconds(newStartTime);
            const endSec   = timeToSeconds(newEndTime);
            if (startSec !== null && endSec !== null && startSec >= endSec) {
                const err = new Error('start_time must be earlier than end_time.');
                err.statusCode = 400;
                throw err;
            }
        }

        // Build update dataset
        const updateData = {
            updated_by: currentUser.user_id,
        };

        if (title !== undefined)             updateData.title = title.trim();
        if (reason !== undefined)            updateData.reason = reason.trim();
        if (event_date !== undefined)        updateData.event_date = event_date;
        if (start_time !== undefined)        updateData.start_time = start_time || null;
        if (end_time !== undefined)          updateData.end_time = end_time || null;
        if (assigned_staff_id !== undefined) updateData.assigned_staff_id = assigned_staff_id ? Number(assigned_staff_id) : null;
        if (client_id !== undefined)         updateData.client_id = client_id ? Number(client_id) : null;

        const updatedEvent = await CalendarRepository.update(eventId, updateData);

        // Trigger notification
        await NotificationIntegrationService.triggerCalendarEventNotification({
            action: 'UPDATED',
            event: updatedEvent,
            actorUser: currentUser,
        });

        return updatedEvent;
    },

    /**
     * Delete a calendar event by ID.
     * @param {Object} currentUser
     * @param {number|string} eventId
     * @returns {Promise<Object>} Deleted event record
     */
    async deleteEvent(currentUser, eventId) {
        const existingEvent = await CalendarRepository.findById(eventId);
        if (!existingEvent) {
            const err = new Error('Calendar event not found.');
            err.statusCode = 404;
            throw err;
        }

        // Authorization check
        const adminUser = await isAdmin(currentUser);
        if (!adminUser) {
            const isAssigned = existingEvent.assigned_staff_id && Number(existingEvent.assigned_staff_id) === Number(currentUser.user_id);
            const isCreator  = existingEvent.created_by && Number(existingEvent.created_by) === Number(currentUser.user_id);

            if (!isAssigned && !isCreator) {
                const err = new Error('You do not have permission to delete this calendar event.');
                err.statusCode = 403;
                throw err;
            }
        }

        const deletedEvent = await CalendarRepository.deleteById(eventId);

        // Trigger notification
        await NotificationIntegrationService.triggerCalendarEventNotification({
            action: 'DELETED',
            event: existingEvent,
            actorUser: currentUser,
        });

        return deletedEvent;
    },
};
