// /credits/[id] is built for every illustrative listing; any other id must be a 404,
// and each page must carry its own title instead of the homepage default.

import { describe, it, expect } from 'vitest'
import { LISTINGS } from '@/data/credits'
import * as page from '@/app/credits/[id]/page'
import sitemap from '@/app/sitemap'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

describe('/credits/[id]', () => {
  it('pre-builds every listing and 404s anything else', () => {
    expect(page.dynamicParams).toBe(false)
    expect(page.generateStaticParams().map(p => p.id).sort()).toEqual(LISTINGS.map(l => l.id).sort())
  })

  it('gives each listing its own title and an example-listing description', async () => {
    const l = LISTINGS[0]
    const meta = await page.generateMetadata({ params: Promise.resolve({ id: l.id }) })
    expect(meta.title).toBe(l.projectName)
    expect(String(meta.description)).toMatch(/^Example listing, not a live offer\./)
    expect(String(meta.description).length).toBeLessThanOrEqual(160)
    expect(meta.openGraph?.images).toBeTruthy()
  })
})

describe('sitemap', () => {
  it('lists only pages that exist', () => {
    for (const { url } of sitemap()) {
      const path = new URL(url).pathname.replace(/^\//, '')
      const dir = join(__dirname, '..', 'app', path)
      expect(existsSync(join(dir, 'page.tsx')), url).toBe(true)
    }
  })
})
