// /auth/callback must only redirect to same-site paths after a sign-in link.
// @supabase/ssr and next/headers are mocked: no network, no database.

import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { exchangeCodeForSession: async () => ({ error: null }) } }),
}))

import { GET } from '../app/auth/callback/route'

const location = async (qs: string) =>
  (await GET(new NextRequest('https://carbonbridge.ae/auth/callback' + qs))).headers.get('location')

describe('/auth/callback redirect', () => {
  it('sends the user to the requested same-site path', async () => {
    expect(await location('?code=abc&redirect=/checkout')).toBe('https://carbonbridge.ae/checkout')
  })

  it('defaults to the dashboard', async () => {
    expect(await location('?code=abc')).toBe('https://carbonbridge.ae/dashboard')
  })

  it.each(['@evil.example', '.evil.example', '//evil.example', 'https://evil.example'])(
    'does not leave the site for redirect=%s',
    async (r) => {
      const loc = await location('?code=abc&redirect=' + encodeURIComponent(r))
      expect(new URL(loc!).origin).toBe('https://carbonbridge.ae')
      expect(loc).toBe('https://carbonbridge.ae/dashboard')
    },
  )
})

describe('/auth/callback password recovery', () => {
  it('sends recovery links to the page that sets a new password', async () => {
    expect(await location('?code=abc&type=recovery')).toBe('https://carbonbridge.ae/reset-password')
  })

  it('ignores a redirect parameter on recovery links', async () => {
    expect(await location('?code=abc&type=recovery&redirect=/checkout')).toBe('https://carbonbridge.ae/reset-password')
  })
})
