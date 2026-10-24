import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Safely parses and URL-encodes credentials from DATABASE_URL dynamically without hardcoding.
 */
export function getSanitizedDatabaseUrl(url = process.env.DATABASE_URL) {
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

export const pool = new pg.Pool({
  connectionString: getSanitizedDatabaseUrl(process.env.DATABASE_URL),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[dbPool] Unexpected PostgreSQL client error:', err.message);
});
