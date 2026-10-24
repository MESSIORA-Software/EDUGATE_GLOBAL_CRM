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

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.referrer_payouts (
        payout_id SERIAL PRIMARY KEY,
        referrer_id INT NOT NULL REFERENCES public.referrers(referrer_id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        payment_method VARCHAR(100) DEFAULT 'Bank Transfer',
        reference_note TEXT,
        paid_by INT,
        paid_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_referrer_payouts_ref ON public.referrer_payouts(referrer_id);
    `);

    console.log('Table public.referrer_payouts created/ensured successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
