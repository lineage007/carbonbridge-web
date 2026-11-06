// /api/retire must not build a PostgREST filter from a malformed x-api-key header, and
// /api/settlements must restrict non-admins with an inner join. Supabase is mocked:
// no network, no database.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const calls: { method: string; args: unknown[] }[] = []

function chain(result: unknown): Record<string, unknown> {
  const c: Record<string, unknown> = {}
  for (const m of ['select', 'or', 'eq', 'order', 'single', 'insert', 'update']) {
    c[m] = (...args: unknown[]) => {
      calls.push({ method: m, args })
      return m === 'single' || m === 'order' ? Promise.resolve(result) : c
    }
  }
  return c
}

vi.mock('@/lib/supabase-server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from: () => chain({ data: null, error: null }),
  }),
}))

import { GET as retireGET, POST as retirePOST } from '@/app/api/retire/route'
import { GET as settlementsGET } from '@/app/api/settlements/route'

const req = (url: string, headers: Record<string, string> = {}, body?: unknown) =>
  new NextRequest(url, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined })

beforeEach(() => { calls.length = 0 })

describe('/api/retire x-api-key', () => {
  it.each([
    'x,id.eq.00000000-0000-0000-0000-000000000000',
    'abc),role.eq.super_admin',
    'short',
  ])('rejects %s before querying', async (key) => {
    for (const handler of [
      () => retireGET(req('https://carbonbridge.ae/api/retire', { 'x-api-key': key })),
      () => retirePOST(req('https://carbonbridge.ae/api/retire', { 'x-api-key': key }, { order_id: 'o', credit_id: 'c' })),
    ]) {
      const res = await handler()
      expect(res.status).toBe(401)
    }
    expect(calls.find(c => c.method === 'or')).toBeUndefined()
  })

  it('looks up a well-formed key', async () => {
    const res = await retireGET(req('https://carbonbridge.ae/api/retire', { 'x-api-key': 'cb_test_abcdef123456' }))
    expect(res.status).toBe(401) // mocked lookup finds no profile
    expect(calls.find(c => c.method === 'or')?.args[0]).toBe('api_key_live.eq.cb_test_abcdef123456,api_key_sandbox.eq.cb_test_abcdef123456')
  })
})

describe('/api/settlements GET', () => {
  it('uses an inner join so the buyer filter removes other buyers\' rows', async () => {
    await settlementsGET(req('https://carbonbridge.ae/api/settlements'))
    const selects = calls.filter(c => c.method === 'select').map(c => String(c.args[0]))
    expect(selects.some(s => s.includes('orders!inner('))).toBe(true)
    expect(calls.some(c => c.method === 'eq' && c.args[0] === 'orders.buyer_id' && c.args[1] === 'user-1')).toBe(true)
  })
})
