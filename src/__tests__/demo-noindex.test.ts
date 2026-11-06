// Demonstration screens and token links must stay out of search results, and must not
// inherit the homepage title. Layouts are read as text (they contain JSX).

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const layout = (route: string) => readFileSync(join(__dirname, '..', 'app', route, 'layout.tsx'), 'utf8')

describe('demo and token pages', () => {
  it.each([
    ['purchase', 'Purchase walkthrough (demonstration)'],
    ['retire', 'Retirement walkthrough (demonstration)'],
    ['dispute', 'Dispute centre (demonstration)'],
    ['seller-demo', 'Seller dashboard (demonstration)'],
    ['sign/[token]', 'Agreement signature (not yet live)'],
  ])('%s is noindex with its own title', (route, title) => {
    const src = layout(route)
    expect(src).toContain(`title: '${title}',`)
    expect(src).toContain('robots: { index: false, follow: false },')
  })

  it('rfq has its own title and stays indexable', () => {
    const src = layout('rfq')
    expect(src).toContain("title: 'Request a quote',")
    expect(src).not.toContain('robots')
  })
})
