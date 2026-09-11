# Phase 1 — Route ↔ Schema Contract Alignment (2026-09-08)

Branch: `night/20260908-carbonbridge-phase1-contract`
Scope: findings **CB-003 … CB-006** of `CARBONBRIDGE-AUDIT-CHECKLIST-2026-04-30.json`.

**Dates.** The contract checks and the review fixes described in the body of this
file ran on 2026-09-07 and 2026-09-08 (night shift). The reviewer follow-up at the
end of the file ran on 2026-09-11 and supersedes the body where the two disagree,
notably on the `resolve_dispute` target.

Phase 1 is the "the code writes columns that do not exist" class of finding. Every
API route in scope now writes only columns that exist in `supabase/migrations/`,
and the payload-building logic has been extracted into pure modules under
`src/lib/` so the contract is unit-testable without a database.

> **Note on the source checklist.** `CARBONBRIDGE-AUDIT-CHECKLIST-2026-04-30.json`
> is not committed to this repository and was not reachable from this worktree.
> The finding IDs, evidence and phase groupings below are reconstructed from the
> `CB-00x` annotations the previous pass left in the code and migrations. Re-check
> the wording of the Phase 2–5 paragraphs against the JSON before treating them
> as the canonical closing summary.

## Findings

| ID | Finding | Status | Evidence (file / column) | What changed on this branch |
|----|---------|--------|--------------------------|------------------------------|
| **CB-003** | The reservation route inserted a non-existent `orders.payment_deadline` column and left NOT NULL columns unset, so every reservation insert would fail. | **Fixed on this branch** | `src/app/api/credits/reserve/route.ts`; `orders.payment_deadline` does not exist in `001_initial_schema.sql` — the deadline column is `orders.reservation_expires_at`. NOT NULL columns left unset: `seller_id`, `project_name`, `credit_type`, `registry`, `credit_total`, `payment_method`. | New `src/lib/reservation.ts`: `ReserveRequestSchema` (uuid + positive-integer + `card`\|`bank_transfer` enum matching the `orders_payment_method_check` constraint), `RESERVABLE_LISTING_COLUMNS`, `buildReservationOrder()` populating every NOT NULL column, `reservationExpiry()`, and `applyReservationToListing()` / `releaseReservationFromListing()`. The route now selects the seller/credit columns it needs, writes `reservation_expires_at` only, and still returns `payment_deadline` in the JSON body (derived) for API compatibility. The DELETE sweep filters on `credits_released = false` and sets `credits_reserved:false, credits_released:true`, so a second sweep cannot double-credit a listing. |
| **CB-004** | The purchase-agreement route read `orders.agreement_reference`, treated `listings.listing_type = 'cb_direct'` as the CB Direct marker, and queried a non-existent `insurance_policies` table. | **Fixed on this branch** | `src/app/api/agreements/[orderId]/route.ts`; the real columns are `orders.agreement_ref` (set by the `set_agreement_ref` trigger), `listings.is_cb_direct` (boolean — `listing_type` is constrained to `spot`\|`forward`), and `orders.insurance_products` (jsonb) + `orders.insurance_premium_total` + `orders.insurance_policy_ref`. There is no `insurance_policies` table in any migration. | New `buildAgreementDataFromOrder()` and `parseInsuranceProducts()` in `src/lib/purchase-agreement.ts`, with typed `AgreementOrderSource` / `AgreementListingSource` / `AgreementProfileSource` mirroring the real rows. The route dropped the `insurance_policies` query entirely, reads acceptance from `orders.agreement_accepted_at` rather than inferring it from `status`, and does the seller access check against `orders.seller_id` (NOT NULL) instead of the joined `listings.seller_id`. |
| **CB-005** | The retire route inserted `endpoint` / `method` / `status_code` into `api_offset_logs` — none of which are columns — and omitted the NOT NULL `co2_tonnes` and `billing_period`. The API-key lookup also interpolated a raw header into a PostgREST `.or()` filter. | **Fixed on this branch** | `src/app/api/retire/route.ts`; `api_offset_logs` in `001_initial_schema.sql` has `client_id, co2_tonnes, credit_type_allocated, estimated_cost, billing_period, status, external_ref, metadata` and no HTTP columns. The `.or()` filter shape is documented in the `004_api_key_hashing.sql` header. | New `src/lib/api-usage.ts`: `buildApiOffsetLog()` (HTTP context moved into the existing `metadata` jsonb), `billingPeriod()` (UTC `YYYY-MM`), `buildCertificateRef()`, and `isWellFormedApiKey()` — a `^[A-Za-z0-9_-]{8,128}$` guard applied before the key reaches the `.or()` filter, which cannot reject a real `cb_<env>_<32 hex>` key but blocks the commas, dots and parentheses that would rewrite the filter. The usage row is now written *after* validation, once `co2_tonnes` is known, and only when the call came in via API key. `retirement_certificates.serial_numbers` is left empty (registry serials only); the CarbonBridge reference goes in `certificate_ref`. |
| **CB-006** | The settlements route drives a `settlements` table that no migration ever created, writes a `retirement_certificates` table that likewise never existed, and hard-coded `payment_amount: 0` with a "will be set from order total" TODO. | **Partially fixed — migration is a DRAFT, NOT APPLIED** | `src/app/api/settlements/route.ts`; `to_regclass('public.settlements')` and `to_regclass('public.retirement_certificates')` are both null against `001`–`004`. `payment_amount` is `settlements.payment_amount numeric(12,2)`. | New `src/lib/settlement.ts` holds the transition table (`SETTLEMENT_TRANSITIONS`), the buyer-restricted action list (`ADMIN_OR_SELLER_ACTIONS`), the settlement→`orders.status` mirror (every target inside the `orders_status_check` constraint from `002`), and `buildSettlementUpdate()`, which now takes the order total via `SettlementUpdateContext.paymentAmount` instead of hard-coding `0` (and writes `null`, not `0`, when the total is unavailable). New `supabase/migrations/005_phase1_contract_alignment.sql` creates both missing tables. **The migration has not been applied to any environment** — see below. |

