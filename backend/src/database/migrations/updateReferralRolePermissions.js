import { pool } from '../dbPool.js';

export async function updateReferralRolePermissions() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Updating referral_role_permissions for Staff and Admin...');
    await client.query('BEGIN');

    // 1. Staff: can_issue_codes = true, can_view_all_referrals = true, can_manage_payouts = false, can_modify_settings = false
    await client.query(`
      UPDATE public.referral_role_permissions
      SET can_issue_codes = TRUE,
          can_view_all_referrals = TRUE,
          can_manage_payouts = FALSE,
          can_modify_settings = FALSE,
          updated_at = NOW()
      WHERE role_id = 'EDUGATE_STAFF' OR role_id ILIKE '%staff%';
    `);

    // 2. Admin: can_issue_codes = true, can_view_all_referrals = true, can_manage_payouts = true, can_modify_settings = true
    await client.query(`
      UPDATE public.referral_role_permissions
      SET can_issue_codes = TRUE,
          can_view_all_referrals = TRUE,
          can_manage_payouts = TRUE,
          can_modify_settings = TRUE,
          updated_at = NOW()
      WHERE role_id = 'EDUGATE_ADMIN' OR role_id = 'ADMIN';
    `);

    // 3. Super Admin: full access
    await client.query(`
      UPDATE public.referral_role_permissions
      SET can_issue_codes = TRUE,
          can_view_all_referrals = TRUE,
          can_manage_payouts = TRUE,
          can_modify_settings = TRUE,
          updated_at = NOW()
      WHERE role_id = 'EDUGATE_SUPER_ADMIN' OR role_id = 'SUPER_ADMIN';
    `);

    await client.query('COMMIT');
    console.log('[Migration] referral_role_permissions updated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Failed to update referral_role_permissions:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith('updateReferralRolePermissions.js')) {
  updateReferralRolePermissions()
    .then(() => {
      console.log('Finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed:', err);
      process.exit(1);
    });
}
