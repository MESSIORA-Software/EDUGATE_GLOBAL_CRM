import { pool } from '../database/dbPool.js';

export const ReferralRepository = {
  // ==========================================
  // STAFF / INTERNAL USER CHECK
  // ==========================================
  async isInternalStaffUser({ userId = null, email = null }) {
    if (userId) {
      const res = await pool.query(
        `SELECT user_id, email, role_id, status FROM public.users WHERE user_id = $1;`,
        [userId]
      );
      if (res.rows.length > 0) return res.rows[0];
    }
    if (email) {
      const res = await pool.query(
        `SELECT user_id, email, role_id, status FROM public.users WHERE LOWER(email) = LOWER($1);`,
        [email.trim()]
      );
      if (res.rows.length > 0) return res.rows[0];
    }
    return null;
  },

  // ==========================================
  // ROLE PERMISSIONS
  // ==========================================
  async getPermissionByRoleId(roleId) {
    const res = await pool.query(
      `SELECT * FROM public.referral_role_permissions WHERE role_id = $1;`,
      [roleId]
    );
    return res.rows[0] || null;
  },

  async getAllRolePermissions() {
    const res = await pool.query(
      `SELECT rrp.*, ur.role_name 
       FROM public.referral_role_permissions rrp
       JOIN public.user_roles ur ON rrp.role_id = ur.role_id
       ORDER BY rrp.created_at ASC;`
    );
    return res.rows;
  },

  async updateRolePermission(roleId, permissions, updatedBy) {
    const res = await pool.query(
      `UPDATE public.referral_role_permissions
       SET can_issue_codes = COALESCE($1, can_issue_codes),
           can_view_all_referrals = COALESCE($2, can_view_all_referrals),
           can_manage_payouts = COALESCE($3, can_manage_payouts),
           can_modify_settings = COALESCE($4, can_modify_settings),
           updated_by = $5,
           updated_at = NOW()
       WHERE role_id = $6
       RETURNING *;`,
      [
        permissions.can_issue_codes,
        permissions.can_view_all_referrals,
        permissions.can_manage_payouts,
        permissions.can_modify_settings,
        updatedBy || null,
        roleId,
      ]
    );
    return res.rows[0] || null;
  },

  // ==========================================
  // REFERRER IDENTITIES
  // ==========================================
  async createReferrer(referrerData, client = pool) {
    const res = await client.query(
      `INSERT INTO public.referrers (
         referrer_code, name, email, home_address, whatsapp_number, 
         phone_number, note, status, referrer_type, client_id, 
         payment_per_student, created_by, is_active, is_staff_blocked
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, TRUE)
       RETURNING *;`,
      [
        referrerData.referrer_code,
        referrerData.name,
        referrerData.email || null,
        referrerData.home_address || null,
        referrerData.whatsapp_number || null,
        referrerData.phone_number || null,
        referrerData.note || null,
        referrerData.status || 'Active',
        referrerData.referrer_type || 'EXTERNAL',
        referrerData.client_id || null,
        referrerData.payment_per_student || 1000,
        referrerData.created_by || null,
      ]
    );
    return res.rows[0];
  },

  async getReferrerById(referrerId) {
    const res = await pool.query(
      `SELECT r.*, c.name AS linked_student_name, c.email AS linked_student_email
       FROM public.referrers r
       LEFT JOIN public.clients c ON r.client_id = c.client_id
       WHERE r.referrer_id = $1;`,
      [referrerId]
    );
    return res.rows[0] || null;
  },

  async findReferrerByEmail(email) {
    if (!email) return null;
    const res = await pool.query(
      `SELECT * FROM public.referrers WHERE LOWER(email) = LOWER($1);`,
      [email.trim()]
    );
    return res.rows[0] || null;
  },

  async findReferrerByClientId(clientId) {
    if (!clientId) return null;
    const res = await pool.query(
      `SELECT * FROM public.referrers WHERE client_id = $1;`,
      [clientId]
    );
    return res.rows[0] || null;
  },

  async updateReferrer(referrerId, updateData) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    fields.push(`updated_at = NOW()`);
    values.push(referrerId);

    const query = `
      UPDATE public.referrers
      SET ${fields.join(', ')}
      WHERE referrer_id = $${idx}
      RETURNING *;
    `;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  },

  async listReferrers({ page, limit, offset, search, status, referrer_type, sortBy, sortOrder }) {
    const whereClauses = [];
    const values = [];
    let idx = 1;

    if (search) {
      whereClauses.push(`(r.name ILIKE $${idx} OR r.referrer_code ILIKE $${idx} OR r.email ILIKE $${idx} OR r.phone_number ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`LOWER(r.status) = LOWER($${idx})`);
      values.push(status);
      idx++;
    }

    if (referrer_type) {
      whereClauses.push(`r.referrer_type = $${idx}`);
      values.push(referrer_type);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM public.referrers r ${whereSql};`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    // List query with SQL aggregation for student counts, commissions, and payment status
    const dataQuery = `
      SELECT 
        r.*,
        COUNT(DISTINCT ra.attribution_id) AS student_count,
        COALESCE(SUM(rc.amount), 0) AS total_commission_amount,
        COALESCE(SUM(CASE WHEN rc.status = 'PAID' THEN rc.amount ELSE 0 END), 0) AS total_paid_amount,
        COALESCE(SUM(CASE WHEN rc.status = 'PENDING' THEN rc.amount ELSE 0 END), 0) AS total_pending_amount,
        COUNT(DISTINCT rcode.code_id) AS active_code_count
      FROM public.referrers r
      LEFT JOIN public.referral_codes rcode ON rcode.referrer_id = r.referrer_id AND rcode.status = 'ACTIVE'
      LEFT JOIN public.referral_attributions ra ON ra.referrer_id = r.referrer_id AND ra.status = 'ACTIVE'
      LEFT JOIN public.referral_commissions rc ON rc.referrer_id = r.referrer_id AND rc.status != 'CANCELLED'
      ${whereSql}
      GROUP BY r.referrer_id
      ORDER BY r.${sortBy} ${sortOrder}
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const dataRes = await pool.query(dataQuery, values);

    return {
      items: dataRes.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  // ==========================================
  // REFERRAL CODES
  // ==========================================
  async createReferralCode(codeData, client = pool) {
    const res = await client.query(
      `INSERT INTO public.referral_codes (
         code, referrer_id, status, expires_at, created_by, notes
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        codeData.code,
        codeData.referrer_id,
        codeData.status || 'ACTIVE',
        codeData.expires_at || null,
        codeData.created_by || null,
        codeData.notes || null,
      ]
    );
    return res.rows[0];
  },

  async isCodeExists(code) {
    const res = await pool.query(
      `SELECT 1 FROM public.referral_codes WHERE code = $1;`,
      [code]
    );
    return res.rows.length > 0;
  },

  async getCodeById(codeId) {
    const res = await pool.query(
      `SELECT rc.*, r.name AS referrer_name, r.referrer_type, r.email AS referrer_email, r.status AS referrer_status
       FROM public.referral_codes rc
       JOIN public.referrers r ON rc.referrer_id = r.referrer_id
       WHERE rc.code_id = $1;`,
      [codeId]
    );
    return res.rows[0] || null;
  },

  async findCodeByString(codeString) {
    const res = await pool.query(
      `SELECT rc.*, 
              r.name AS referrer_name, 
              r.referrer_type, 
              r.status AS referrer_status,
              r.payment_per_student,
              r.is_active AS referrer_is_active
       FROM public.referral_codes rc
       JOIN public.referrers r ON rc.referrer_id = r.referrer_id
       WHERE rc.code = $1;`,
      [codeString.trim().toUpperCase()]
    );
    return res.rows[0] || null;
  },

  async updateCodeStatus(codeId, { status, revokeReason, revokedBy }) {
    const res = await pool.query(
      `UPDATE public.referral_codes
       SET status = $1::varchar,
           revoked_at = CASE WHEN $1::varchar = 'REVOKED' THEN NOW() ELSE revoked_at END,
           revoked_by = CASE WHEN $1::varchar = 'REVOKED' THEN $2::bigint ELSE revoked_by END,
           revoke_reason = CASE WHEN $1::varchar = 'REVOKED' THEN $3::text ELSE revoke_reason END,
           updated_at = NOW()
       WHERE code_id = $4::int
       RETURNING *;`,
      [status, revokedBy || null, revokeReason || null, codeId]
    );
    return res.rows[0] || null;
  },

  async listCodes({ page, limit, offset, search, status, referrer_id, sortBy, sortOrder }) {
    const whereClauses = [];
    const values = [];
    let idx = 1;

    if (search) {
      whereClauses.push(`(rc.code ILIKE $${idx} OR r.name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`rc.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (referrer_id) {
      whereClauses.push(`rc.referrer_id = $${idx}`);
      values.push(referrer_id);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) 
       FROM public.referral_codes rc 
       JOIN public.referrers r ON rc.referrer_id = r.referrer_id 
       ${whereSql};`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const query = `
      SELECT 
        rc.*,
        r.name AS referrer_name,
        r.referrer_type,
        r.status AS referrer_status,
        COUNT(ra.attribution_id) AS student_count
      FROM public.referral_codes rc
      JOIN public.referrers r ON rc.referrer_id = r.referrer_id
      LEFT JOIN public.referral_attributions ra ON ra.referral_code_id = rc.code_id AND ra.status = 'ACTIVE'
      ${whereSql}
      GROUP BY rc.code_id, r.name, r.referrer_type, r.status
      ORDER BY rc.${sortBy} ${sortOrder}
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const dataRes = await pool.query(query, values);

    return {
      items: dataRes.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  // ==========================================
  // REFERRAL ATTRIBUTIONS & COMMISSIONS
  // ==========================================
  async getActiveAttributionByClientId(clientId, client = pool) {
    const res = await client.query(
      `SELECT * FROM public.referral_attributions 
       WHERE client_id = $1 AND status = 'ACTIVE';`,
      [clientId]
    );
    return res.rows[0] || null;
  },

  async createAttribution(attributionData, client = pool) {
    const res = await client.query(
      `INSERT INTO public.referral_attributions (
         client_id, referral_code_id, referrer_id, registered_by, status, notes
       ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
       RETURNING *;`,
      [
        attributionData.client_id,
        attributionData.referral_code_id,
        attributionData.referrer_id,
        attributionData.registered_by || null,
        attributionData.notes || null,
      ]
    );
    return res.rows[0];
  },

  async createCommission(commissionData, client = pool) {
    const res = await client.query(
      `INSERT INTO public.referral_commissions (
         attribution_id, referrer_id, client_id, amount, currency, status, rate_snapshot
       ) VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
       RETURNING *;`,
      [
        commissionData.attribution_id,
        commissionData.referrer_id,
        commissionData.client_id,
        commissionData.amount,
        commissionData.currency || 'LKR',
        commissionData.rate_snapshot || commissionData.amount,
      ]
    );
    return res.rows[0];
  },

  async getCommissionById(commissionId, client = pool) {
    const res = await client.query(
      `SELECT rc.*, 
              c.name AS student_name, 
              c.email AS student_email,
              r.name AS referrer_name,
              code.code AS referral_code
       FROM public.referral_commissions rc
       JOIN public.clients c ON rc.client_id = c.client_id
       JOIN public.referrers r ON rc.referrer_id = r.referrer_id
       JOIN public.referral_attributions ra ON rc.attribution_id = ra.attribution_id
       JOIN public.referral_codes code ON ra.referral_code_id = code.code_id
       WHERE rc.commission_id = $1;`,
      [commissionId]
    );
    return res.rows[0] || null;
  },

  async lockCommissionsForUpdate(commissionIds, client) {
    const res = await client.query(
      `SELECT rc.*, r.name AS referrer_name 
       FROM public.referral_commissions rc
       JOIN public.referrers r ON rc.referrer_id = r.referrer_id
       WHERE rc.commission_id = ANY($1::int[])
       FOR UPDATE OF rc;`,
      [commissionIds]
    );
    return res.rows;
  },

  async listCommissions({ page, limit, offset, referrer_id, status, client_id, search, sortBy, sortOrder }) {
    const whereClauses = [];
    const values = [];
    let idx = 1;

    if (referrer_id) {
      whereClauses.push(`rc.referrer_id = $${idx}`);
      values.push(referrer_id);
      idx++;
    }

    if (status) {
      whereClauses.push(`rc.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (client_id) {
      whereClauses.push(`rc.client_id = $${idx}`);
      values.push(client_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(c.name ILIKE $${idx} OR r.name ILIKE $${idx} OR code.code ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) 
       FROM public.referral_commissions rc
       JOIN public.clients c ON rc.client_id = c.client_id
       JOIN public.referrers r ON rc.referrer_id = r.referrer_id
       JOIN public.referral_attributions ra ON rc.attribution_id = ra.attribution_id
       JOIN public.referral_codes code ON ra.referral_code_id = code.code_id
       ${whereSql};`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT 
        rc.*,
        c.name AS student_name,
        c.email AS student_email,
        r.name AS referrer_name,
        code.code AS referral_code,
        pb.batch_reference,
        pb.batch_id
      FROM public.referral_commissions rc
      JOIN public.clients c ON rc.client_id = c.client_id
      JOIN public.referrers r ON rc.referrer_id = r.referrer_id
      JOIN public.referral_attributions ra ON rc.attribution_id = ra.attribution_id
      JOIN public.referral_codes code ON ra.referral_code_id = code.code_id
      LEFT JOIN public.referral_payment_items rpi ON rpi.commission_id = rc.commission_id
      LEFT JOIN public.referral_payment_batches pb ON pb.batch_id = rpi.batch_id
      ${whereSql}
      ORDER BY rc.${sortBy} ${sortOrder}
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const dataRes = await pool.query(dataQuery, values);

    return {
      items: dataRes.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  async getStudentsByReferralCodeId(codeId) {
    const res = await pool.query(
      `SELECT 
         c.client_id,
         c.name AS student_name,
         c.email AS student_email,
         c.created_at AS registered_at,
         ra.attribution_id,
         ra.attributed_at,
         ra.status AS attribution_status,
         rc.commission_id,
         rc.amount AS commission_amount,
         rc.status AS commission_status,
         rc.paid_at
       FROM public.referral_attributions ra
       JOIN public.clients c ON ra.client_id = c.client_id
       LEFT JOIN public.referral_commissions rc ON rc.attribution_id = ra.attribution_id
       WHERE ra.referral_code_id = $1
       ORDER BY ra.attributed_at DESC;`,
      [codeId]
    );
    return res.rows;
  },

  // ==========================================
  // BULK PAYMENT BATCHES
  // ==========================================
  async createPaymentBatch(batchData, client) {
    const res = await client.query(
      `INSERT INTO public.referral_payment_batches (
         batch_reference, referrer_id, total_amount, currency, 
         commission_count, payment_method, transaction_reference, notes, 
         status, paid_by, paid_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'COMPLETED', $9, NOW())
       RETURNING *;`,
      [
        batchData.batch_reference,
        batchData.referrer_id,
        batchData.total_amount,
        batchData.currency || 'LKR',
        batchData.commission_count,
        batchData.payment_method || 'Bank Transfer',
        batchData.transaction_reference || null,
        batchData.notes || null,
        batchData.paid_by || null,
      ]
    );
    return res.rows[0];
  },

  async createPaymentItems(items, client) {
    const inserted = [];
    for (const item of items) {
      const res = await client.query(
        `INSERT INTO public.referral_payment_items (
           batch_id, commission_id, amount, currency
         ) VALUES ($1, $2, $3, $4)
         RETURNING *;`,
        [item.batch_id, item.commission_id, item.amount, item.currency || 'LKR']
      );
      inserted.push(res.rows[0]);
    }
    return inserted;
  },

  async markCommissionsAsPaid(commissionIds, client) {
    const res = await client.query(
      `UPDATE public.referral_commissions
       SET status = 'PAID',
           paid_at = NOW(),
           updated_at = NOW()
       WHERE commission_id = ANY($1::int[])
       RETURNING *;`,
      [commissionIds]
    );
    return res.rows;
  },

  async listPaymentBatches({ page, limit, offset, referrer_id, sortBy, sortOrder }) {
    const whereClauses = [];
    const values = [];
    let idx = 1;

    if (referrer_id) {
      whereClauses.push(`pb.referrer_id = $${idx}`);
      values.push(referrer_id);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM public.referral_payment_batches pb ${whereSql};`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const query = `
      SELECT 
        pb.*,
        r.name AS referrer_name,
        r.referrer_code,
        u.name AS paid_by_name
      FROM public.referral_payment_batches pb
      JOIN public.referrers r ON pb.referrer_id = r.referrer_id
      LEFT JOIN public.users u ON pb.paid_by = u.user_id
      ${whereSql}
      ORDER BY pb.${sortBy} ${sortOrder}
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const dataRes = await pool.query(query, values);

    return {
      items: dataRes.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  async getPaymentBatchById(batchId) {
    const batchRes = await pool.query(
      `SELECT pb.*, r.name AS referrer_name, r.referrer_code, u.name AS paid_by_name
       FROM public.referral_payment_batches pb
       JOIN public.referrers r ON pb.referrer_id = r.referrer_id
       LEFT JOIN public.users u ON pb.paid_by = u.user_id
       WHERE pb.batch_id = $1;`,
      [batchId]
    );
    if (!batchRes.rows[0]) return null;

    const itemsRes = await pool.query(
      `SELECT rpi.*, rc.amount, rc.client_id, c.name AS student_name, c.email AS student_email
       FROM public.referral_payment_items rpi
       JOIN public.referral_commissions rc ON rpi.commission_id = rc.commission_id
       JOIN public.clients c ON rc.client_id = c.client_id
       WHERE rpi.batch_id = $1;`,
      [batchId]
    );

    return {
      ...batchRes.rows[0],
      items: itemsRes.rows,
    };
  },

  async getCommissionByAttributionId(attributionId, client = pool) {
    const res = await client.query(
      `SELECT * FROM public.referral_commissions WHERE attribution_id = $1;`,
      [attributionId]
    );
    return res.rows[0] || null;
  },

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================
  async getDashboardStatistics(referrerId = null) {
    const values = [];
    let refFilter = '';
    if (referrerId) {
      refFilter = 'WHERE r.referrer_id = $1';
      values.push(referrerId);
    }

    const query = `
      SELECT 
        COUNT(DISTINCT r.referrer_id) AS total_referrers,
        COUNT(DISTINCT rc.code_id) AS total_codes,
        COUNT(DISTINCT CASE WHEN rc.status = 'ACTIVE' THEN rc.code_id END) AS active_codes,
        COUNT(DISTINCT ra.attribution_id) AS total_referred_students,
        COUNT(DISTINCT comm.attribution_id) AS qualified_students,
        GREATEST(0, COUNT(DISTINCT ra.attribution_id) - COUNT(DISTINCT comm.attribution_id)) AS unqualified_referred_students,
        COALESCE(SUM(comm.amount), 0) AS total_commission_amount,
        COALESCE(SUM(CASE WHEN comm.status = 'PAID' THEN comm.amount ELSE 0 END), 0) AS total_paid_amount,
        COALESCE(SUM(CASE WHEN comm.status = 'PENDING' THEN comm.amount ELSE 0 END), 0) AS total_pending_amount,
        COUNT(DISTINCT CASE WHEN comm.status = 'PAID' THEN comm.commission_id END) AS paid_commissions_count,
        COUNT(DISTINCT CASE WHEN comm.status = 'PENDING' THEN comm.commission_id END) AS pending_commissions_count
      FROM public.referrers r
      LEFT JOIN public.referral_codes rc ON rc.referrer_id = r.referrer_id
      LEFT JOIN public.referral_attributions ra ON ra.referrer_id = r.referrer_id AND ra.status = 'ACTIVE'
      LEFT JOIN public.referral_commissions comm ON comm.referrer_id = r.referrer_id AND comm.status != 'CANCELLED'
      ${refFilter};
    `;

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async createAuditLog(logData, client = pool) {
    try {
      await client.query(
        `INSERT INTO public.referral_audit_logs (
           action, entity_type, entity_id, actor_id, actor_email, 
           actor_role, ip_address, user_agent, before_state, after_state, reason
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          logData.action,
          logData.entity_type,
          String(logData.entity_id),
          logData.actor_id || null,
          logData.actor_email || null,
          logData.actor_role || null,
          logData.ip_address || null,
          logData.user_agent || null,
          logData.before_state ? JSON.stringify(logData.before_state) : null,
          logData.after_state ? JSON.stringify(logData.after_state) : null,
          logData.reason || null,
        ]
      );
    } catch (err) {
      console.warn('[ReferralAuditLog] Failed to record audit log:', err.message);
    }
  },

  async listAuditLogs({ page, limit, offset, entity_type, entity_id, action }) {
    const whereClauses = [];
    const values = [];
    let idx = 1;

    if (entity_type) {
      whereClauses.push(`entity_type = $${idx}`);
      values.push(entity_type);
      idx++;
    }

    if (entity_id) {
      whereClauses.push(`entity_id = $${idx}`);
      values.push(String(entity_id));
      idx++;
    }

    if (action) {
      whereClauses.push(`action = $${idx}`);
      values.push(action);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM public.referral_audit_logs ${whereSql};`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT * FROM public.referral_audit_logs
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const dataRes = await pool.query(dataQuery, values);

    return {
      items: dataRes.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  // ==========================================
  // REFERRAL SETTINGS: COMMISSION TRIGGER STAGE
  // ==========================================
  async getCommissionTriggerStageConfig() {
    const res = await pool.query(
      `SELECT rs.id, rs.commission_trigger_stage_id, rs.updated_by, rs.updated_at,
              os.status_name, os.stage_order, os.is_active
       FROM public.referral_settings rs
       LEFT JOIN public.opportunity_statuses os ON rs.commission_trigger_stage_id = os.status_id
       WHERE rs.id = 1;`
    );
    return res.rows[0] || null;
  },

  async updateCommissionTriggerStageConfig(stageId, updatedBy = null, client = pool) {
    const res = await client.query(
      `UPDATE public.referral_settings
       SET commission_trigger_stage_id = $1,
           updated_by = $2,
           updated_at = NOW()
       WHERE id = 1
       RETURNING *;`,
      [stageId !== null && stageId !== undefined ? Number(stageId) : null, updatedBy || null]
    );
    return res.rows[0] || null;
  },
};
