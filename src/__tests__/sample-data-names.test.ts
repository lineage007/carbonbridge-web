// Sample screens must not name real companies as buyers or sellers, and the homepage
// listing preview must show the same names and numbers as the illustrative listings.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { LISTINGS } from '@/data/credits'

const appDir = join(__dirname, '..', 'app')
const componentsDir = join(__dirname, '..', 'components')
const walk = (d: string): string[] =>
  readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p] })

const REAL_NAMES = ['Etihad', 'ADNOC', 'DP World', 'DEWA', 'Emirates Industrial', 'emiratesindustrial', 'Pacific Carbon Developments', 'Abu Dhabi Mangroves Trust', 'Queensland Carbon Projects', 'Swiss DAC', 'Kalimantan Peatland', 'Borneo Peatland', 'Central Tower']

describe('sample data names', () => {
  it('no page names a real company as a buyer or seller', () => {
    const found = [...walk(appDir), ...walk(componentsDir)]
      .filter(f => /\.tsx?$/.test(f))
      .flatMap(f => REAL_NAMES.filter(n => readFileSync(f, 'utf8').includes(n)).map(n => `${f}: ${n}`))
    expect(found).toEqual([])
  })

  it('homepage preview cards match the listings they link to', () => {
    const home = readFileSync(join(appDir, 'page.tsx'), 'utf8')
    const rows = [...home.matchAll(/\{ type: '[^']+', project: '([^']+)', location: '([^']+)', registry: '([^']+)', vintage: '(\d+)', rating: '([^']+)', price: '\$([\d.]+)', volume: '([\d,]+)'.*?id: '([^']+)' \}/g)]
    expect(rows.length).toBe(3)
    for (const [, project, location, registry, vintage, rating, price, volume, id] of rows) {
      const l = LISTINGS.find(x => x.id === id)!
      expect(l, id).toBeTruthy()
      expect({ project, location, registry, vintage: +vintage, rating, price: +price, volume: +volume.replace(/,/g, '') }, id).toEqual({
        project: l.projectName, location: l.location, registry: l.registry, vintage: l.vintage, rating: l.qualityRating, price: l.price, volume: l.volumeAvailable,
      })
    }
  })
})
