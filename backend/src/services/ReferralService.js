import crypto from 'crypto';
import QRCode from 'qrcode';
import { pool } from '../database/dbPool.js';
import { ReferralRepository } from '../repositories/ReferralRepository.js';
import { ReferralValidator } from '../validators/ReferralValidator.js';
import { config } from '../config/index.js';

// Cryptographically secure, unambiguous character set (no 0/O, 1/I/L)
const CODE_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function generateRandomCode(length = 8) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  return `REF-${result}`;
}

export const ReferralService = {
  // ==========================================
  // AUTHORIZATION & RBAC HELPERS
  // ==========================================
  isSuperAdmin(user) {
    if (!user) return false;
    const roleId = String(user.role_id || '').toUpperCase();
    const roleName = String(user.role_name || '').toLowerCase();
    return (
      roleId === 'SUPER_ADMIN' ||
      roleId === 'EDUGATE_SUPER_ADMIN' ||
      roleName === 'super admin'
    );
  },

  isAdmin(user) {
    if (!user) return false;
    if (this.isSuperAdmin(user)) return true;
    const roleId = String(user.role_id || '').toUpperCase();
    const roleName = String(user.role_name || '').toLowerCase();
    return (
      config.roles.adminRoleIds.includes(roleId) ||
      roleId === 'ADMIN' ||
      roleId === 'EDUGATE_ADMIN' ||
      roleName === 'admin'
    );
  },

  async assertCanIssueCodes(currentUser) {
    if (this.isSuperAdmin(currentUser)) return true;
    if (!currentUser || !currentUser.role_id) {
      const err = new Error('Authentication required.');
      err.statusCode = 401;
      throw err;
    }
    const perm = await ReferralRepository.getPermissionByRoleId(currentUser.role_id);
    if (!perm || !perm.can_issue_codes) {
      const err = new Error('Access denied: You do not have permission to issue referral codes.');
      err.statusCode = 403;
      throw err;
    }
    return true;
  },

  async assertCanManagePayouts(currentUser) {
    if (this.isSuperAdmin(currentUser)) return true;
    if (!currentUser || !currentUser.role_id) {
      const err = new Error('Authentication required.');
      err.statusCode = 401;
      throw err;
    }
    const perm = await ReferralRepository.getPermissionByRoleId(currentUser.role_id);
    if (!perm || !perm.can_manage_payouts) {
      const err = new Error('Access denied: You do not have permission to process referral payouts.');
      err.statusCode = 403;
      throw err;
    }
    return true;
  },

  async assertCanModifySettings(currentUser) {
    if (this.isSuperAdmin(currentUser) || this.isAdmin(currentUser)) return true;
    if (currentUser?.role_id) {
      const perm = await ReferralRepository.getPermissionByRoleId(currentUser.role_id);
      if (perm && perm.can_modify_settings) return true;
    }
    const err = new Error('Administrator access required to modify referral settings or permissions.');
    err.statusCode = 403;
    throw err;
  },

  async assertCanSetCommissionRate(currentUser) {
    if (this.isSuperAdmin(currentUser) || this.isAdmin(currentUser)) return true;
    if (currentUser?.role_id) {
      const perm = await ReferralRepository.getPermissionByRoleId(currentUser.role_id);
      if (perm && perm.can_modify_settings) return true;
    }
    const err = new Error('Access denied: Staff users are not authorized to configure or modify referral commission rates.');
    err.statusCode = 403;
    throw err;
  },

  // ==========================================
  // STAFF ELIGIBILITY CHECK (STRICT ENFORCEMENT)
  // ==========================================
  async assertReferrerNotStaff({ email, userId = null }) {
    if (userId) {
      const staffUser = await ReferralRepository.isInternalStaffUser({ userId });
      if (staffUser) {
        const err = new Error(
          'Security Policy Violation: Staff members and internal employees cannot receive personal referral codes or earn referral commissions.'
        );
        err.statusCode = 403;
        throw err;
      }
    }

    if (email) {
      const staffUser = await ReferralRepository.isInternalStaffUser({ email });
      if (staffUser) {
        const err = new Error(
          'Security Policy Violation: Staff members and internal employees cannot receive personal referral codes or earn referral commissions.'
        );
        err.statusCode = 403;
        throw err;
      }
    }
  },

  // ==========================================
  // CODE GENERATION
  // ==========================================
  async generateUniqueReferralCode(customCode = null) {
    if (customCode) {
      const exists = await ReferralRepository.isCodeExists(customCode);
      if (exists) {
        const err = new Error(`Referral code '${customCode}' is already in use.`);
        err.statusCode = 409;
        throw err;
      }
      return customCode;
    }

    let attempts = 0;
    while (attempts < 5) {
      const candidate = generateRandomCode(8);
      const exists = await ReferralRepository.isCodeExists(candidate);
      if (!exists) {
        return candidate;
      }
      attempts++;
    }

    // Fallback with timestamp suffix to guarantee uniqueness under extreme load
    return `REF-${Date.now().toString(36).toUpperCase()}-${generateRandomCode(4).substring(4)}`;
  },

  // ==========================================
  // REFERRER CREATION & CODE ISSUANCE
  // ==========================================
  async createReferrer(payload, currentUser, requestMeta = {}) {
    await this.assertCanIssueCodes(currentUser);
    const validated = ReferralValidator.validateCreateReferrer(payload);

    // Business Rule Check: Verify this person is not an internal staff member
    await this.assertReferrerNotStaff({ email: validated.email });

    // Commission Rate check: Staff users cannot set or customize commission rate
    let effectiveRate = 1000;
    try {
      const defaultSetting = await pool.query(
        `SELECT value FROM public.referrer_settings WHERE key = 'payment_per_student' LIMIT 1;`
      );
      if (defaultSetting.rows.length > 0 && defaultSetting.rows[0].value) {
        effectiveRate = Number(defaultSetting.rows[0].value) || 1000;
      }
    } catch (_) {}

    if (validated.payment_per_student !== undefined && validated.payment_per_student !== null) {
      if (Number(validated.payment_per_student) !== effectiveRate) {
        await this.assertCanSetCommissionRate(currentUser);
      }
      effectiveRate = Number(validated.payment_per_student);
    }

    // Check if referrer entity already exists by email or client_id to prevent duplicates
    let existing = null;
    if (validated.email) {
      existing = await ReferralRepository.findReferrerByEmail(validated.email);
    }
    if (!existing && validated.client_id) {
      existing = await ReferralRepository.findReferrerByClientId(validated.client_id);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let referrer = existing;
      if (!referrer) {
        // Generate an initial primary code string for backward compatibility column
        const primaryCode = await this.generateUniqueReferralCode(validated.custom_code);
        referrer = await ReferralRepository.createReferrer(
          {
            referrer_code: primaryCode,
            name: validated.name,
            email: validated.email,
            phone_number: validated.phone_number,
            whatsapp_number: validated.whatsapp_number,
            home_address: validated.home_address,
            note: validated.note,
            referrer_type: validated.referrer_type,
            client_id: validated.client_id,
            payment_per_student: effectiveRate,
            created_by: currentUser.user_id,
          },
          client
        );

        // Also insert into authoritative referral_codes table
        const codeRecord = await ReferralRepository.createReferralCode(
          {
            code: primaryCode,
            referrer_id: referrer.referrer_id,
            status: 'ACTIVE',
            expires_at: validated.expires_at,
            created_by: currentUser.user_id,
            notes: 'Primary referral code issued upon registration',
          },
          client
        );

        referrer.primary_code = codeRecord;
      } else {
        // If entity already exists, issue a new referral code for them if requested
        const newCode = await this.generateUniqueReferralCode(validated.custom_code);
        const codeRecord = await ReferralRepository.createReferralCode(
          {
            code: newCode,
            referrer_id: referrer.referrer_id,
            status: 'ACTIVE',
            expires_at: validated.expires_at,
            created_by: currentUser.user_id,
            notes: validated.note || 'Additional referral code issued',
          },
          client
        );
        referrer.issued_code = codeRecord;
      }

      // Record Audit Log
      await ReferralRepository.createAuditLog(
        {
          action: 'REFERRER_AND_CODE_CREATED',
          entity_type: 'referrer',
          entity_id: referrer.referrer_id,
          actor_id: currentUser.user_id,
          actor_email: currentUser.email,
          actor_role: currentUser.role_id,
          ip_address: requestMeta.ip,
          user_agent: requestMeta.userAgent,
          after_state: referrer,
        },
        client
      );

      await client.query('COMMIT');
      return referrer;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateReferrer(referrerId, payload, currentUser, requestMeta = {}) {
    if (!referrerId) {
      const err = new Error('Referrer ID is required.');
      err.statusCode = 400;
      throw err;
    }

    const existing = await ReferralRepository.getReferrerById(referrerId);
    if (!existing) {
      const err = new Error(`Referrer with ID ${referrerId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    // Commission Rate check: Staff users cannot modify commission rate
    if (
      payload.payment_per_student !== undefined &&
      payload.payment_per_student !== null &&
      Number(payload.payment_per_student) !== Number(existing.payment_per_student)
    ) {
      await this.assertCanSetCommissionRate(currentUser);
    }

    const updateData = {};
    if (payload.name !== undefined) updateData.name = payload.name?.trim();
    if (payload.email !== undefined) {
      await this.assertReferrerNotStaff({ email: payload.email });
      updateData.email = payload.email ? payload.email.trim() : null;
    }
    if (payload.home_address !== undefined) updateData.home_address = payload.home_address ? payload.home_address.trim() : null;
    if (payload.whatsapp_number !== undefined) updateData.whatsapp_number = payload.whatsapp_number ? payload.whatsapp_number.trim() : null;
    if (payload.phone_number !== undefined) updateData.phone_number = payload.phone_number ? payload.phone_number.trim() : null;
    if (payload.note !== undefined) updateData.note = payload.note ? payload.note.trim() : null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.referrer_type !== undefined) updateData.referrer_type = payload.referrer_type;
    if (payload.payment_per_student !== undefined && (this.isAdmin(currentUser) || this.isSuperAdmin(currentUser))) {
      updateData.payment_per_student = Number(payload.payment_per_student);
    }

    const updated = await ReferralRepository.updateReferrer(referrerId, updateData);

    await ReferralRepository.createAuditLog({
      action: 'REFERRER_UPDATED',
      entity_type: 'referrer',
      entity_id: referrerId,
      actor_id: currentUser?.user_id || null,
      actor_email: currentUser?.email || null,
      actor_role: currentUser?.role_id || null,
      ip_address: requestMeta.ip || null,
      user_agent: requestMeta.userAgent || null,
      before_state: existing,
      after_state: updated,
    });

    return updated;
  },

  async issueAdditionalCode(payload, currentUser, requestMeta = {}) {
    await this.assertCanIssueCodes(currentUser);
    const validated = ReferralValidator.validateIssueCode(payload);

    const referrer = await ReferralRepository.getReferrerById(validated.referrer_id);
    if (!referrer) {
      const err = new Error(`Referrer with ID ${validated.referrer_id} not found.`);
      err.statusCode = 404;
      throw err;
    }

    if (String(referrer.status).toLowerCase() !== 'active') {
      const err = new Error('Cannot issue code to an inactive or suspended referrer.');
      err.statusCode = 400;
      throw err;
    }

    // Business Rule Check: Verify referrer is not staff
    await this.assertReferrerNotStaff({ email: referrer.email });

    const code = await this.generateUniqueReferralCode(validated.custom_code);
    const codeRecord = await ReferralRepository.createReferralCode({
      code,
      referrer_id: referrer.referrer_id,
      status: 'ACTIVE',
      expires_at: validated.expires_at,
      created_by: currentUser.user_id,
      notes: validated.notes,
    });

    await ReferralRepository.createAuditLog({
      action: 'REFERRAL_CODE_ISSUED',
      entity_type: 'referral_code',
      entity_id: codeRecord.code_id,
      actor_id: currentUser.user_id,
      actor_email: currentUser.email,
      actor_role: currentUser.role_id,
      ip_address: requestMeta.ip,
      user_agent: requestMeta.userAgent,
      after_state: codeRecord,
    });

    return codeRecord;
  },

  async updateCodeStatus(codeId, payload, currentUser, requestMeta = {}) {
    const validated = ReferralValidator.validateUpdateCodeStatus(payload);
    const existingCode = await ReferralRepository.getCodeById(codeId);
    if (!existingCode) {
      const err = new Error(`Referral code with ID ${codeId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    const updated = await ReferralRepository.updateCodeStatus(codeId, {
      status: validated.status,
      revokeReason: validated.reason,
      revokedBy: currentUser.user_id,
    });

    await ReferralRepository.createAuditLog({
      action: `REFERRAL_CODE_${validated.status}`,
      entity_type: 'referral_code',
      entity_id: codeId,
      actor_id: currentUser.user_id,
      actor_email: currentUser.email,
      actor_role: currentUser.role_id,
      ip_address: requestMeta.ip,
      user_agent: requestMeta.userAgent,
      before_state: existingCode,
      after_state: updated,
      reason: validated.reason,
    });

    return updated;
  },

  // ==========================================
  // CODE VALIDATION & LOOKUP
  // ==========================================
  async validateCodeForPublic(codeString) {
    if (!codeString || typeof codeString !== 'string') {
      return { valid: false, message: 'Referral code is required.' };
    }

    const code = await ReferralRepository.findCodeByString(codeString);
    if (!code) {
      return { valid: false, message: 'Invalid referral code.' };
    }

    if (code.status !== 'ACTIVE') {
      return { valid: false, message: `Referral code is ${code.status.toLowerCase()}.` };
    }

    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return { valid: false, message: 'Referral code has expired.' };
    }

    if (code.referrer_status && code.referrer_status.toLowerCase() !== 'active') {
      return { valid: false, message: 'Referrer is currently inactive.' };
    }

    // Return sanitized public info only. No phone, email, internal IDs or financial details.
    return {
      valid: true,
      code: code.code,
      referrer_name: code.referrer_name,
      referrer_type: code.referrer_type,
    };
  },

  async validateCodeForInternal(codeString) {
    if (!codeString || typeof codeString !== 'string') {
      const err = new Error('Referral code is required.');
      err.statusCode = 400;
      throw err;
    }

    const code = await ReferralRepository.findCodeByString(codeString);
    if (!code) {
      const err = new Error(`Referral code '${codeString}' does not exist.`);
      err.statusCode = 404;
      throw err;
    }

    if (code.status !== 'ACTIVE') {
      const err = new Error(`Referral code '${code.code}' is ${code.status.toLowerCase()} and cannot be used.`);
      err.statusCode = 400;
      throw err;
    }

    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      const err = new Error(`Referral code '${code.code}' has expired.`);
      err.statusCode = 400;
      throw err;
    }

    if (code.referrer_status && code.referrer_status.toLowerCase() !== 'active') {
      const err = new Error('Referrer is currently inactive or suspended.');
      err.statusCode = 400;
      throw err;
    }

    return code;
  },

  // ==========================================
  // STUDENT REGISTRATION INTEGRATION
  // ==========================================
  async attributeStudentRegistration({ clientId, referralCodeString, registeredBy, clientDbClient }) {
    if (!clientId) {
      throw new Error('clientId is required for referral attribution.');
    }
    if (!referralCodeString) {
      return null; // No referral code used; normal student registration
    }

    // 1. Authoritative code validation
    const code = await this.validateCodeForInternal(referralCodeString);

    // 2. Prevent duplicate active referral attribution on the same student
    const existingAttr = await ReferralRepository.getActiveAttributionByClientId(clientId, clientDbClient);
    if (existingAttr) {
      const err = new Error(`Student ${clientId} already has an active referral attribution.`);
      err.statusCode = 409;
      throw err;
    }

    // 3. Create attribution record
    const attribution = await ReferralRepository.createAttribution(
      {
        client_id: clientId,
        referral_code_id: code.code_id,
        referrer_id: code.referrer_id,
        registered_by: registeredBy || null,
        notes: `Attributed via referral code ${code.code}`,
      },
      clientDbClient
    );

    // Commission is NOT created at registration time.
    // It will be created when the student enters the configured Referral Qualification Stage.
    const commission = null;

    // 4. Audit Log
    await ReferralRepository.createAuditLog(
      {
        action: 'REFERRAL_ATTRIBUTION_CREATED',
        entity_type: 'referral_attribution',
        entity_id: attribution.attribution_id,
        actor_id: registeredBy || null,
        after_state: { attribution, commission_status: 'AWAITING_STAGE_QUALIFICATION' },
      },
      clientDbClient
    );

    return { attribution, commission, code };
  },

  // ==========================================
  // PIPELINE STAGE REFERRAL QUALIFICATION SETTINGS
  // ==========================================
  async getCommissionTriggerStageConfig() {
    return await ReferralRepository.getCommissionTriggerStageConfig();
  },

  async updateCommissionTriggerStageConfig(stageId, currentUser, requestMeta = {}) {
    await this.assertCanModifySettings(currentUser);

    const prevConfig = await ReferralRepository.getCommissionTriggerStageConfig();

    let targetStageId = null;
    if (stageId !== null && stageId !== undefined && stageId !== '') {
      const parsedId = Number(stageId);
      if (isNaN(parsedId) || !Number.isInteger(parsedId)) {
        const err = new Error('Invalid pipeline stage ID provided.');
        err.statusCode = 400;
        throw err;
      }

      // Validate stage exists and is active
      const stageRes = await pool.query(
        `SELECT status_id, status_name, is_active FROM public.opportunity_statuses WHERE status_id = $1;`,
        [parsedId]
      );
      if (stageRes.rows.length === 0 || !stageRes.rows[0].is_active) {
        const err = new Error('Selected pipeline stage does not exist or is not active.');
        err.statusCode = 400;
        throw err;
      }
      targetStageId = parsedId;
    }

    await ReferralRepository.updateCommissionTriggerStageConfig(
      targetStageId,
      currentUser?.user_id || null
    );

    const newConfig = await ReferralRepository.getCommissionTriggerStageConfig();

    // Audit Log
    await ReferralRepository.createAuditLog({
      action: 'REFERRAL_SETTING_TRIGGER_STAGE_UPDATED',
      entity_type: 'referral_setting',
      entity_id: 1,
      actor_id: currentUser?.user_id || null,
      actor_email: currentUser?.email || null,
      actor_role: currentUser?.role_id || null,
      ip_address: requestMeta.ip || null,
      user_agent: requestMeta.userAgent || null,
      before_state: prevConfig,
      after_state: newConfig,
      reason: `Commission trigger stage updated to ${targetStageId ? `stage ${targetStageId}` : 'none (disabled)'}`,
    });

    return newConfig;
  },

  async isQualifyingPipelineStatus(statusId) {
    if (!statusId) return false;
    const config = await ReferralRepository.getCommissionTriggerStageConfig();
    if (!config || config.commission_trigger_stage_id === null || config.commission_trigger_stage_id === undefined) {
      return false;
    }
    return Number(statusId) === Number(config.commission_trigger_stage_id);
  },

  async checkAndQualifyReferral({ clientId, statusId, actorId = null, requestMeta = {} }) {
    if (!clientId || !statusId) return null;

    // 1. Determine if this status is the existing qualifying pipeline stage
    const isQualifying = await this.isQualifyingPipelineStatus(statusId);
    if (!isQualifying) {
      return null; // Not the qualifying stage; no commission
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 2. Lock and retrieve active referral attribution for this student
      const attrRes = await client.query(
        `SELECT ra.*, r.payment_per_student, r.referrer_id, r.name AS referrer_name, code.code AS referral_code
         FROM public.referral_attributions ra
         JOIN public.referrers r ON ra.referrer_id = r.referrer_id
         JOIN public.referral_codes code ON ra.referral_code_id = code.code_id
         WHERE ra.client_id = $1 AND ra.status = 'ACTIVE'
         FOR UPDATE OF ra;`,
        [clientId]
      );

      if (attrRes.rows.length === 0) {
        // Student was not referred or has no active attribution
        await client.query('COMMIT');
        return null;
      }

      const attribution = attrRes.rows[0];

      // 3. Check if commission already exists (guaranteeing EXACTLY-ONCE creation)
      const existingComm = await client.query(
        `SELECT * FROM public.referral_commissions 
         WHERE attribution_id = $1 
         FOR UPDATE;`,
        [attribution.attribution_id]
      );

      if (existingComm.rows.length > 0) {
        // Commission already exists. Idempotent return without duplicate creation
        await client.query('COMMIT');
        return existingComm.rows[0];
      }

      // 4. Snapshot commission amount from referrer
      const rate = Number(attribution.payment_per_student) || 1000;

      // 5. Create commission record
      const commRes = await client.query(
        `INSERT INTO public.referral_commissions 
           (attribution_id, referrer_id, client_id, amount, currency, status, rate_snapshot, created_at)
         VALUES 
           ($1, $2, $3, $4, 'LKR', 'PENDING', $4, NOW())
         ON CONFLICT (attribution_id) DO NOTHING
         RETURNING *;`,
        [attribution.attribution_id, attribution.referrer_id, clientId, rate]
      );

      const commission = commRes.rows[0];

      // 6. Audit Log
      if (commission) {
        await client.query(
          `INSERT INTO public.referral_audit_logs (
             action, entity_type, entity_id, actor_id, actor_email, 
             actor_role, ip_address, user_agent, after_state
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            'REFERRAL_COMMISSION_QUALIFIED_BY_STAGE',
            'referral_commission',
            String(commission.commission_id),
            actorId || null,
            null,
            null,
            requestMeta.ip || null,
            requestMeta.userAgent || null,
            JSON.stringify({
              client_id: clientId,
              stage_id: statusId,
              attribution_id: attribution.attribution_id,
              amount: rate,
              status: 'PENDING',
            }),
          ]
        );
      }

      await client.query('COMMIT');
      return commission || null;
    } catch (err) {
      await client.query('ROLLBACK');
      console.warn('[ReferralQualification] Failed to process qualification:', err.message);
      throw err;
    } finally {
      client.release();
    }
  },

  // ==========================================
  // BULK PAYMENT PROCESSING
  // ==========================================
  async processBulkPayment(payload, currentUser, requestMeta = {}) {
    await this.assertCanManagePayouts(currentUser);
    const validated = ReferralValidator.validatePaymentBatch(payload);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock candidate commissions with FOR UPDATE to prevent race conditions & double-payment
      const commissions = await ReferralRepository.lockCommissionsForUpdate(validated.commission_ids, client);

      if (commissions.length !== validated.commission_ids.length) {
        const foundIds = commissions.map(c => c.commission_id);
        const missing = validated.commission_ids.filter(id => !foundIds.includes(id));
        const err = new Error(`Commissions not found: [${missing.join(', ')}]`);
        err.statusCode = 404;
        throw err;
      }

      // 2. Validate that each commission belongs to the intended referrer and is strictly PENDING
      let serverCalculatedTotal = 0;
      for (const comm of commissions) {
        if (Number(comm.referrer_id) !== validated.referrer_id) {
          const err = new Error(
            `Security Violation: Commission #${comm.commission_id} does not belong to referrer ${validated.referrer_id}.`
          );
          err.statusCode = 400;
          throw err;
        }

        if (comm.status !== 'PENDING') {
          const err = new Error(
            `Double-Payment Protection: Commission #${comm.commission_id} is already ${comm.status}. Only PENDING commissions can be paid.`
          );
          err.statusCode = 409;
          throw err;
        }

        serverCalculatedTotal += Number(comm.amount);
      }

      // 3. Generate authoritative batch reference
      const batchRef = `BATCH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // 4. Create payment batch record
      const batch = await ReferralRepository.createPaymentBatch(
        {
          batch_reference: batchRef,
          referrer_id: validated.referrer_id,
          total_amount: serverCalculatedTotal,
          currency: 'LKR',
          commission_count: commissions.length,
          payment_method: validated.payment_method,
          transaction_reference: validated.transaction_reference,
          notes: validated.notes,
          paid_by: currentUser.user_id,
        },
        client
      );

      // 5. Create payment items (enforces DB UNIQUE constraint on commission_id)
      const itemsToInsert = commissions.map(c => ({
        batch_id: batch.batch_id,
        commission_id: c.commission_id,
        amount: Number(c.amount),
        currency: c.currency || 'LKR',
      }));

      const items = await ReferralRepository.createPaymentItems(itemsToInsert, client);

      // 6. Update commissions to PAID
      await ReferralRepository.markCommissionsAsPaid(validated.commission_ids, client);

      // 7. Audit Log
      await ReferralRepository.createAuditLog(
        {
          action: 'BULK_COMMISSION_PAYMENT_PROCESSED',
          entity_type: 'referral_payment_batch',
          entity_id: batch.batch_id,
          actor_id: currentUser.user_id,
          actor_email: currentUser.email,
          actor_role: currentUser.role_id,
          ip_address: requestMeta.ip,
          user_agent: requestMeta.userAgent,
          after_state: { batch, items_count: items.length },
        },
        client
      );

      await client.query('COMMIT');

      return {
        batch,
        items,
        total_paid: serverCalculatedTotal,
        commissions_paid_count: commissions.length,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ==========================================
  // PUBLIC SHARING & QR CODE
  // ==========================================
  async getSharePayload(codeString) {
    const code = await ReferralRepository.findCodeByString(codeString);
    if (!code) {
      const err = new Error(`Referral code '${codeString}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const domain = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'https://crm.edugateglobal.com';
    const referralUrl = `${domain.replace(/\/$/, '')}/register?ref=${encodeURIComponent(code.code)}`;

    // Generate dynamic QR Code Data URL
    const qrDataUrl = await QRCode.toDataURL(referralUrl, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    });

    const shareMessage = `Join EDUGATE GLOBAL to achieve your overseas education dreams! Use my referral code ${code.code} when you register: ${referralUrl}`;

    return {
      code: code.code,
      referrer_name: code.referrer_name,
      referral_url: referralUrl,
      qr_code: qrDataUrl,
      share_messages: {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
        sms: `sms:?body=${encodeURIComponent(shareMessage)}`,
        email: `mailto:?subject=${encodeURIComponent('Recommendation for EDUGATE GLOBAL')}&body=${encodeURIComponent(shareMessage)}`,
        generic_text: shareMessage,
      },
    };
  },

  // ==========================================
  // LISTING & REPORTING
  // ==========================================
  async listReferrers(queryParams) {
    const filters = ReferralValidator.validatePaginationAndFilters(queryParams);
    return await ReferralRepository.listReferrers(filters);
  },

  async getReferrerById(referrerId) {
    const ref = await ReferralRepository.getReferrerById(referrerId);
    if (!ref) {
      const err = new Error(`Referrer with ID ${referrerId} not found.`);
      err.statusCode = 404;
      throw err;
    }
    return ref;
  },

  async listCodes(queryParams) {
    const filters = ReferralValidator.validatePaginationAndFilters(queryParams);
    return await ReferralRepository.listCodes(filters);
  },

  async getStudentsByReferralCode(codeId) {
    const code = await ReferralRepository.getCodeById(codeId);
    if (!code) {
      const err = new Error(`Referral code with ID ${codeId} not found.`);
      err.statusCode = 404;
      throw err;
    }
    const students = await ReferralRepository.getStudentsByReferralCodeId(codeId);
    return {
      code,
      total_students: students.length,
      students,
    };
  },

  async listCommissions(queryParams) {
    const filters = ReferralValidator.validatePaginationAndFilters(queryParams);
    return await ReferralRepository.listCommissions(filters);
  },

  async listPaymentBatches(queryParams) {
    const filters = ReferralValidator.validatePaginationAndFilters(queryParams);
    return await ReferralRepository.listPaymentBatches(filters);
  },

  async getPaymentBatchById(batchId) {
    const batch = await ReferralRepository.getPaymentBatchById(batchId);
    if (!batch) {
      const err = new Error(`Payment batch with ID ${batchId} not found.`);
      err.statusCode = 404;
      throw err;
    }
    return batch;
  },

  async getDashboardStatistics(referrerId = null) {
    return await ReferralRepository.getDashboardStatistics(referrerId);
  },

  async getRolePermissions() {
    return await ReferralRepository.getAllRolePermissions();
  },

  async updateRolePermission(roleId, permissions, currentUser, requestMeta = {}) {
    await this.assertCanModifySettings(currentUser);
    const existing = await ReferralRepository.getPermissionByRoleId(roleId);
    if (!existing) {
      const err = new Error(`Role permission for role '${roleId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const updated = await ReferralRepository.updateRolePermission(roleId, permissions, currentUser.user_id);

    await ReferralRepository.createAuditLog({
      action: 'ROLE_PERMISSION_UPDATED',
      entity_type: 'referral_role_permission',
      entity_id: roleId,
      actor_id: currentUser.user_id,
      actor_email: currentUser.email,
      actor_role: currentUser.role_id,
      ip_address: requestMeta.ip,
      user_agent: requestMeta.userAgent,
      before_state: existing,
      after_state: updated,
    });

    return updated;
  },

  async listAuditLogs(queryParams) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
    const offset = (page - 1) * limit;

    return await ReferralRepository.listAuditLogs({
      page,
      limit,
      offset,
      entity_type: queryParams.entity_type,
      entity_id: queryParams.entity_id,
      action: queryParams.action,
    });
  },
};
