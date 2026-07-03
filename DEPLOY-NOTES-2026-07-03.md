# CarbonBridge — Deploy Notes 2026-07-03

Portfolio audit fix wave. Items below require Gary action before they are live.

---

## NEEDS GARY: Database migrations to apply

All migrations are in `supabase/migrations/`. Apply to project `ixoxhzlwaspjfvbgfgff`.
**Never apply to Ledgable production (`dcemanhmabsjmkitskil`).**

### 002_fix_order_status_pending_payment.sql — URGENT

Adds `pending_payment` to the `orders.status` CHECK constraint. Without this,
every reservation attempt fails with a database CHECK constraint error.

Apply via Supabase SQL editor:
```sql
-- paste contents of 002_fix_order_status_pending_payment.sql
```

Verify: `INSERT INTO orders (..., status) VALUES (..., 'pending_payment')` succeeds.

### 003_rls_uncovered_tables.sql — URGENT (before any new user onboarding)

Enables RLS and access policies on 7 tables that were fully open to any
authenticated user: rfqs, rfq_responses, api_offset_logs, api_invoices,
insurance_claims, activity_log, admin_alerts.

Verify after apply: `SELECT * FROM admin_alerts` with anon key returns 0 rows.

### 004_api_key_hashing.sql — HIGH (coordinate with code deploy)

Migrates API keys from plaintext to SHA-256 hashed storage. Requires:
1. Coordinate with the code change to hash incoming keys before DB lookup.
2. After applying, re-issue all API keys (existing plaintext keys won't work).
3. A future follow-up removes the plaintext `api_key_live` / `api_key_sandbox`
   columns once all API routes use `_hash` columns.

---

## NEEDS GARY: E-signature backend (esign-service-not-live)

The e-signature page (`/sign/[token]`) now returns an honest 503 state rather
than accepting signatures that were never persisted.

To re-enable:
1. Create `agreements` table: `id`, `token` (unique), `order_id` FK, `status`,
   `created_at`, `expires_at`.
2. POST /api/credits/purchase → insert into `agreements`, email token link to buyer.
3. GET /api/agreements/[token] → return real order data.
4. POST /api/agreements/[token]/sign → persist: `signatureData`, `signatureMethod`,
   `typedName`, `userAgent`, `ip`, `timestamp`, `signedBy` (user.id).
5. Get ADGM-qualified legal review that the flow satisfies ADGM Electronic
   Transactions Regulations before enabling for real transactions.

---

## NEEDS GARY: Set environment variable CRON_SECRET

The DELETE handler on `/api/credits/reserve` now requires either:
- An admin session cookie, OR
- `x-cron-secret: <value>` header matching `process.env.CRON_SECRET`

Set `CRON_SECRET` in Vercel environment variables (generate with `openssl rand -hex 32`).
Configure the Vercel cron job to pass this header.

---

## NEEDS GARY: API key lookup update (after migration 004)

After applying `004_api_key_hashing.sql`, update `src/app/api/retire/route.ts`
GET and POST handlers to hash the incoming API key before lookup:

```typescript
import { createHash } from 'crypto';
const keyHash = createHash('sha256').update(apiKey).digest('hex');
// then: .or(`api_key_live_hash.eq.${keyHash},api_key_sandbox_hash.eq.${keyHash}`)
```

The same change is needed for any other route that accepts `x-api-key`.

---

## NEEDS GARY: ADGM registration claim (marketing)

Removed "ADGM registered" and "ADGM-registered entity" false claims from:
- Homepage footer: now reads "ADGM authorisation in progress"
- About section checklist: "ADGM-registered entity" → "ADGM jurisdiction — Abu Dhabi"
- Verra General Account holder and ACX Abu Dhabi member items marked "(target)"

Review and adjust wording once actual registration is achieved.

---

## NEEDS GARY: Legal pages

All 6 legal pages still contain `[Legal definitions to be provided by counsel]`
placeholder text. They correctly display a draft warning banner.

No commercial user onboarding should occur until ADGM-qualified counsel
drafts and reviews: Terms of Service, Privacy Policy, Cookie Policy, API Terms,
Insurance Terms, Marketplace Rules.

---

## Code changes shipped in this wave (no Gary action needed)

| # | Finding | Change | File(s) |
|---|---------|--------|---------|
| F-01 | Unauthenticated DELETE endpoint | Added admin session OR cron-secret guard | `api/credits/reserve/route.ts` |
| F-04 | Settlements POST no ownership check | Added buyer/seller/admin scoping per action type | `api/settlements/route.ts` |
| F-05 | Mock e-signature persists nothing | Replaced with honest 503 page | `sign/[token]/page.tsx` |
| F-07 | activity_log field names wrong | `user_id`→`actor_id`, `metadata`→`details` in all 3 routes | `reserve`, `retire`, `settlements` routes |
| F-10 | Mobile nav hamburger decorative | Added open/close state + slide panel | `page.tsx` |
| F-12 | Service role key in shared module | Moved `createServerClient` to `supabase-server.ts`; anon-only in `supabase.ts` | `supabase.ts`, `supabase-server.ts` |
| F-14 | `api_client_id` wrong column name | Fixed to `client_id` | `api/retire/route.ts` |
| ADGM | False registration claims | Removed/softened | `page.tsx` |
| SEC | Security headers | Added via `next.config.ts` headers() | `next.config.ts` |
| ANA | Vercel Analytics | Added `<Analytics />` to root layout | `layout.tsx`, `package.json` |
| ENV | Missing env example | Created `.env.example` with all vars | `.env.example` |
| LLM | llms.txt missing | Created | `public/llms.txt` |
| MIG | Migration 002 | orders status CHECK | `migrations/002_…sql` |
| MIG | Migration 003 | RLS all 7 uncovered tables | `migrations/003_…sql` |
| MIG | Migration 004 | API key hashing | `migrations/004_…sql` |
| admin_alerts | Schema field mismatch | `type`→`alert_type`, `severity`→`priority` | `retire`, `settlements` routes |
