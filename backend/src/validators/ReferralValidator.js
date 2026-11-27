/**
 * Validation rules for Referral Management backend module.
 */

export const ReferralValidator = {
  validateCreateReferrer(payload) {
    if (!payload || typeof payload !== 'object') {
      const err = new Error('Invalid request payload.');
      err.statusCode = 400;
      throw err;
    }

    const {
      name,
      email,
      phone_number,
      whatsapp_number,
      home_address,
      note,
      referrer_type = 'EXTERNAL',
      client_id,
      payment_per_student,
      custom_code,
      expires_at,
    } = payload;

    const type = String(referrer_type).toUpperCase();
    if (!['STUDENT', 'EXTERNAL', 'PARTNER'].includes(type)) {
      const err = new Error('referrer_type must be one of: STUDENT, EXTERNAL, PARTNER.');
      err.statusCode = 400;
      throw err;
    }

    if (type === 'STUDENT' && !client_id) {
      const err = new Error('client_id is required when referrer_type is STUDENT.');
      err.statusCode = 400;
      throw err;
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      const err = new Error('Field "name" is required and cannot be empty.');
      err.statusCode = 400;
      throw err;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        const err = new Error('Invalid email format.');
        err.statusCode = 400;
        throw err;
      }
    }

    if (custom_code) {
      const codeRegex = /^[A-Za-z0-9_-]{4,30}$/;
      if (!codeRegex.test(custom_code.trim())) {
        const err = new Error('custom_code must be 4-30 alphanumeric characters (hyphens and underscores allowed).');
        err.statusCode = 400;
        throw err;
      }
    }

    if (expires_at) {
      const expDate = new Date(expires_at);
      if (isNaN(expDate.getTime())) {
        const err = new Error('expires_at must be a valid ISO date.');
        err.statusCode = 400;
        throw err;
      }
      if (expDate <= new Date()) {
        const err = new Error('expires_at must be a future date.');
        err.statusCode = 400;
        throw err;
      }
    }

    return {
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      phone_number: phone_number ? String(phone_number).trim() : null,
      whatsapp_number: whatsapp_number ? String(whatsapp_number).trim() : null,
      home_address: home_address ? String(home_address).trim() : null,
      note: note ? String(note).trim() : null,
      referrer_type: type,
      client_id: client_id ? Number(client_id) : null,
      payment_per_student: payment_per_student !== undefined ? Number(payment_per_student) : undefined,
      custom_code: custom_code ? custom_code.trim().toUpperCase() : null,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
    };
  },

  validateIssueCode(payload) {
    if (!payload || typeof payload !== 'object') {
      const err = new Error('Invalid request payload.');
      err.statusCode = 400;
      throw err;
    }

    const { referrer_id, custom_code, expires_at, notes } = payload;
    if (!referrer_id || isNaN(Number(referrer_id))) {
      const err = new Error('Field "referrer_id" is required and must be an integer.');
      err.statusCode = 400;
      throw err;
    }

    if (custom_code) {
      const codeRegex = /^[A-Za-z0-9_-]{4,30}$/;
      if (!codeRegex.test(custom_code.trim())) {
        const err = new Error('custom_code must be 4-30 alphanumeric characters.');
        err.statusCode = 400;
        throw err;
      }
    }

    if (expires_at) {
      const expDate = new Date(expires_at);
      if (isNaN(expDate.getTime())) {
        const err = new Error('expires_at must be a valid ISO date.');
        err.statusCode = 400;
        throw err;
      }
      if (expDate <= new Date()) {
        const err = new Error('expires_at must be a future date.');
        err.statusCode = 400;
        throw err;
      }
    }

    return {
      referrer_id: Number(referrer_id),
      custom_code: custom_code ? custom_code.trim().toUpperCase() : null,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      notes: notes ? String(notes).trim() : null,
    };
  },

  validateUpdateCodeStatus(payload) {
    if (!payload || typeof payload !== 'object') {
      const err = new Error('Invalid request payload.');
      err.statusCode = 400;
      throw err;
    }

    const { status, reason } = payload;
    const cleanStatus = String(status || '').toUpperCase();
    if (!['ACTIVE', 'REVOKED', 'DISABLED', 'EXPIRED'].includes(cleanStatus)) {
      const err = new Error('Status must be one of: ACTIVE, REVOKED, DISABLED, EXPIRED.');
      err.statusCode = 400;
      throw err;
    }

    if (cleanStatus === 'REVOKED' && (!reason || !String(reason).trim())) {
      const err = new Error('A reason is required when revoking a referral code.');
      err.statusCode = 400;
      throw err;
    }

    return {
      status: cleanStatus,
      reason: reason ? String(reason).trim() : null,
    };
  },

  validatePaymentBatch(payload) {
    if (!payload || typeof payload !== 'object') {
      const err = new Error('Invalid request payload.');
      err.statusCode = 400;
      throw err;
    }

    const { referrer_id, commission_ids, payment_method = 'Bank Transfer', transaction_reference, notes } = payload;

    if (!referrer_id || isNaN(Number(referrer_id))) {
      const err = new Error('Field "referrer_id" is required.');
      err.statusCode = 400;
      throw err;
    }

    if (!Array.isArray(commission_ids) || commission_ids.length === 0) {
      const err = new Error('Field "commission_ids" must be a non-empty array of commission IDs.');
      err.statusCode = 400;
      throw err;
    }

    const cleanedIds = commission_ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
    if (cleanedIds.length !== commission_ids.length) {
      const err = new Error('All entries in "commission_ids" must be valid positive integers.');
      err.statusCode = 400;
      throw err;
    }

    const uniqueIds = Array.from(new Set(cleanedIds));
    if (uniqueIds.length !== cleanedIds.length) {
      const err = new Error('"commission_ids" contains duplicate entries.');
      err.statusCode = 400;
      throw err;
    }

    return {
      referrer_id: Number(referrer_id),
      commission_ids: uniqueIds,
      payment_method: String(payment_method).trim() || 'Bank Transfer',
      transaction_reference: transaction_reference ? String(transaction_reference).trim() : null,
      notes: notes ? String(notes).trim() : null,
    };
  },

  validatePaginationAndFilters(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const allowedSortBy = [
      'created_at', 'updated_at', 'name', 'status', 'code', 'amount',
      'attributed_at', 'total_amount', 'paid_at', 'referrer_id', 'client_id'
    ];
    const sortBy = allowedSortBy.includes(query.sortBy) ? query.sortBy : 'created_at';
    const sortOrder = String(query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return {
      page,
      limit,
      offset,
      sortBy,
      sortOrder,
      search: query.search ? String(query.search).trim() : null,
      status: query.status ? String(query.status).trim() : null,
      referrer_type: query.referrer_type ? String(query.referrer_type).trim().toUpperCase() : null,
      referrer_id: query.referrer_id ? Number(query.referrer_id) : null,
      startDate: query.startDate ? new Date(query.startDate) : null,
      endDate: query.endDate ? new Date(query.endDate) : null,
    };
  },
};
