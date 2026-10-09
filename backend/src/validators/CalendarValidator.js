/**
 * CalendarValidator.js
 * Express middleware and helpers for validating Module 9 Calendar Event requests.
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

function isValidDateString(dateStr) {
    if (typeof dateStr !== 'string' || !DATE_REGEX.test(dateStr)) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

function isValidTimeString(timeStr) {
    if (typeof timeStr !== 'string') return false;
    return TIME_REGEX.test(timeStr);
}

function parseTimeToMinutes(timeStr) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds;
}

export const CalendarValidator = {

    validateCreateEvent(req, res, next) {
        const {
            title,
            reason,
            event_date,
            start_time,
            end_time,
            assigned_staff_id,
            client_id,
        } = req.body || {};

        // 1. Required title
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "title" is required and must be a non-empty string.',
            });
        }

        // 2. Required reason
        if (!reason || typeof reason !== 'string' || !reason.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "reason" is required and must be a non-empty string.',
            });
        }

        // 3. Required valid event_date
        if (!event_date || !isValidDateString(event_date)) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "event_date" is required and must be a valid ISO date string (YYYY-MM-DD).',
            });
        }

        // 4. Optional start_time
        if (start_time !== undefined && start_time !== null && start_time !== '') {
            if (!isValidTimeString(start_time)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "start_time" must be a valid time format (HH:MM or HH:MM:SS).',
                });
            }
        }

        // 5. Optional end_time
        if (end_time !== undefined && end_time !== null && end_time !== '') {
            if (!isValidTimeString(end_time)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "end_time" must be a valid time format (HH:MM or HH:MM:SS).',
                });
            }
        }

        // 6. Logical check: start_time < end_time when both are provided
        if (
            start_time && end_time &&
            isValidTimeString(start_time) && isValidTimeString(end_time)
        ) {
            const startSec = parseTimeToMinutes(start_time);
            const endSec   = parseTimeToMinutes(end_time);
            if (startSec >= endSec) {
                return res.status(400).json({
                    status: 'error',
                    message: 'start_time must be earlier than end_time.',
                });
            }
        }

        // 7. Optional assigned_staff_id validation
        if (assigned_staff_id !== undefined && assigned_staff_id !== null && assigned_staff_id !== '') {
            const staffIdNum = Number(assigned_staff_id);
            if (!Number.isInteger(staffIdNum) || staffIdNum <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "assigned_staff_id" must be a valid positive integer.',
                });
            }
        }

        // 8. Optional client_id validation
        if (client_id !== undefined && client_id !== null && client_id !== '') {
            const clientIdNum = Number(client_id);
            if (!Number.isInteger(clientIdNum) || clientIdNum <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "client_id" must be a valid positive integer.',
                });
            }
        }

        next();
    },

    validateUpdateEvent(req, res, next) {
        const {
            title,
            reason,
            event_date,
            start_time,
            end_time,
            assigned_staff_id,
            client_id,
        } = req.body || {};

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "title" must be a non-empty string.',
                });
            }
        }

        if (reason !== undefined) {
            if (typeof reason !== 'string' || !reason.trim()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "reason" must be a non-empty string.',
                });
            }
        }

        if (event_date !== undefined) {
            if (!isValidDateString(event_date)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "event_date" must be a valid ISO date string (YYYY-MM-DD).',
                });
            }
        }

        if (start_time !== undefined && start_time !== null && start_time !== '') {
            if (!isValidTimeString(start_time)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "start_time" must be a valid time format (HH:MM or HH:MM:SS).',
                });
            }
        }

        if (end_time !== undefined && end_time !== null && end_time !== '') {
            if (!isValidTimeString(end_time)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "end_time" must be a valid time format (HH:MM or HH:MM:SS).',
                });
            }
        }

        if (
            start_time && end_time &&
            isValidTimeString(start_time) && isValidTimeString(end_time)
        ) {
            const startSec = parseTimeToMinutes(start_time);
            const endSec   = parseTimeToMinutes(end_time);
            if (startSec >= endSec) {
                return res.status(400).json({
                    status: 'error',
                    message: 'start_time must be earlier than end_time.',
                });
            }
        }

        if (assigned_staff_id !== undefined && assigned_staff_id !== null && assigned_staff_id !== '') {
            const staffIdNum = Number(assigned_staff_id);
            if (!Number.isInteger(staffIdNum) || staffIdNum <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "assigned_staff_id" must be a valid positive integer.',
                });
            }
        }

        if (client_id !== undefined && client_id !== null && client_id !== '') {
            const clientIdNum = Number(client_id);
            if (!Number.isInteger(clientIdNum) || clientIdNum <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "client_id" must be a valid positive integer.',
                });
            }
        }

        next();
    },
};
