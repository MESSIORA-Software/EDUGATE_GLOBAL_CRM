import { Router } from 'express';
import { ReferralController } from '../controllers/ReferralController.js';
import { ReferrerController } from '../controllers/ReferrerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public rate-limited validation & sharing endpoints
const publicLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 60 });
router.post('/codes/validate', publicLimiter, ReferralController.validateCodePublic);
router.get('/codes/public/:code', publicLimiter, ReferralController.validateCodePublic);
router.get('/codes/share/:code', publicLimiter, ReferralController.getSharePayload);

// All subsequent private endpoints strictly require real authentication token
router.use(authenticateToken);

// ==========================================
// REFERRAL CODES MANAGEMENT
// ==========================================
router.post('/codes', ReferralController.issueCode);
router.post('/referrers/:id/referral-code', (req, res, next) => {
  req.body = { ...req.body, referrer_id: Number(req.params.id) };
  return ReferralController.issueCode(req, res, next);
});
router.post('/:id/referral-code', (req, res, next) => {
  req.body = { ...req.body, referrer_id: Number(req.params.id) };
  return ReferralController.issueCode(req, res, next);
});
router.get('/codes', ReferralController.listCodes);
router.patch('/codes/:id/status', requireAdmin, ReferralController.updateCodeStatus);
router.get('/codes/:id/students', ReferralController.getStudentsByCode);

// ==========================================
// REFERRAL COMMISSION TRIGGER STAGE SETTINGS
// ==========================================
router.get('/settings/qualification-stage', ReferralController.getCommissionTriggerStageConfig);
router.put('/settings/qualification-stage', requireAdmin, ReferralController.updateCommissionTriggerStageConfig);

// ==========================================
// REFERRERS MANAGEMENT
// ==========================================
router.post('/referrers', ReferralController.createReferrer);
router.get('/referrers', ReferralController.listReferrers);
router.get('/referrers/:id/students', ReferrerController.getReferrerStudents);
router.get('/referrers/:id', ReferralController.getReferrerById);
router.put('/referrers/:id', ReferralController.updateReferrer);

// ==========================================
// COMMISSIONS & PAYMENTS
// ==========================================
router.get('/commissions', ReferralController.listCommissions);
router.post('/payments/batches', requireAdmin, ReferralController.processBulkPayment);
router.post('/referrals/:id/payment', requireAdmin, ReferrerController.addPayout);
router.post('/:id/payment', requireAdmin, ReferrerController.addPayout);
router.get('/payments/batches', ReferralController.listPaymentBatches);
router.get('/payments/batches/:id', ReferralController.getPaymentBatchById);

// ==========================================
// DASHBOARD & AUDIT LOGS
// ==========================================
router.get('/dashboard/stats', ReferralController.getDashboardStatistics);
router.get('/audit-logs', requireAdmin, ReferralController.listAuditLogs);

// ==========================================
// ROLE PERMISSIONS
// ==========================================
router.get('/permissions', requireAdmin, ReferralController.getRolePermissions);
router.put('/permissions/:roleId', requireAdmin, ReferralController.updateRolePermission);

// ==========================================
// BACKWARD COMPATIBILITY ENDPOINTS (PRESERVED)
// ==========================================
router.get('/next-code', async (req, res, next) => {
  try {
    const { ReferralService } = await import('../services/ReferralService.js');
    const code = await ReferralService.generateUniqueReferralCode();
    res.status(200).json({ status: 'success', data: { next_code: code } });
  } catch (err) {
    next(err);
  }
});
router.get('/getall', ReferralController.listReferrers);
router.post('/create', ReferralController.createReferrer);
router.get('/students', ReferralController.listReferrers);
router.get('/payment-settings', ReferrerController.getPaymentSettings);
router.put('/payment-settings', requireAdmin, ReferrerController.updatePaymentSettings);
router.post('/payouts', requireAdmin, ReferrerController.addPayout);
router.post('/:id/payouts', requireAdmin, ReferrerController.addPayout);
router.get('/:id/payouts', ReferrerController.getPayouts);
router.get('/getbyid', ReferralController.getReferrerById);
router.put('/update', ReferralController.updateReferrer);
router.delete('/delete', requireAdmin, async (req, res, next) => {
  try {
    const id = req.body.referrer_id || req.query.referrer_id;
    // Soft disable instead of destructive delete
    req.body = { status: 'Disabled' };
    req.params = { id };
    return await ReferralController.updateReferrer(req, res, next);
  } catch (err) {
    next(err);
  }
});
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    // Soft disable instead of destructive delete
    req.body = { status: 'Disabled' };
    return await ReferralController.updateReferrer(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Root aliases
router.get('/', ReferralController.listReferrers);
router.post('/', ReferralController.createReferrer);
router.get('/:id/students', ReferrerController.getReferrerStudents);
router.get('/:id', ReferralController.getReferrerById);
router.put('/:id', ReferralController.updateReferrer);

export default router;