### Related: migration 003 could not have applied

`005` also adds `rfqs.seller_id` and `insurance_claims.claimant_id`. Both are
referenced by RLS policies in `003_rls_uncovered_tables.sql` but were never
created by `001`, so `003` would fail partway through on any environment. `005`
must therefore be applied **before** `003`. Both are unapplied drafts, so no
ordering has been broken in production.

### Migration 005 status

`supabase/migrations/005_phase1_contract_alignment.sql` is **additive-only and has
NOT been applied to any environment.** It uses only `CREATE TABLE IF NOT EXISTS`,
`ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` and exception-guarded
`DO` blocks for policies — nothing is dropped, renamed or retyped, and re-running
it is a no-op. The one data statement is a backfill of `insurance_claims.claimant_id`
from the existing `buyer_id`. Applying it needs Gary's sign-off, must target the
CarbonBridge project `ixoxhzlwaspjfvbgfgff` (**never** `dcemanhmabsjmkitskil`,
which is Ledgable production), and must run before `003`.

## Verification

- `npx tsc --noEmit` — clean.
- `npm test` — 87 tests across 6 files pass. This branch adds
  `src/lib/__tests__/reservation.test.ts`, `settlement.test.ts` and
  `api-usage.test.ts` (57 tests) covering the validation schema, the payload and
  row builders, the settlement transition matrix, and the timestamp/reference
  formatting. All are pure; the two places a database call is relevant use a
  `vi.fn()` stub, so no test touches the network.
- Not verified: none of this has been exercised against a live Supabase
  instance. The contract is asserted against the migration SQL by reading, not by
  applying — the columns are correct as far as `001`–`005` describe them.

## Remaining audit phases

**Phase 2 — view-model / database type reconciliation.** The types at the top of
`src/lib/types.ts` (`Order`, `Listing`, `Profile`, `UserRole`, `OrderStatus`, …)
predate the SQL schema and do not mirror it column-for-column: `Order.total` vs
`orders.total_amount`, `Order.subtotal` vs `orders.credit_total`,
`Listing.vintage` vs `listings.vintage_year`, and `UserRole` of
`buyer`\|`seller`\|`admin` vs `profiles.role` of `user`\|`admin`\|`super_admin`
(seller status is the separate `profiles.seller_approved` boolean). Phase 1
sidestepped this by adding a second, schema-exact block of row contracts
(`OrderRow`, `ListingRow`, `ProfileRow`, `SettlementRow`, …) at the bottom of the
same file and pointing all database code at those. That leaves two parallel type
systems and a hand-written mapping wherever a route feeds a component. Phase 2 is
to collapse them — most cleanly by generating types from the database and making
the view models explicit `Pick`/mapping types over the row contracts, so a future
column rename breaks the build instead of failing at runtime.

**Phase 3 — apply the unapplied migrations and prove RLS.** `003` (RLS on the
seven unprotected tables: `rfqs`, `rfq_responses`, `api_offset_logs`,
`api_invoices`, `insurance_claims`, `activity_log`, `admin_alerts`), `004` (API
key hashing) and `005` are all marked `STATUS: DRAFT — do not apply without Gary
sign-off`, so every finding they close is still live in the database: admin
alerts and the activity log are readable with the anon key, and
`profiles.api_key_live` / `api_key_sandbox` are still plaintext, meaning any dump
or accidental `SELECT` exposes live credentials. Phase 3 is to apply them in
order (`005` → `003` → `004`) against `ixoxhzlwaspjfvbgfgff`, cut the API routes
over to the hashed columns added by `004`, and add a test that asserts the
anon-key read of each protected table returns zero rows rather than trusting the
policy text.

