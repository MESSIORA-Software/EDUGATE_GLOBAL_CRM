import pg from 'pg';
import dotenv from 'dotenv';
import { getSanitizedDatabaseUrl } from './dbPool.js';
dotenv.config();

async function runMigration() {
  const sanitizedUrl = getSanitizedDatabaseUrl(process.env.DATABASE_URL);
  const client = new pg.Client({ connectionString: sanitizedUrl });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    const query = `
      CREATE TABLE IF NOT EXISTS public.referrers (
        referrer_id SERIAL PRIMARY KEY,
        referrer_code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        home_address TEXT,
        whatsapp_number VARCHAR(50),
        phone_number VARCHAR(50),
        note TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_by INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_referrers_code ON public.referrers(referrer_code);
    `;

    await client.query(query);
    console.log('Table "referrers" ensured in database!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
