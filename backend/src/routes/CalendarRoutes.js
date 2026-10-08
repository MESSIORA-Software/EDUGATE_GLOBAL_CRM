import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { CalendarValidator } from '../validators/CalendarValidator.js';
import { CalendarController } from '../controllers/CalendarController.js';

const router = Router();

// All calendar endpoints require JWT authentication
router.use(authenticateToken);

// POST   /api/calendar/events  (and /api/calendar)
router.post('/events', CalendarValidator.validateCreateEvent, CalendarController.create);
router.post('/',       CalendarValidator.validateCreateEvent, CalendarController.create);

// GET    /api/calendar/events  (and /api/calendar)
router.get('/events', CalendarController.list);
router.get('/',       CalendarController.list);

// GET    /api/calendar/events/:id
router.get('/events/:id', CalendarController.getById);

// PUT    /api/calendar/events/:id
router.put('/events/:id', CalendarValidator.validateUpdateEvent, CalendarController.update);

// DELETE /api/calendar/events/:id
router.delete('/events/:id', CalendarController.remove);

// Direct :id routes as fallback
router.get('/:id', CalendarController.getById);
router.put('/:id', CalendarValidator.validateUpdateEvent, CalendarController.update);
router.delete('/:id', CalendarController.remove);

export default router;