**Phase 4 — the stubbed financial and registry integrations.** `src/lib/escrow.ts`
and `src/lib/dispute.ts` hold all state in process memory — no Stripe
PaymentIntent capture, no on-chain contract, no database writes, no evidence
storage — and `src/app/api/retire/route.ts` records a retirement request and
raises an `admin_alert` for a human to execute rather than calling Verra, Gold
Standard or ACX. Insurance is described in the marketplace UI with no underwriter
API behind it. These are deliberate, documented boundaries rather than defects:
each is blocked on the ADGM/FSRA Financial Services Permission (live retirement
and disbursement are regulated activities) plus signed registry and Lloyd's
syndicate agreements. Phase 4 is the swap-in once those land — the state machines
and typed interfaces are already in place, and every stub carries an inline
comment naming the exact API call that replaces its body. Until then the
`settlements` and `retirement_certificates` rows created by `005` should be read
as records of a *requested* action, not a completed one.

**Phase 5 — production hardening and operational coverage.** The remaining items
are the ones with no single file to point at: no CI running `tsc` and `vitest` on
push, no integration tests against a real Supabase instance (everything proven so
far is pure-function level), no scheduled job actually calling the reservation
sweep at `DELETE /api/credits/reserve` — the endpoint exists but nothing invokes
it, so expired reservations sit holding inventory — and no monitoring or alerting
on the API routes. Dependency freshness is now handled by the `renovate.json`
added on this branch (weekly, grouped non-major, `Asia/Dubai`). Phase 5 should
also revisit the reserve/release path for concurrency: the current
read-then-conditional-update is guarded by an `.eq()` filter and a rollback, but
the durable fix is a Postgres function that decrements `available_tonnes`
atomically.

## Review fixes (passes 3–4, same night)

A code review of the first commit raised six points; this is what landed.

1. **RLS vs the routes' own writes** — `settlements` and `retirement_certificates` carry admin-only / buyer-only write policies, and `/api/retire` accepts API-key callers with no session. The retire and settlements routes now perform their writes through `createServiceClient()` (service-role key) *after* their own auth checks; `createServiceClient()` throws if `SUPABASE_SERVICE_ROLE_KEY` is missing instead of silently using a placeholder. **Vercel must have `SUPABASE_SERVICE_ROLE_KEY` set** (server-side only) before this branch is deployed.
2. **Migration ordering** — 003 is itself an unapplied draft that depends on two columns added in section 3 of 005; the header of 005 now states the exact order to run on a fresh database vs the live project. Nothing in 005 is order-sensitive within itself and every statement is idempotent.
3. **`resolve_dispute` target** — `flag_dispute` now records `settlements.previous_status` and `resolve_dispute` returns to it (or to an explicit `target_status` in the body, restricted to `pending | buyer_paid | credits_transferred`); a dispute raised from `pending` can no longer resolve into `buyer_paid`. Column added to 005; covered by tests.
4. **`payment_method` default** — one shared default in `src/lib/reservation.ts`, imported by the reserve route and the agreement builder, so reservation validity (3 vs 5 days) is computed from the same value everywhere.
5. **`settlement.ts` wired into `POST /api/settlements`** — the route's inline transition table was replaced by the state machine; auth checks are unchanged.
6. **Types** — `AgreementData` declares `credits.serialRange` and `products[].policyReference`; `tsc --noEmit` is clean.

## Known behaviour changes (check the UI before merging)

- `quantity` in `POST /api/credits/reserve` must now be a positive integer.
- `acceptedAt` in the agreement payload is `undefined` for orders that have no `agreement_accepted_at`.
- `serial_numbers` on a retirement certificate no longer carries the certificate reference — read `certificate_ref` instead.
- `mark_failed` / `cancelled` still does not release reserved tonnes back to the listing (pre-existing; Phase 3).
- The empty-string `x-api-key` edge case in `/api/retire` (`viaApiKey` true while the session path is taken) is unchanged — worth a one-line fix in Phase 3.

## Night-six follow-up (2026-09-11): the remaining CodeRabbit items on PR #4

Reviewer comments on this PR came in three rounds (17 + 4 + 3). This is what landed on 2026-09-11, verified with `npx tsc --noEmit` clean and `npx vitest run` 126/126 (was 87). Nothing in this section has been run against a live Supabase instance; the SQL functions are proven by reading and by the route-level mapping tests only.

