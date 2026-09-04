import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Missing Supabase environment variables in .env');
}

// Use serviceRoleKey for backend admin operations if available, otherwise anonKey
const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

export const supabase = createClient(config.supabase.url, supabaseKey);
