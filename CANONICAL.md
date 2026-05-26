# CANONICAL — CarbonBridge

*Generated 2026-05-26. Update when canonical changes.*

## This is the canonical directory for CarbonBridge.

Why this is canonical:
- Only CarbonBridge codebase deployed to a live URL: `https://carbonbridge-web.vercel.app` (confirmed 200 OK, 2026-05-24). The full Next.js 15 + Supabase application lives here, including auth middleware, 497-line schema draft, API route scaffolding for reservations/settlements/retirement/agreements, admin dashboard shell, and seller verification queue UI.
- Active development: most recent commit 2026-05-25 (marketplace MVP — real credit data, order flow, Stripe Connect, admin panels). Dedicated GitHub repo at `lineage007/carbonbridge-web`.
- Owns all application code and strategy docs (business case, investor pitch, implementation playbook, strategic review). The sibling `carbonbridge/` directory contains brand assets only and references this repo as the code source.

## Sibling directories

| Path | What it is | Action |
|---|---|---|
| `/Users/cakirfamily/clawd/projects/carbonbridge` | Brand and strategy library — `BRAND-BIBLE.md`, `BRAND-GUIDELINES.html`, `SUMMARY.md`, investor PDFs, logo concepts, `docs/` folder; no application code | Keep as content library — this is the strategy and brand source; these assets feed into the live site's content; rename to `carbonbridge-brand/` to signal it is not a codebase |

## Branches active in this canonical

- `main` — primary; Vercel deploys from here
- `carbon-bridge-marketplace-mvp-2026-05-25` — real credit data, order flow, Stripe Connect, admin panels (current active branch, not yet merged)
- `canonical-md-2026-05-26` — this documentation sweep

## Deployment surface

- **URL**: https://carbonbridge-web.vercel.app (live, Vercel CI)
- **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + Supabase (auth + Postgres with RLS) + Stripe Connect (scaffolded) + Vercel
- **Current state**: Amber — site is live and polished but marketplace catalog still reads from `src/data/credits.ts` (static file, not DB); transaction lifecycle does not fully execute end-to-end in a live DB context; internal audit 2026-04-30 rated production readiness as "low"
- **Custom domain**: not yet configured; `carbonbridge-web.vercel.app` is the Vercel default subdomain
- **Compliance prerequisite**: ADGM/FSRA licensing and KYC/KYB required before any live transaction or institutional counterparty can be onboarded
- **Bot assignment**: Prometheus (per EMPIRE-ORG-STRUCTURE.md, though conflicting assignments exist)

## Future cleanup

- Rename `carbonbridge/` to `carbonbridge-brand/` — the current name creates confusion since both directories claim to be "carbonbridge." The brand assets are genuinely useful reference material for the site's content and should stay, just clearly named.
- The most impactful single engineering task: replace `src/data/credits.ts` with live Supabase queries so the marketplace catalog becomes real. This is the gate that separates "polished prototype" from "real marketplace."
- Legal placeholder text in terms and agreements must be replaced with real ADGM-compliant copy before any live transaction — operating a regulated financial marketplace with placeholder legal text is a material risk.
