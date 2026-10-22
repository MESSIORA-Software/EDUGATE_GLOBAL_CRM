import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export async function ensureUserRolesStatusColumn() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Messiora%40EDU%40123@db.yfgheuhluzejuunsluvb.supabase.co:5432/postgres';

  const sanitizedUrl = connectionString.includes('Messiora@EDU@123')
    ? connectionString.replace('Messiora@EDU@123', 'Messiora%40EDU%40123')
    : connectionString;

  const client = new pg.Client({ connectionString: sanitizedUrl });
  try {
    await client.connect();
    await client.query(`
      ALTER TABLE public.user_roles 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
      UPDATE public.user_roles SET status = 'Active' WHERE status IS NULL;
    `);
    console.log('[Database] user_roles.status column ensured successfully.');
  } catch (err) {
    console.warn('[Database] Could not alter user_roles table:', err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}
