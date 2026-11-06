// Demonstration screens and token links must stay out of search results, and must not
// inherit the homepage title.

import { describe, it, expect } from 'vitest'
import { metadata as purchase } from '@/app/purchase/layout'
import { metadata as retire } from '@/app/retire/layout'
import { metadata as dispute } from '@/app/dispute/layout'
import { metadata as sellerDemo } from '@/app/seller-demo/layout'
import { metadata as sign } from '@/app/sign/[token]/layout'
import { metadata as rfq } from '@/app/rfq/layout'

describe('demo and token pages', () => {
  it.each([
    ['purchase', purchase], ['retire', retire], ['dispute', dispute], ['seller-demo', sellerDemo], ['sign', sign],
  ])('%s is noindex with its own title', (_, m) => {
    expect(m.robots).toEqual({ index: false, follow: false })
    expect(typeof m.title).toBe('string')
  })

  it('rfq has its own title', () => {
    expect(rfq.title).toBe('Request a quote')
  })
})
