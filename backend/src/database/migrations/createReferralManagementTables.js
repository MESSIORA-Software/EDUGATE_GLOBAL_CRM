import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

import { getSanitizedDatabaseUrl } from '../dbPool.js';

export async function runMigration() {
  const sanitizedUrl = getSanitizedDatabaseUrl(process.env.DATABASE_URL);
  const client = new pg.Client({ connectionString: sanitizedUrl });

  try {
    await client.connect();
    console.log('[ReferralMigration] Connected to database successfully');
    await client.query('BEGIN');

    // 1. Extend referrers table
    await client.query(`
      ALTER TABLE public.referrers
        ADD COLUMN IF NOT EXISTS referrer_type VARCHAR(50) DEFAULT 'EXTERNAL',
        ADD COLUMN IF NOT EXISTS client_id INT REFERENCES public.clients(client_id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS is_staff_blocked BOOLEAN DEFAULT TRUE;

      CREATE INDEX IF NOT EXISTS idx_referrers_client_id ON public.referrers(client_id);
      CREATE INDEX IF NOT EXISTS idx_referrers_status ON public.referrers(status);
      CREATE INDEX IF NOT EXISTS idx_referrers_type ON public.referrers(referrer_type);
    `);

    // 2. Create referral_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_codes (
        code_id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        referrer_id INT NOT NULL REFERENCES public.referrers(referrer_id) ON DELETE RESTRICT,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED', 'DISABLED')),
        expires_at TIMESTAMPTZ,
        created_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        revoked_at TIMESTAMPTZ,
        revoked_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        revoke_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
      CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer ON public.referral_codes(referrer_id);
      CREATE INDEX IF NOT EXISTS idx_referral_codes_status ON public.referral_codes(status);
    `);

    // 3. Create referral_attributions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_attributions (
        attribution_id SERIAL PRIMARY KEY,
        client_id INT NOT NULL REFERENCES public.clients(client_id) ON DELETE RESTRICT,
        referral_code_id INT NOT NULL REFERENCES public.referral_codes(code_id) ON DELETE RESTRICT,
        referrer_id INT NOT NULL REFERENCES public.referrers(referrer_id) ON DELETE RESTRICT,
        registered_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'TRANSFERRED')),
        attributed_at TIMESTAMPTZ DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_client_attribution 
        ON public.referral_attributions(client_id) 
        WHERE status = 'ACTIVE';

      CREATE INDEX IF NOT EXISTS idx_attributions_code ON public.referral_attributions(referral_code_id);
      CREATE INDEX IF NOT EXISTS idx_attributions_referrer ON public.referral_attributions(referrer_id);
      CREATE INDEX IF NOT EXISTS idx_attributions_attributed_at ON public.referral_attributions(attributed_at);
    `);

    // 4. Create referral_commissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_commissions (
        commission_id SERIAL PRIMARY KEY,
        attribution_id INT NOT NULL UNIQUE REFERENCES public.referral_attributions(attribution_id) ON DELETE RESTRICT,
        referrer_id INT NOT NULL REFERENCES public.referrers(referrer_id) ON DELETE RESTRICT,
        client_id INT NOT NULL REFERENCES public.clients(client_id) ON DELETE RESTRICT,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
        currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
        rate_snapshot NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        approved_at TIMESTAMPTZ,
        approved_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        paid_at TIMESTAMPTZ,
        cancellation_reason TEXT,
        cancelled_at TIMESTAMPTZ,
        cancelled_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON public.referral_commissions(referrer_id);
      CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.referral_commissions(status);
      CREATE INDEX IF NOT EXISTS idx_commissions_client ON public.referral_commissions(client_id);
      CREATE INDEX IF NOT EXISTS idx_commissions_referrer_status ON public.referral_commissions(referrer_id, status);
    `);

    // 5. Create referral_payment_batches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_payment_batches (
        batch_id SERIAL PRIMARY KEY,
        batch_reference VARCHAR(100) UNIQUE NOT NULL,
        referrer_id INT NOT NULL REFERENCES public.referrers(referrer_id) ON DELETE RESTRICT,
        total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
        currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
        commission_count INT NOT NULL DEFAULT 1 CHECK (commission_count > 0),
        payment_method VARCHAR(100) NOT NULL DEFAULT 'Bank Transfer',
        transaction_reference VARCHAR(255),
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'VOIDED')),
        paid_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        paid_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_batches_referrer ON public.referral_payment_batches(referrer_id);
      CREATE INDEX IF NOT EXISTS idx_batches_ref_code ON public.referral_payment_batches(batch_reference);
      CREATE INDEX IF NOT EXISTS idx_batches_status ON public.referral_payment_batches(status);
      CREATE INDEX IF NOT EXISTS idx_batches_paid_at ON public.referral_payment_batches(paid_at);
    `);

    // 6. Create referral_payment_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_payment_items (
        item_id SERIAL PRIMARY KEY,
        batch_id INT NOT NULL REFERENCES public.referral_payment_batches(batch_id) ON DELETE RESTRICT,
        commission_id INT NOT NULL UNIQUE REFERENCES public.referral_commissions(commission_id) ON DELETE RESTRICT,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
        currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_payment_items_batch ON public.referral_payment_items(batch_id);
      CREATE INDEX IF NOT EXISTS idx_payment_items_commission ON public.referral_payment_items(commission_id);
    `);

    // 7. Create referral_role_permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_role_permissions (
        permission_id SERIAL PRIMARY KEY,
        role_id VARCHAR(100) NOT NULL UNIQUE REFERENCES public.user_roles(role_id) ON DELETE CASCADE,
        can_issue_codes BOOLEAN DEFAULT FALSE,
        can_view_all_referrals BOOLEAN DEFAULT FALSE,
        can_manage_payouts BOOLEAN DEFAULT FALSE,
        can_modify_settings BOOLEAN DEFAULT FALSE,
        updated_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Create referral_audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_audit_logs (
        audit_id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        actor_id BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        actor_email VARCHAR(255),
        actor_role VARCHAR(100),
        ip_address VARCHAR(100),
        user_agent TEXT,
        before_state JSONB,
        after_state JSONB,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_ref_audit_entity ON public.referral_audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_ref_audit_action ON public.referral_audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_ref_audit_actor ON public.referral_audit_logs(actor_id);
      CREATE INDEX IF NOT EXISTS idx_ref_audit_created ON public.referral_audit_logs(created_at);
    `);

    // 9. Data Migration: Seed referral_codes from existing referrers
    await client.query(`
      INSERT INTO public.referral_codes (code, referrer_id, status, created_at)
      SELECT 
        r.referrer_code, 
        r.referrer_id, 
        CASE WHEN UPPER(COALESCE(r.status, 'ACTIVE')) = 'ACTIVE' THEN 'ACTIVE' ELSE 'DISABLED' END,
        COALESCE(r.created_at, NOW())
      FROM public.referrers r
      WHERE r.referrer_code IS NOT NULL
      ON CONFLICT (code) DO NOTHING;
    `);

    // 10. Data Migration: Seed referral_attributions and commissions from existing clients
    const clientsWithReferrers = await client.query(`
      SELECT c.client_id, c.referrer_id, c.created_at, rc.code_id, r.payment_per_student
      FROM public.clients c
      JOIN public.referrers r ON c.referrer_id = r.referrer_id
      JOIN public.referral_codes rc ON rc.referrer_id = r.referrer_id
      WHERE c.referrer_id IS NOT NULL;
    `);

    for (const row of clientsWithReferrers.rows) {
      // Insert attribution
      const attrRes = await client.query(`
        INSERT INTO public.referral_attributions (client_id, referral_code_id, referrer_id, status, attributed_at, notes)
        VALUES ($1, $2, $3, 'ACTIVE', $4, 'Migrated from legacy client record')
        ON CONFLICT (client_id) WHERE status = 'ACTIVE' DO UPDATE
          SET referral_code_id = EXCLUDED.referral_code_id
        RETURNING attribution_id;
      `, [row.client_id, row.code_id, row.referrer_id, row.created_at || new Date()]);

      const attributionId = attrRes.rows[0]?.attribution_id;
      if (attributionId) {
        const rate = Number(row.payment_per_student) || 1000;
        await client.query(`
          INSERT INTO public.referral_commissions 
            (attribution_id, referrer_id, client_id, amount, currency, status, rate_snapshot, created_at)
          VALUES 
            ($1, $2, $3, $4, 'LKR', 'PENDING', $4, $5)
          ON CONFLICT (attribution_id) DO NOTHING;
        `, [attributionId, row.referrer_id, row.client_id, rate, row.created_at || new Date()]);
      }
    }

    // 11. Seed default permissions for existing roles
    const existingRoles = await client.query(`SELECT role_id FROM public.user_roles;`);
    for (const role of existingRoles.rows) {
      const roleId = role.role_id;
      const isAdmin = roleId === 'EDUGATE_SUPER_ADMIN' || roleId === 'SUPER_ADMIN';
      const isRegularAdmin = roleId === 'EDUGATE_ADMIN' || roleId === 'ADMIN';

      await client.query(`
        INSERT INTO public.referral_role_permissions 
          (role_id, can_issue_codes, can_view_all_referrals, can_manage_payouts, can_modify_settings)
        VALUES 
          ($1, $2, $3, $4, $5)
        ON CONFLICT (role_id) DO UPDATE
          SET can_issue_codes = EXCLUDED.can_issue_codes,
              can_view_all_referrals = EXCLUDED.can_view_all_referrals,
              can_manage_payouts = EXCLUDED.can_manage_payouts,
              can_modify_settings = EXCLUDED.can_modify_settings;
      `, [
        roleId,
        isAdmin || isRegularAdmin, // can_issue_codes
        isAdmin || isRegularAdmin, // can_view_all_referrals
        isAdmin || isRegularAdmin, // can_manage_payouts
        isAdmin,                   // can_modify_settings
      ]);
    }

    await client.query('COMMIT');
    console.log('[ReferralMigration] Referral management schema and migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ReferralMigration] Migration failed:', err);
    throw err;
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith('createReferralManagementTables.js')) {
  runMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
