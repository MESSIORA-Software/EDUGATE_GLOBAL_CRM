import { CalendarService } from '../services/CalendarService.js';

export const CalendarController = {

    // POST /api/calendar/events
    async create(req, res, next) {
        try {
            const event = await CalendarService.createEvent(req.user, req.body);

            return res.status(201).json({
                status: 'success',
                message: 'Calendar event created successfully.',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/calendar/events
    async list(req, res, next) {
        try {
            const result = await CalendarService.listEvents(req.user, req.query);

            return res.status(200).json({
                status: 'success',
                total: result.total,
                page: result.page,
                limit: result.limit,
                count: result.data.length,
                data: result.data,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/calendar/events/:id
    async getById(req, res, next) {
        try {
            const event = await CalendarService.getEvent(req.user, req.params.id);

            return res.status(200).json({
                status: 'success',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/calendar/events/:id
    async update(req, res, next) {
        try {
            const event = await CalendarService.updateEvent(req.user, req.params.id, req.body);

            return res.status(200).json({
                status: 'success',
                message: 'Calendar event updated successfully.',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/calendar/events/:id
    async remove(req, res, next) {
        try {
            const deleted = await CalendarService.deleteEvent(req.user, req.params.id);

            return res.status(200).json({
                status: 'success',
                message: 'Calendar event deleted successfully.',
                data: deleted,
            });
        } catch (error) {
            next(error);
        }
    },
};
