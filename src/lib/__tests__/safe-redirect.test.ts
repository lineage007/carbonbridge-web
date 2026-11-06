import { describe, it, expect } from 'vitest'
import { safeRedirectPath } from '../safe-redirect'

describe('safeRedirectPath', () => {
  it('keeps same-site paths, including query and hash', () => {
    expect(safeRedirectPath('/checkout')).toBe('/checkout')
    expect(safeRedirectPath('/dashboard/orders?tab=open#x')).toBe('/dashboard/orders?tab=open#x')
  })

  it('falls back when missing', () => {
    expect(safeRedirectPath(null)).toBe('/dashboard')
    expect(safeRedirectPath('')).toBe('/dashboard')
    expect(safeRedirectPath(undefined, '/')).toBe('/')
  })

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '\\\\evil.example',
    '/\\/evil.example',
    '@evil.example',
    '.evil.example',
    'javascript:alert(1)',
    '/\tevil',
    '/%0a',
    '/..//evil.example',
    '/.//evil.example',
    '/%2e%2e//evil.example',
    '/a/../..//evil.example',
    '/.%2e//evil.example',
  ])('rejects %s', (v) => {
    const out = safeRedirectPath(v)
    expect(out.startsWith('/')).toBe(true)
    expect(out.startsWith('//')).toBe(false)
    expect(out.startsWith('/\\')).toBe(false)
    expect(new URL(out, 'https://carbonbridge.ae').origin).toBe('https://carbonbridge.ae')
  })

  it('rejects the cross-site forms outright', () => {
    for (const v of ['https://evil.example', '//evil.example', '/\\evil.example', '@evil.example', '.evil.example', '/..//evil.example', '/%2e%2e//evil.example']) {
      expect(safeRedirectPath(v)).toBe('/dashboard')
    }
  })
})
