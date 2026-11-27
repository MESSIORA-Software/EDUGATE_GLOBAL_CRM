import { pool } from '../dbPool.js';

export async function createReferralSettingsTable() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Creating referral_settings table...');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referral_settings (
        id SERIAL PRIMARY KEY,
        commission_trigger_stage_id INT NULL REFERENCES public.opportunity_statuses(status_id) ON DELETE RESTRICT,
        updated_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure singleton record exists (id = 1)
    // Defaulting to status_id = 4 ('Closed / Won') if present
    const checkStage = await client.query(
      `SELECT status_id FROM public.opportunity_statuses WHERE status_id = 4 LIMIT 1;`
    );
    const defaultStageId = checkStage.rows.length > 0 ? 4 : null;

    await client.query(
      `INSERT INTO public.referral_settings (id, commission_trigger_stage_id, created_at, updated_at)
       VALUES (1, $1, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING;`,
      [defaultStageId]
    );

    await client.query('COMMIT');
    console.log('[Migration] referral_settings table created and seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Failed to create referral_settings table:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith('createReferralSettingsTable.js')) {
  createReferralSettingsTable()
    .then(() => {
      console.log('Migration finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
