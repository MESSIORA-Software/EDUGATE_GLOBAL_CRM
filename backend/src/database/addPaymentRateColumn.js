import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Messiora%40EDU%40123@db.yfgheuhluzejuunsluvb.supabase.co:5432/postgres';

  const sanitizedUrl = connectionString.includes('Messiora@EDU@123')
    ? connectionString.replace('Messiora@EDU@123', 'Messiora%40EDU%40123')
    : connectionString;

  const client = new pg.Client({ connectionString: sanitizedUrl });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Add payment_per_student column if it doesn't exist
    await client.query(`
      ALTER TABLE public.referrers 
      ADD COLUMN IF NOT EXISTS payment_per_student NUMERIC DEFAULT 1000;
    `);

    // Also update existing rows if they are null
    await client.query(`
      UPDATE public.referrers 
      SET payment_per_student = 1000 
      WHERE payment_per_student IS NULL;
    `);

    // Let's create or ensure a system settings table for global default referrer payment
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referrer_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      INSERT INTO public.referrer_settings (key, value)
      VALUES ('payment_settings', '{"rate_per_student": 1000, "currency": "LKR"}'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `);

    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'referrers';
    `);

    console.log('Referrers columns:', cols.rows.map(r => r.column_name));
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
