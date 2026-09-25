import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Copy frontend/.env.example to frontend/.env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  );
}

/**
 * Shared Supabase client. The anon key is designed to be public: it ships in the
 * browser bundle, and data access is enforced by Postgres Row Level Security.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
