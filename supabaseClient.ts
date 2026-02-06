import { createBrowserClient } from '@supabase/supabase-js';

// Helper to instantiate a Supabase client on the browser.  The anon key and URL
// are read from environment variables prefixed with NEXT_PUBLIC_ so they can
// be safely exposed to the client.  See `.env.local.example` for details.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and anon key must be provided in environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);