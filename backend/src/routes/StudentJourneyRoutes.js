import { Router } from 'express';
import { StudentJourneyController } from '../controllers/StudentJourneyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// All student journey routes require authentication
router.use(authenticateToken);

// Column routes
router.get('/columns', StudentJourneyController.getColumns);
router.get('/columns/archived', requireAdmin, StudentJourneyController.getArchivedColumns);
router.post('/columns', requireAdmin, StudentJourneyController.createColumn);
router.patch('/columns/:id', requireAdmin, StudentJourneyController.updateColumn);
router.post('/columns/:id/archive', requireAdmin, StudentJourneyController.archiveColumn);
router.post('/columns/:id/restore', requireAdmin, StudentJourneyController.restoreColumn);
router.post('/columns/reorder', requireAdmin, StudentJourneyController.reorderColumns);

// Records and values routes
router.get('/records', StudentJourneyController.getRecords);
router.get('/records/:clientId', StudentJourneyController.getStudentJourney);
router.post('/records/:clientId/init', StudentJourneyController.initStudentJourney);
router.patch('/records/:clientId/values', StudentJourneyController.updateStudentValues);

// Export route
router.get('/export', StudentJourneyController.exportToExcel);

export default router;
