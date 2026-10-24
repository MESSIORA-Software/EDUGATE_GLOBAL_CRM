import { Router } from 'express';
import { ReferrerController } from '../controllers/ReferrerController.js';
import { optionalAuthenticateToken, authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Get next auto-generated referrer code (e.g. EDUGATE_REFERRER_01)
router.get('/next-code', optionalAuthenticateToken, ReferrerController.getNextCode);

// List all referrers
router.get('/getall', optionalAuthenticateToken, ReferrerController.getAllReferrers);
router.get('/', optionalAuthenticateToken, ReferrerController.getAllReferrers);

// Create referrer
router.post('/create', optionalAuthenticateToken, ReferrerController.createReferrer);
router.post('/', optionalAuthenticateToken, ReferrerController.createReferrer);

// Get referrer students and score
router.get('/students', optionalAuthenticateToken, ReferrerController.getReferrerStudents);
router.get('/:id/students', optionalAuthenticateToken, ReferrerController.getReferrerStudents);

// Payment Settings
router.get('/payment-settings', optionalAuthenticateToken, ReferrerController.getPaymentSettings);
router.put('/payment-settings', optionalAuthenticateToken, ReferrerController.updatePaymentSettings);

// Record & List Payouts
router.post('/payouts', optionalAuthenticateToken, ReferrerController.addPayout);
router.post('/:id/payouts', optionalAuthenticateToken, ReferrerController.addPayout);
router.get('/:id/payouts', optionalAuthenticateToken, ReferrerController.getPayouts);

// Get referrer by id
router.get('/getbyid', optionalAuthenticateToken, ReferrerController.getReferrerById);
router.get('/:id', optionalAuthenticateToken, ReferrerController.getReferrerById);

// Update referrer
router.put('/update', optionalAuthenticateToken, ReferrerController.updateReferrer);
router.put('/:id', optionalAuthenticateToken, ReferrerController.updateReferrer);

// Delete referrer
router.delete('/delete', optionalAuthenticateToken, ReferrerController.deleteReferrer);
router.delete('/:id', optionalAuthenticateToken, ReferrerController.deleteReferrer);

export default router;