**Done**

- Reserve (`POST /api/credits/reserve`): the availability check, listing counter update and order insert now run inside one Postgres function, `public.reserve_credits(...)` in `supabase/migrations/006_phase1_atomic_operations.sql` (row lock on the listing, exceptions `LISTING_NOT_FOUND` / `INSUFFICIENT_CREDITS:<available>`), called through the service-role client after session auth and Zod validation. The old optimistic-lock update and its unconditional rollback are gone. `src/lib/rpc-errors.ts` maps the exception text to the previous 404/409 responses and is unit-tested.
- Expiry sweep (`DELETE /api/credits/reserve`): `public.release_expired_reservations()` claims each expired order with `FOR UPDATE SKIP LOCKED`, marks it released and restores the listing in the same transaction, returning the released rows; the route writes one `activity_log` row per returned order. Two overlapping sweeps can no longer restore the same quantity twice.
- Retire (`POST /api/retire`): `public.create_retirement_certificate(...)` locks the order, requires it to belong to the caller and be `completed`, sums `tonnes_retired` over `pending`, `processing` and `completed` certificates (previously only `completed`), and inserts the `processing` certificate in the same transaction (`ORDER_NOT_FOUND`, `ALREADY_RETIRED:<n>`, `EXCEEDS_REMAINING:<n>`). Duplicate allocation from concurrent requests is closed.
- Retire metering: an `x-api-key` header that is present but empty is rejected with 401 in POST and GET instead of silently falling back to session auth; `viaApiKey` uses the same truthy condition as the auth branch; a failed `api_offset_logs` insert now raises a red `admin_alerts` row (`api_metering_failed`) and the response carries `metered: false` (`metered: true` on success for API-key callers). The certificate is never undone.
- `buildCertificateRef` appends a six-hex-character random component (`node:crypto`), so two requests in the same millisecond cannot collide on the `UNIQUE certificate_ref`; tests pass explicit entropy.
- Purchase agreement: every untrusted string is passed through `escapeHtml()` before interpolation (XSS finding); the agreement date is rendered with `timeZone: 'UTC'`; the credit line uses the stored `orders.credit_total` instead of recomputing `quantity * unit_price`; a stored `insurance_premium_total` of 0 is used as 0 rather than re-summed from product rows. New `src/lib/__tests__/purchase-agreement.test.ts`.
- Reservation helpers: `releaseReservationFromListing` releases `min(quantity, reserved_tonnes)` from both counters so the pair stays balanced; `ReserveRequestSchema` uses `z.uuid()`.
- Settlements: dispute resolution returns to the recorded `previous_status` only; the caller-supplied `target_status` override described in "Review fixes" item 3 above is removed (an admin override would be a separate audited transition). Request bodies are parsed as `unknown` and rejected with a structured 400 when not an object or not valid JSON. Each transition is compare-and-set: the update filters on the status the transition was validated against and returns 409 `Settlement changed concurrently — retry` when zero rows match, before any order update or side effect.
- Migrations: the two prerequisite columns (`rfqs.seller_id`, `insurance_claims.claimant_id`) are now added idempotently at the top of `003_rls_uncovered_tables.sql`, so a clean `supabase db reset` replays in filename order (the copies in 005 stay, also idempotent). In 005 the buyer INSERT policy on `retirement_certificates` now requires `buyer_id = auth.uid()`, a status of `pending` or `processing`, and an `EXISTS` check that the order belongs to the same buyer; a separate admin INSERT policy has no status restriction.

**Deliberately not done**

- Squawk lock warnings (add foreign keys as `NOT VALID` then validate; create indexes `CONCURRENTLY`; batch the `claimant_id` backfill): the affected tables hold a handful of rows and Supabase applies each migration file inside one transaction, where `CONCURRENTLY` is not allowed. Revisit when there is production volume.
- `docs/PHASE1-CONTRACT-ALIGNMENT-2026-09-08.md` filename date: kept; the dates note at the top of the file records when each pass ran.
- Integration tests against a real database: nothing here executes SQL offline. The `p_*` argument order of the three functions is asserted by the route tests only.

**Deploy order (unchanged in spirit, now with 006)**

1. Apply `005_phase1_contract_alignment.sql`, then `006_phase1_atomic_operations.sql`, on the live project; refresh the PostgREST schema cache.
2. Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (the reserve, sweep, retire and settlements routes call `createServiceClient()` after their own auth checks).
3. Deploy this branch. Until 1 and 2 are done the reserve, sweep and retire routes return 500 (missing function / missing key), so merge and deploy together, not separately.
