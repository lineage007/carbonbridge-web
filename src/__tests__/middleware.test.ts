// Regression test for the admin role gate (spec item E10, CarbonBridge captain memo 2026-10-04).
// /dashboard/admin/* is a twin of /admin/*; both must be gated by role, not only by login.
//
// No network, no Supabase project, no env file: @supabase/ssr is mocked, so this cannot
// touch any database.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

let currentUser: { id: string } | null = null
let currentRole: string | null = null

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: currentUser } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: currentRole ? { role: currentRole } : null }),
        }),
      }),
    }),
  }),
}))

import { middleware } from '../middleware'

const run = (path: string) => middleware(new NextRequest('https://carbonbridge.test' + path))
const redirectPath = (res: Response) => {
  const loc = res.headers.get('location')
  return loc ? new URL(loc).pathname : null
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  currentUser = null
  currentRole = null
})

const ADMIN_PATHS = [
  '/admin',
  '/admin/users',
  '/dashboard/admin',
  '/dashboard/admin/users',
  '/dashboard/admin/orders',
  '/dashboard/admin/financials',
]

describe('admin role gate', () => {
  it.each(ADMIN_PATHS)('a signed-in buyer is sent to /dashboard from %s', async (path) => {
    currentUser = { id: 'u1' }
    currentRole = 'buyer'
    expect(redirectPath(await run(path))).toBe('/dashboard')
  })

  it.each(ADMIN_PATHS)('a signed-in user with no profile row is sent to /dashboard from %s', async (path) => {
    currentUser = { id: 'u1' }
    currentRole = null
    expect(redirectPath(await run(path))).toBe('/dashboard')
  })

  it.each(['admin', 'super_admin'])('role %s reaches /dashboard/admin/users', async (role) => {
    currentUser = { id: 'u1' }
    currentRole = role
    expect(redirectPath(await run('/dashboard/admin/users'))).toBeNull()
  })

  it.each(ADMIN_PATHS)('a signed-out visitor is sent to /login from %s', async (path) => {
    expect(redirectPath(await run(path))).toBe('/login')
  })

  // Positive control: the gate must not lock buyers out of their own dashboard.
  it('a signed-in buyer still reaches /dashboard/portfolio', async () => {
    currentUser = { id: 'u1' }
    currentRole = 'buyer'
    expect(redirectPath(await run('/dashboard/portfolio'))).toBeNull()
  })
})
