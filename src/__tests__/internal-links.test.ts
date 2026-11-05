// Every internal link in src/ must point at a route that exists in src/app or a file in public/.
// /contact and /legal/risk-disclosure were linked from the credit and purchase pages but never existed.

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = join(__dirname, '..', '..')
const appDir = join(root, 'src', 'app')
const srcDir = join(root, 'src')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// Route patterns from page.tsx / route.ts files, with dynamic segments as wildcards.
const routes = walk(appDir)
  .filter(f => /[/\\](page|route)\.tsx?$/.test(f))
  .map(f => {
    const segs = relative(appDir, f).split(sep).slice(0, -1).filter(s => !/^\(.*\)$/.test(s))
    return new RegExp('^/' + segs.map(s => (/^\[.*\]$/.test(s) ? '[^/]+' : s.replace(/[.*+?^${}()|\\]/g, '\\$&'))).join('/') + '/?$')
  })
// Metadata routes (sitemap.ts, robots.ts) and app-dir icons.
const extraRoutes = ['/sitemap.xml', '/robots.txt', '/favicon.ico', '/apple-icon.png']

function resolves(path: string): boolean {
  if (routes.some(r => r.test(path))) return true
  if (extraRoutes.includes(path)) return true
  return existsSync(join(root, 'public', path))
}

// href="/x", href={'/x'}, href={`/x/${id}`} (static prefix only), and router.push('/x').
const linkPattern = /(?:href=\{?\s*["'`]|router\.(?:push|replace)\(\s*["'`])(\/[^"'`\s?#]*)/g

const links: { file: string; path: string }[] = []
for (const file of walk(srcDir).filter(f => /\.tsx?$/.test(f) && !f.includes('__tests__'))) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(linkPattern)) {
    let path = m[1]
    const dyn = path.indexOf('${')
    if (dyn !== -1) path = path.slice(0, dyn)
    if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1)
    links.push({ file: relative(root, file), path: path || '/' })
  }
}

describe('internal links', () => {
  it('finds links to check', () => {
    expect(links.length).toBeGreaterThan(20)
  })

  it('every internal link resolves to a page, route or public file', () => {
    const broken = links.filter(l => {
      // A template like `/credits/${id}` leaves a prefix such as /credits; accept it when a child route exists.
      if (resolves(l.path)) return false
      return !routes.some(r => r.test(l.path + '/x'))
    })
    expect(broken).toEqual([])
  })
})
