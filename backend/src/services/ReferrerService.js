import { ReferrerRepository } from '../repositories/ReferrerRepository.js';
import { ReferralRepository } from '../repositories/ReferralRepository.js';

export const ReferrerService = {
  async getNextCode() {
    return await ReferrerRepository.getNextReferrerCode();
  },

  async createReferrer({
    name,
    email,
    home_address,
    whatsapp_number,
    phone_number,
    note,
    status = 'Active',
    created_by,
  }) {
    if (!name || !name.trim()) {
      throw new Error('Name is required for referrer.');
    }

    // Business rule: Check if email belongs to internal staff
    if (email) {
      const isStaff = await ReferralRepository.isInternalStaffUser({ email });
      if (isStaff) {
        const err = new Error('Security Policy Violation: Staff members and internal employees cannot receive personal referral codes.');
        err.statusCode = 403;
        throw err;
      }
    }

    const nextCode = await ReferrerRepository.getNextReferrerCode();

    const referrerData = {
      referrer_code: nextCode,
      name: name.trim(),
      email: email ? email.trim() : null,
      home_address: home_address ? home_address.trim() : null,
      whatsapp_number: whatsapp_number ? whatsapp_number.trim() : null,
      phone_number: phone_number ? phone_number.trim() : null,
      note: note ? note.trim() : null,
      status: status || 'Active',
      created_by: created_by ? Number(created_by) : null,
    };

    const newRef = await ReferrerRepository.createReferrer(referrerData);

    // Sync to authoritative referral_codes table
    try {
      await ReferralRepository.createReferralCode({
        code: nextCode,
        referrer_id: newRef.referrer_id,
        status: 'ACTIVE',
        created_by: created_by ? Number(created_by) : null,
        notes: 'Created via legacy referrer endpoint',
      });
    } catch (e) {
      console.warn('Notice: Code already seeded in referral_codes:', e.message);
    }

    return newRef;
  },

  async getAllReferrers() {
    return await ReferrerRepository.getAllReferrers();
  },

  async getReferrerById(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    return await ReferrerRepository.getReferrerById(Number(referrerId));
  },

  async updateReferrer(referrerId, updatePayload, currentUser = null) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');

    const cleanData = {};
    if (updatePayload.name !== undefined) cleanData.name = updatePayload.name?.trim();
    if (updatePayload.email !== undefined) cleanData.email = updatePayload.email ? updatePayload.email.trim() : null;
    if (updatePayload.home_address !== undefined) cleanData.home_address = updatePayload.home_address ? updatePayload.home_address.trim() : null;
    if (updatePayload.whatsapp_number !== undefined) cleanData.whatsapp_number = updatePayload.whatsapp_number ? updatePayload.whatsapp_number.trim() : null;
    if (updatePayload.phone_number !== undefined) cleanData.phone_number = updatePayload.phone_number ? updatePayload.phone_number.trim() : null;
    if (updatePayload.note !== undefined) cleanData.note = updatePayload.note ? updatePayload.note.trim() : null;
    if (updatePayload.status !== undefined) cleanData.status = updatePayload.status;
    if (updatePayload.payment_per_student !== undefined) {
      if (currentUser && currentUser.role_id) {
        const role = String(currentUser.role_id).toUpperCase();
        const isAdmin = role.includes('ADMIN') || role.includes('SUPER');
        if (!isAdmin) {
          const err = new Error('Access denied: Staff users are not authorized to configure or modify referral commission rates.');
          err.statusCode = 403;
          throw err;
        }
      }
      cleanData.payment_per_student = Number(updatePayload.payment_per_student) || 1000;
    }

    return await ReferrerRepository.updateReferrer(Number(referrerId), cleanData);
  },

  async deleteReferrer(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    return await ReferrerRepository.deleteReferrer(Number(referrerId));
  },

  async getReferrerStudents(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    const refId = Number(referrerId);
    const referrer = await ReferrerRepository.getReferrerById(refId);
    let students = await ReferrerRepository.getStudentsByReferrerId(refId);
    let payouts = await ReferrerRepository.getPayoutsByReferrerId(refId);

    // Query commissions and attributions for this referrer
    const { pool } = await import('../database/dbPool.js');
    const commsRes = await pool.query(
      `SELECT rc.commission_id, rc.client_id, rc.amount, rc.currency, rc.status, 
              rc.rate_snapshot, rc.created_at AS qualification_date, rc.paid_at,
              ra.referral_code_id, code.code AS referral_code, ra.status AS attribution_status
       FROM public.referral_commissions rc
       LEFT JOIN public.referral_attributions ra ON rc.attribution_id = ra.attribution_id
       LEFT JOIN public.referral_codes code ON ra.referral_code_id = code.code_id
       WHERE rc.referrer_id = $1;`,
      [refId]
    );

    // Query attributions to also catch students who have attribution but no commission yet
    const attrRes = await pool.query(
      `SELECT ra.client_id, ra.status AS attribution_status, ra.attributed_at,
              code.code AS referral_code, c.name, c.email
       FROM public.referral_attributions ra
       JOIN public.clients c ON ra.client_id = c.client_id
       JOIN public.referral_codes code ON ra.referral_code_id = code.code_id
       WHERE ra.referrer_id = $1;`,
      [refId]
    );

    const commMap = new Map();
    for (const c of commsRes.rows) {
      commMap.set(Number(c.client_id), c);
    }

    const attrMap = new Map();
    for (const a of attrRes.rows) {
      attrMap.set(Number(a.client_id), a);
    }

    // Merge all client IDs
    const studentMap = new Map();
    for (const s of (students || [])) {
      studentMap.set(Number(s.client_id), s);
    }
    for (const [cId, a] of attrMap.entries()) {
      if (!studentMap.has(cId)) {
        studentMap.set(cId, { client_id: cId, name: a.name, email: a.email });
      }
    }

    const rate_per_student = Number(referrer?.payment_per_student) || 1000;

    const enrichedStudents = [];
    const qualifiedReferrals = [];
    const unqualifiedStudents = [];

    let total_payable = 0;
    let total_paid = 0;
    let pending_amount = 0;

    for (const [cId, s] of studentMap.entries()) {
      const comm = commMap.get(cId);
      const attr = attrMap.get(cId);

      const is_qualified = !!comm;
      const commission_status = comm ? comm.status : 'UNQUALIFIED';
      const commission_amount = comm ? Number(comm.amount) : rate_per_student;
      const qualification_date = comm ? comm.qualification_date : null;
      const refCode = comm?.referral_code || attr?.referral_code || referrer?.referrer_code;

      const item = {
        ...s,
        client_id: cId,
        student_id: s.student_id || `EDU_STUDENT_${cId}`,
        referral_code: refCode,
        is_qualified,
        qualification_date,
        commission_id: comm?.commission_id || null,
        commission_amount,
        commission_status, // PENDING, PAID, or UNQUALIFIED
        referral_state: comm?.status === 'PAID' ? 'PAID' : (comm?.status === 'PENDING' ? 'QUALIFIED' : 'REFERRED'),
      };

      enrichedStudents.push(item);

      if (is_qualified) {
        qualifiedReferrals.push(item);
        total_payable += commission_amount;
        if (comm.status === 'PAID') {
          total_paid += commission_amount;
        } else if (comm.status === 'PENDING') {
          pending_amount += commission_amount;
        }
      } else {
        unqualifiedStudents.push(item);
      }
    }

    // Include settlement payouts if any recorded separately
    const recordedPayoutsTotal = (payouts || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    if (recordedPayoutsTotal > total_paid) {
      total_paid = recordedPayoutsTotal;
      pending_amount = Math.max(0, total_payable - total_paid);
    }

    let payment_status = null;
    if (total_payable > 0) {
      if (pending_amount === 0) {
        payment_status = 'Paid';
      } else if (total_paid > 0) {
        payment_status = 'Partially Paid';
      } else {
        payment_status = 'Pending';
      }
    } else if (total_paid > 0) {
      payment_status = 'Paid';
    }

    const total_students = enrichedStudents.length;
    const score = total_students * 10;

    return {
      referrer,
      students: enrichedStudents,
      qualified_referrals: qualifiedReferrals,
      unqualified_students: unqualifiedStudents,
      payouts,
      total_students,
      qualified_count: qualifiedReferrals.length,
      unqualified_count: unqualifiedStudents.length,
      rate_per_student,
      total_payment: total_payable,
      total_payable,
      total_paid,
      pending_amount,
      payment_status,
      score,
    };
  },

  async createPayout({ referrer_id, amount, payment_method, reference_note, paid_by }) {
    if (!referrer_id) throw new Error('Field "referrer_id" is required.');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('A valid positive payment amount is required.');
    }
    return await ReferrerRepository.createPayout({
      referrer_id,
      amount,
      payment_method,
      reference_note,
      paid_by,
    });
  },

  async getPayouts(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    return await ReferrerRepository.getPayoutsByReferrerId(Number(referrerId));
  },

  async getPaymentSettings() {
    return await ReferrerRepository.getPaymentSettings();
  },

  async updatePaymentSettings(settings) {
    return await ReferrerRepository.updatePaymentSettings(settings);
  },
};
