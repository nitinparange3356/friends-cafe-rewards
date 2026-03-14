import { createClient } from '@supabase/supabase-js';

// Use service role key for backend (has full access, bypasses RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);
