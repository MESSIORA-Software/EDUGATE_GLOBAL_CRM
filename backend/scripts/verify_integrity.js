import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function getSanitizedDatabaseUrl(url = process.env.DATABASE_URL) {
  if (!url) return url;
  const match = url.match(/^([^:]+:\/\/)(.*)$/);
  if (!match) return url;
  const protocol = match[1];
  const rest = match[2];
  const lastAt = rest.lastIndexOf('@');
  if (lastAt === -1) return url;
  const creds = rest.substring(0, lastAt);
  const host = rest.substring(lastAt + 1);
  const colon = creds.indexOf(':');
  if (colon === -1) return protocol + encodeURIComponent(decodeURIComponent(creds)) + '@' + host;
  const user = creds.substring(0, colon);
  const pass = creds.substring(colon + 1);
  return protocol + encodeURIComponent(decodeURIComponent(user)) + ':' + encodeURIComponent(decodeURIComponent(pass)) + '@' + host;
}

const pool = new pg.Pool({
  connectionString: getSanitizedDatabaseUrl(process.env.DATABASE_URL),
  max: 2,
  connectionTimeoutMillis: 10000,
});

async function verifyIntegrity() {
  const client = await pool.connect();
  try {
    console.log('--- POST-CLEANUP DATABASE INTEGRITY VERIFICATION ---');

    // Check row counts of cleaned business tables
    const checkEmpty = [
      'referrers',
      'clients',
      'referral_codes',
      'referral_attributions',
      'referral_commissions',
      'referral_payment_batches',
      'referral_payment_items',
      'referrer_payouts',
      'opportunities',
      'OPPORTUNITY_NOTE',
      'conversations',
      'messages',
      'calendar_events',
      'student_documents',
      'student_journey_records'
    ];

    let allEmpty = true;
    for (const t of checkEmpty) {
      const res = await client.query(`SELECT count(*) FROM "${t}"`);
      const count = Number(res.rows[0].count);
      console.log(`[Table: ${t.padEnd(26)}] Count: ${count} ${count === 0 ? '✓ CLEAN' : '❌ NOT EMPTY'}`);
      if (count !== 0) allEmpty = false;
    }

    // Verify system accounts
    const usersRes = await client.query(`SELECT user_id, email, name, role_id, status FROM users ORDER BY user_id`);
    console.log('\n--- SYSTEM USERS VERIFICATION ---');
    console.table(usersRes.rows);

    // Verify pipeline statuses
    const stagesRes = await client.query(`SELECT status_id, status_name, stage_order, is_active FROM opportunity_statuses ORDER BY stage_order`);
    console.log('\n--- PIPELINE STAGES VERIFICATION ---');
    console.table(stagesRes.rows);

    // Verify referral settings & trigger stage relationship
    const refSettingsRes = await client.query(`
      SELECT 
        rs.id,
        rs.commission_trigger_stage_id,
        os.status_name AS trigger_stage_name,
        os.is_active AS stage_is_active
      FROM referral_settings rs
      LEFT JOIN opportunity_statuses os ON rs.commission_trigger_stage_id = os.status_id
    `);
    console.log('\n--- REFERRAL SETTINGS VERIFICATION ---');
    console.table(refSettingsRes.rows);

    // Verify referral role permissions
    const permsRes = await client.query(`SELECT * FROM referral_role_permissions ORDER BY permission_id`);
    console.log('\n--- REFERRAL ROLE PERMISSIONS VERIFICATION ---');
    console.table(permsRes.rows);

    if (allEmpty && usersRes.rows.length >= 3 && stagesRes.rows.length >= 3 && refSettingsRes.rows.length === 1) {
      console.log('\n✓ ALL DATABASE INTEGRITY CHECKS PASSED PERFECTLY!');
    } else {
      console.error('\n❌ INTEGRITY CHECK ANOMALY DETECTED.');
      process.exitCode = 1;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

verifyIntegrity();
