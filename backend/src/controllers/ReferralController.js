import { ReferralService } from '../services/ReferralService.js';

export const ReferralController = {
  // ==========================================
  // REFERRERS
  // ==========================================
  async createReferrer(req, res, next) {
    try {
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const result = await ReferralService.createReferrer(req.body, req.user, meta);
      res.status(201).json({
        status: 'success',
        message: 'Referrer created and primary referral code issued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async listReferrers(req, res, next) {
    try {
      const result = await ReferralService.listReferrers(req.query);
      res.status(200).json({
        status: 'success',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getReferrerById(req, res, next) {
    try {
      const id = req.params.id || req.query.id;
      const result = await ReferralService.getReferrerById(Number(id));
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateReferrer(req, res, next) {
    try {
      const id = req.params.id || req.body.referrer_id;
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const result = await ReferralService.updateReferrer(Number(id), req.body, req.user, meta);
      res.status(200).json({
        status: 'success',
        message: 'Referrer updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // CODES
  // ==========================================
  async issueCode(req, res, next) {
    try {
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const result = await ReferralService.issueAdditionalCode(req.body, req.user, meta);
      res.status(201).json({
        status: 'success',
        message: 'Referral code issued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async listCodes(req, res, next) {
    try {
      const result = await ReferralService.listCodes(req.query);
      res.status(200).json({
        status: 'success',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCodeStatus(req, res, next) {
    try {
      const id = req.params.id;
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const result = await ReferralService.updateCodeStatus(Number(id), req.body, req.user, meta);
      res.status(200).json({
        status: 'success',
        message: `Referral code status updated to ${result.status}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStudentsByCode(req, res, next) {
    try {
      const id = req.params.id;
      const result = await ReferralService.getStudentsByReferralCode(Number(id));
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async validateCodePublic(req, res, next) {
    try {
      const code = req.body.code || req.query.code || req.params.code;
      const result = await ReferralService.validateCodeForPublic(code);
      if (!result.valid) {
        return res.status(400).json({
          status: 'error',
          valid: false,
          message: result.message,
        });
      }
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSharePayload(req, res, next) {
    try {
      const code = req.params.code || req.query.code;
      const result = await ReferralService.getSharePayload(code);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // COMMISSIONS
  // ==========================================
  async listCommissions(req, res, next) {
    try {
      const result = await ReferralService.listCommissions(req.query);
      res.status(200).json({
        status: 'success',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // PAYMENTS & BATCHES
  // ==========================================
  async processBulkPayment(req, res, next) {
    try {
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const result = await ReferralService.processBulkPayment(req.body, req.user, meta);
      res.status(201).json({
        status: 'success',
        message: 'Commission payment batch processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async listPaymentBatches(req, res, next) {
    try {
      const result = await ReferralService.listPaymentBatches(req.query);
      res.status(200).json({
        status: 'success',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPaymentBatchById(req, res, next) {
    try {
      const id = req.params.id;
      const result = await ReferralService.getPaymentBatchById(Number(id));
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================
  async getDashboardStatistics(req, res, next) {
    try {
      const referrerId = req.query.referrer_id ? Number(req.query.referrer_id) : null;
      const stats = await ReferralService.getDashboardStatistics(referrerId);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // ROLE PERMISSIONS
  // ==========================================
  async getRolePermissions(req, res, next) {
    try {
      const perms = await ReferralService.getRolePermissions();
      res.status(200).json({
        status: 'success',
        data: perms,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateRolePermission(req, res, next) {
    try {
      const roleId = req.params.roleId;
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const updated = await ReferralService.updateRolePermission(roleId, req.body, req.user, meta);
      res.status(200).json({
        status: 'success',
        message: `Permissions updated for role ${roleId}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async listAuditLogs(req, res, next) {
    try {
      const result = await ReferralService.listAuditLogs(req.query);
      res.status(200).json({
        status: 'success',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // COMMISSION TRIGGER STAGE SETTINGS
  // ==========================================
  async getCommissionTriggerStageConfig(req, res, next) {
    try {
      const config = await ReferralService.getCommissionTriggerStageConfig();
      res.status(200).json({
        status: 'success',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCommissionTriggerStageConfig(req, res, next) {
    try {
      const stageId = req.body.commission_trigger_stage_id !== undefined
        ? req.body.commission_trigger_stage_id
        : req.body.stage_id;
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
      };
      const updated = await ReferralService.updateCommissionTriggerStageConfig(stageId, req.user, meta);
      res.status(200).json({
        status: 'success',
        message: 'Referral commission trigger stage updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
