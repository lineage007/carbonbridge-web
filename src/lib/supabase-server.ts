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
 * Service-role client — bypasses RLS. Use only in server-side API routes
 * for admin operations. NEVER import from a Client Component.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
