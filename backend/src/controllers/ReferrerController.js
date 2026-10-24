import { ReferrerService } from '../services/ReferrerService.js';

export const ReferrerController = {
  async getNextCode(req, res, next) {
    try {
      const code = await ReferrerService.getNextCode();
      res.status(200).json({
        status: 'success',
        data: { next_code: code },
      });
    } catch (error) {
      next(error);
    }
  },

  async createReferrer(req, res, next) {
    try {
      const { name, email, home_address, whatsapp_number, phone_number, note, status } = req.body;
      const created_by = req.user?.user_id || null;

      const newReferrer = await ReferrerService.createReferrer({
        name,
        email,
        home_address,
        whatsapp_number,
        phone_number,
        note,
        status,
        created_by,
      });

      res.status(201).json({
        status: 'success',
        message: 'Referrer created successfully',
        data: newReferrer,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllReferrers(req, res, next) {
    try {
      const referrers = await ReferrerService.getAllReferrers();
      res.status(200).json({
        status: 'success',
        data: referrers,
      });
    } catch (error) {
      next(error);
    }
  },

  async getReferrerById(req, res, next) {
    try {
      const referrer_id = req.params.id || req.body.referrer_id || req.query.referrer_id;
      const referrer = await ReferrerService.getReferrerById(referrer_id);
      res.status(200).json({
        status: 'success',
        data: referrer,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateReferrer(req, res, next) {
    try {
      const referrer_id = req.params.id || req.body.referrer_id;
      const { name, email, home_address, whatsapp_number, phone_number, note, status } = req.body;

      const updated = await ReferrerService.updateReferrer(referrer_id, {
        name,
        email,
        home_address,
        whatsapp_number,
        phone_number,
        note,
        status,
      });

      res.status(200).json({
        status: 'success',
        message: 'Referrer updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteReferrer(req, res, next) {
    try {
      const referrer_id = req.params.id || req.body.referrer_id;
      const deleted = await ReferrerService.deleteReferrer(referrer_id);

      res.status(200).json({
        status: 'success',
        message: 'Referrer deleted successfully',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  },

  async getReferrerStudents(req, res, next) {
    try {
      const referrer_id = req.params.id || req.body.referrer_id || req.query.referrer_id;
      const data = await ReferrerService.getReferrerStudents(referrer_id);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPaymentSettings(req, res, next) {
    try {
      const data = await ReferrerService.getPaymentSettings();
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePaymentSettings(req, res, next) {
    try {
      const { rate_per_student, currency, apply_to_all } = req.body;
      const data = await ReferrerService.updatePaymentSettings({
        rate_per_student,
        currency,
        apply_to_all,
      });
      res.status(200).json({
        status: 'success',
        message: 'Referrer payment settings updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async addPayout(req, res, next) {
    try {
      const referrer_id = req.params.id || req.body.referrer_id;
      const { amount, payment_method, reference_note } = req.body;
      const paid_by = req.user?.user_id || null;

      const payout = await ReferrerService.createPayout({
        referrer_id,
        amount,
        payment_method,
        reference_note,
        paid_by,
      });

      res.status(201).json({
        status: 'success',
        message: 'Payment recorded successfully',
        data: payout,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPayouts(req, res, next) {
    try {
      const referrer_id = req.params.id || req.query.referrer_id;
      const payouts = await ReferrerService.getPayouts(referrer_id);
      res.status(200).json({
        status: 'success',
        data: payouts,
      });
    } catch (error) {
      next(error);
    }
  },
};
