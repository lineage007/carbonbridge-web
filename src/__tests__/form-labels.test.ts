// Every <label> on the sign-up and request-for-quote forms must be tied to its control,
// and every htmlFor must point at an id that exists on the same page.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const pages = ['src/app/register/page.tsx', 'src/app/rfq/page.tsx', 'src/app/login/page.tsx', 'src/app/reset-password/page.tsx']

describe.each(pages)('%s', (page) => {
  const src = readFileSync(join(__dirname, '..', '..', page), 'utf8')

  it('has no label without htmlFor', () => {
    expect(src.match(/<label(?![^>]*htmlFor)[^>]*>/g) ?? []).toEqual([])
  })

  it('every htmlFor matches an id', () => {
    const ids = new Set([...src.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))
    const fors = [...src.matchAll(/htmlFor="([^"]+)"/g)].map(m => m[1])
    expect(fors.length).toBeGreaterThan(0)
    expect(fors.filter(f => !ids.has(f))).toEqual([])
  })
})
