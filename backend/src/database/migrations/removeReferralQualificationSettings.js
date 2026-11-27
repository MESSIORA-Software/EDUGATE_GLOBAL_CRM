import { pool } from '../dbPool.js';

export async function removeReferralQualificationSettings() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Beginning safe removal of referral_qualification_settings...');
    await client.query('BEGIN');

    // 1. Drop table public.referral_qualification_settings if it exists
    await client.query(`DROP TABLE IF EXISTS public.referral_qualification_settings CASCADE;`);
    console.log('[Migration] Successfully dropped public.referral_qualification_settings.');

    // 2. Remove qualification_stage key from referrer_settings if present
    await client.query(`DELETE FROM public.referrer_settings WHERE key = 'qualification_stage';`);
    console.log('[Migration] Cleaned up qualification_stage key from referrer_settings.');

    // 3. Clean up opportunity status 3 name if corrupted
    await client.query(`UPDATE public.opportunity_statuses SET status_name = 'In Progress' WHERE status_id = 3 AND status_name ILIKE '%is_active%';`);

    await client.query('COMMIT');
    console.log('[Migration] Removal of referral qualification configuration completed safely.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Error removing referral qualification configuration:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (process.argv[1]?.endsWith('removeReferralQualificationSettings.js')) {
  removeReferralQualificationSettings()
    .then(() => {
      console.log('Migration finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
