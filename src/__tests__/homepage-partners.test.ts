// The homepage shows registry and exchange logos. CarbonBridge has no signed agreements
// with them (About lists Verra and ACX as targets), so the page must not call them partners.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const home = readFileSync(join(__dirname, '..', 'app', 'page.tsx'), 'utf8')
// Visible JSX text only: drop comments before matching.
const visible = home.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\/.*$/gm, '')

describe('homepage logo strips', () => {
  it('does not label registries or exchanges as partners', () => {
    // Text nodes between tags, ignoring the /partners/ asset paths and the disclaimer itself.
    const text = [...visible.matchAll(/>([^<>{}]+)</g)].map(m => m[1]).filter(t => !t.includes('No partnership'))
    expect(text.filter(t => /partner/i.test(t))).toEqual([])
  })

  it('says no partnership is implied under each logo strip', () => {
    const strips = (home.match(/\/partners\/goldstandard\.svg/g) ?? []).length
    const notes = (visible.match(/No partnership or endorsement is implied\./g) ?? []).length
    expect(strips).toBeGreaterThan(0)
    expect(notes).toBe(strips)
  })
})
