# CarbonBridge Web

MENA-focused carbon credit marketplace. Next.js 15, Supabase, TypeScript.

## Stub vs. Live — What's Not Wired Yet

This section is the authoritative record of what is intentionally incomplete and why.

### Registry Retirement Calls

**Stubbed.** `src/app/api/retire/route.ts` creates a certificate record and inserts an `admin_alert` for manual execution. No API call is made to Verra, Gold Standard, or ACR.

**Why:** Two blockers must be resolved first:
1. ADGM/FSRA Financial Services Permission — application in progress. Live registry retirement constitutes a regulated settlement activity.
2. Registry partner agreements — Verra API access, Gold Standard Impact Registry API, and ACX/Xpansiv API all require signed service agreements with per-retirement fees.

**Integration point:** `src/app/api/retire/route.ts` contains a `TODO (live integration)` comment block with the exact API endpoints for each registry.

### Escrow

**Stubbed.** `src/lib/escrow.ts` holds all state in-process memory. No Stripe PaymentIntent capture, no on-chain escrow contract.

**Why:** Escrow requires either (a) Stripe Connect with ADGM-appropriate financial services terms, or (b) an on-chain contract which requires separate legal review. The stub defines the full state machine (`idle → held → released/refunded/frozen`) and typed interfaces so the live integration is a drop-in.

**Integration point:** Each function in `escrow.ts` has an inline comment specifying the Stripe API call or contract method to replace the stub body with.

### Dispute Resolution

**Stubbed.** `src/lib/dispute.ts` holds state in-process memory. No database writes, no notifications, no file storage.

**Why:** Same blocker as escrow — the dispute resolution flow involves financial disbursements, which require authorisation. The stub defines the full state machine (`open → evidence_submitted → under_review → resolved → appealed`) and Zod-validated interfaces.

**Integration point:** Each function has an inline comment specifying the Supabase table write and Supabase Storage bucket for evidence attachments.

### Insurance Distribution

**Stubbed in UI only.** Insurance is described in the marketplace UI but no underwriter API is connected.

**Why:** Kita and CFC (Lloyd's syndicates) distribution agreements are pending. Binding insurance quotes require FSP.

## Running Tests

```bash
npm test
```

Tests cover the escrow state machine: 8 tests across `hold`, `hold → release`, `hold → freeze → refund`, `hold → refund` direct, invalid transitions, and not-found errors.

## Type Check

```bash
npx tsc --noEmit
```

## Development

```bash
npm run dev
```
