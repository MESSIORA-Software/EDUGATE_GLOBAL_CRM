import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Ensure backend .env is loaded regardless of current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Safely parses and URL-encodes credentials from DATABASE_URL dynamically.
 */
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

// ----------------------------------------------------
// SAFETY GUARD: Prevent accidental run on production
// ----------------------------------------------------
const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
if (nodeEnv === 'production') {
  console.error('\n[SAFETY GUARD] Execution aborted!');
  console.error('This cleanup script is strictly forbidden in production environments (NODE_ENV=production).\n');
  process.exit(1);
}

const connectionString = getSanitizedDatabaseUrl(process.env.DATABASE_URL);
if (!connectionString) {
  console.error('\n[DATABASE CONFIG] DATABASE_URL is not set in backend/.env. Aborting.\n');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  max: 2,
  connectionTimeoutMillis: 10000,
});

async function runCleanup() {
  const client = await pool.connect();
  const deletedCounts = {};

  try {
    console.log('========================================');
    console.log('EDUGATE CRM TEST DATA CLEANUP');
    console.log('========================================');
    console.log(`Environment: ${nodeEnv}`);
    console.log('Starting transactional cleanup of test business data...\n');

    await client.query('BEGIN');

    // 1. Break circular dependency between clients and referrers
    await client.query('UPDATE clients SET referrer_id = NULL WHERE referrer_id IS NOT NULL');
    await client.query('UPDATE referrers SET client_id = NULL WHERE client_id IS NOT NULL');

    // 2. Child tables of referral payments & commissions
    const delPaymentItems = await client.query('DELETE FROM referral_payment_items');
    deletedCounts['referral_payment_items'] = delPaymentItems.rowCount || 0;

    const delPaymentBatches = await client.query('DELETE FROM referral_payment_batches');
    deletedCounts['referral_payment_batches'] = delPaymentBatches.rowCount || 0;

    const delPayouts = await client.query('DELETE FROM referrer_payouts');
    deletedCounts['referrer_payouts'] = delPayouts.rowCount || 0;

    const delCommissions = await client.query('DELETE FROM referral_commissions');
    deletedCounts['referral_commissions'] = delCommissions.rowCount || 0;

    // 3. Referral attributions, codes, and audit logs
    const delAttributions = await client.query('DELETE FROM referral_attributions');
    deletedCounts['referral_attributions'] = delAttributions.rowCount || 0;

    const delCodes = await client.query('DELETE FROM referral_codes');
    deletedCounts['referral_codes'] = delCodes.rowCount || 0;

    const delAuditLogs = await client.query('DELETE FROM referral_audit_logs');
    deletedCounts['referral_audit_logs'] = delAuditLogs.rowCount || 0;

    // 4. Student Journey records & audit logs
    const delJourneyVals = await client.query('DELETE FROM student_journey_values');
    deletedCounts['student_journey_values'] = delJourneyVals.rowCount || 0;

    const delJourneyLogs = await client.query('DELETE FROM student_journey_audit_logs');
    deletedCounts['student_journey_audit_logs'] = delJourneyLogs.rowCount || 0;

    const delJourneyRecs = await client.query('DELETE FROM student_journey_records');
    deletedCounts['student_journey_records'] = delJourneyRecs.rowCount || 0;

    // 5. Student documents
    const delDocs = await client.query('DELETE FROM student_documents');
    deletedCounts['student_documents'] = delDocs.rowCount || 0;

    // 6. Pipeline opportunities & notes
    const delNotes = await client.query('DELETE FROM "OPPORTUNITY_NOTE"');
    deletedCounts['OPPORTUNITY_NOTE'] = delNotes.rowCount || 0;

    const delOpps = await client.query('DELETE FROM opportunities');
    deletedCounts['opportunities'] = delOpps.rowCount || 0;

    // 7. Student conversations & messages
    const delMessages = await client.query('DELETE FROM messages');
    deletedCounts['messages'] = delMessages.rowCount || 0;

    const delConversations = await client.query('DELETE FROM conversations');
    deletedCounts['conversations'] = delConversations.rowCount || 0;

    // 8. Calendar events for clients
    const delEvents = await client.query('DELETE FROM calendar_events');
    deletedCounts['calendar_events'] = delEvents.rowCount || 0;

    // 9. Referrers
    const delReferrers = await client.query('DELETE FROM referrers');
    deletedCounts['referrers'] = delReferrers.rowCount || 0;

    // 10. Clients (Students)
    const delClients = await client.query('DELETE FROM clients');
    deletedCounts['clients'] = delClients.rowCount || 0;

    // Commit transaction
    await client.query('COMMIT');
    console.log('✓ Transaction committed successfully.\n');

    // Verification of preserved system data
    const usersCount = (await client.query('SELECT count(*) FROM users')).rows[0].count;
    const rolesCount = (await client.query('SELECT count(*) FROM user_roles')).rows[0].count;
    const branchesCount = (await client.query('SELECT count(*) FROM branches')).rows[0].count;
    const stagesCount = (await client.query('SELECT count(*) FROM opportunity_statuses WHERE is_active = true')).rows[0].count;
    const refSettingsRes = (await client.query('SELECT id, commission_trigger_stage_id FROM referral_settings')).rows;
    const refPermsCount = (await client.query('SELECT count(*) FROM referral_role_permissions')).rows[0].count;

    console.log('--- DELETED TEST RECORDS SUMMARY ---');
    console.log(`Referrers deleted:             ${deletedCounts['referrers']}`);
    console.log(`Referral codes deleted:        ${deletedCounts['referral_codes']}`);
    console.log(`Referral attributions deleted: ${deletedCounts['referral_attributions']}`);
    console.log(`Referral commissions deleted:  ${deletedCounts['referral_commissions']}`);
    console.log(`Referral payment batches:      ${deletedCounts['referral_payment_batches']}`);
    console.log(`Referral payment items:        ${deletedCounts['referral_payment_items']}`);
    console.log(`Referrer payouts deleted:      ${deletedCounts['referrer_payouts']}`);
    console.log(`Referral audit logs deleted:   ${deletedCounts['referral_audit_logs']}`);
    console.log(`Students (clients) deleted:    ${deletedCounts['clients']}`);
    console.log(`Pipeline opportunities deleted:${deletedCounts['opportunities']}`);
    console.log(`Opportunity notes deleted:     ${deletedCounts['OPPORTUNITY_NOTE']}`);
    console.log(`Student documents deleted:     ${deletedCounts['student_documents']}`);
    console.log(`Student journey records:       ${deletedCounts['student_journey_records']}`);
    console.log(`Conversations & messages:      ${deletedCounts['conversations']} / ${deletedCounts['messages']}`);
    console.log(`Calendar events deleted:       ${deletedCounts['calendar_events']}\n`);

    console.log('--- PRESERVED SYSTEM & CONFIGURATION DATA ---');
    console.log(`System users preserved:        ${usersCount}`);
    console.log(`User roles preserved:          ${rolesCount}`);
    console.log(`Branches preserved:            ${branchesCount}`);
    console.log(`Active pipeline stages:        ${stagesCount}`);
    console.log(`Referral settings preserved:   ${refSettingsRes.length} (Trigger Stage ID: ${refSettingsRes[0]?.commission_trigger_stage_id})`);
    console.log(`Referral role permissions:     ${refPermsCount}\n`);

    console.log('========================================');
    console.log('CLEANUP COMPLETED SUCCESSFULLY');
    console.log('========================================');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n[CLEANUP ERROR] Transaction rolled back due to error:');
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup();
