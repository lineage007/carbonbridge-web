// server-only — never import this file from a Client Component
import 'server-only';

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile ? { ...user, profile } : null
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }
  return user!
}

export async function requireAdmin() {
  const user = await requireUser()
  if (!user?.profile || !['admin', 'super_admin'].includes(user.profile.role)) {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard')
  }
  return user
}

export async function requireSuperAdmin() {
  const user = await requireUser()
  if (!user?.profile || user.profile.role !== 'super_admin') {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard')
  }
  return user
}

/**
 * Service-role client — bypasses RLS. Use only in server-side API routes,
 * and only AFTER the route has performed its own authorisation check.
 * NEVER import from a Client Component.
 *
 * Review finding 1: the settlements and retirement_certificates tables created
 * by 005_phase1_contract_alignment.sql carry admin-only write policies, and
 * /api/retire accepts API-key callers that have no session (auth.uid() is
 * null). Those routes therefore write through this client rather than the
 * session client, having already established who the caller is.
 *
 * Throws rather than falling back to a placeholder key — a silent placeholder
 * turns a misconfiguration into an opaque 401 from PostgREST.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('createServiceClient: NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!serviceRoleKey) {
    throw new Error(
      'createServiceClient: SUPABASE_SERVICE_ROLE_KEY is not set — required for server-side writes to RLS-protected tables (settlements, retirement_certificates)',
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
