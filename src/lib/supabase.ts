// NOTE: This file exports only the anon (public) Supabase client.
// It is safe to import from both Server and Client Components.
//
// For service-role operations (bypasses RLS), import createServiceClient
// from @/lib/supabase-server — that file is server-only and the service
// role key never reaches the browser bundle.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
