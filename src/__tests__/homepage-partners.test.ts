// The homepage names the registries it is built for in text. CarbonBridge has no signed
// agreements with registries or exchanges, so it shows no third-party logo strip and never
// calls them partners. Gary, 7 Nov 2026: no self-undermining disclaimers in product copy.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const home = readFileSync(join(__dirname, '..', 'app', 'page.tsx'), 'utf8')
// Visible JSX text only: drop comments before matching.
const visible = home.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\/.*$/gm, '')

describe('homepage registries', () => {
  it('does not label registries or exchanges as partners', () => {
    const text = [...visible.matchAll(/>([^<>{}]+)</g)].map(m => m[1])
    expect(text.filter(t => /partner/i.test(t))).toEqual([])
  })

  it('shows no third-party logo strip', () => {
    expect(home).not.toMatch(/\/partners\/[a-z]+\.svg/)
  })

  it('names the registries it is built for', () => {
    expect(visible).toContain('Verra VCS · Gold Standard · American Carbon Registry')
  })
})

// Phrases that undercut confidence in the product. Where something is not live yet, the copy
// says what happens next in plain terms instead.
const PUBLIC = [
  'app/page.tsx', 'app/layout.tsx', 'app/marketplace/page.tsx', 'app/marketplace/layout.tsx',
  'app/credits/[id]/CreditDetail.tsx', 'app/compare/page.tsx', 'app/data/page.tsx', 'app/rfq/page.tsx',
  'app/developers/page.tsx', 'app/developers/layout.tsx', 'app/checkout/page.tsx', '../public/llms.txt',
]
const HEDGES = [
  /not available yet/i, /not yet available/i, /permission not held|does not (currently )?hold/i,
  /no partnership/i, /endorsement is implied/i, /shown for reference/i, /\billustrative\b/i,
  /\bdemonstration\b/i, /no verification/i, /in development/i, /\((target|planned|in progress)\)/i,
]
describe('public copy has no self-undermining disclaimers', () => {
  for (const f of PUBLIC) {
    it(f, () => {
      const src = readFileSync(join(__dirname, '..', f), 'utf8')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(HEDGES.filter(h => h.test(src)).map(String)).toEqual([])
    })
  }
})
