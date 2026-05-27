/**
 * Escrow stub for CarbonBridge marketplace mechanics.
 *
 * STUB STATUS: All functions are in-memory stubs. No real payment processor
 * or smart-contract escrow is wired. Integration points are documented inline.
 *
 * When live:
 *  - holdFunds: call Stripe PaymentIntent.capture or on-chain escrow contract
 *  - releaseFunds: Stripe transfer to seller, or contract release()
 *  - refundBuyer: Stripe refund or contract refund()
 *  - freezeFunds: mark PaymentIntent as on-hold, suspend Stripe transfer
 */

import { z } from 'zod';

// ─── Shared types ────────────────────────────────────────────────────────────

export type EscrowState =
  | 'idle'
  | 'held'
  | 'released'
  | 'refunded'
  | 'frozen';

export const EscrowStateSchema = z.enum([
  'idle',
  'held',
  'released',
  'refunded',
  'frozen',
]);

export type EscrowError =
  | 'INSUFFICIENT_FUNDS'
  | 'HOLD_FAILED'
  | 'RELEASE_FAILED'
  | 'REFUND_FAILED'
  | 'FREEZE_FAILED'
  | 'INVALID_STATE_TRANSITION'
  | 'ESCROW_NOT_FOUND';

export interface EscrowResult<T = void> {
  ok: boolean;
  data?: T;
  error?: EscrowError;
  errorDetail?: string;
}

// ─── Input schemas ────────────────────────────────────────────────────────────

export const HoldFundsInputSchema = z.object({
  orderId: z.string().min(1),
  buyerWallet: z.string().min(1),
  amountUsd: z.number().positive(),
  creditId: z.string().min(1),
});
export type HoldFundsInput = z.infer<typeof HoldFundsInputSchema>;

export const HoldFundsOutputSchema = z.object({
  escrowId: z.string(),
  state: EscrowStateSchema,
  heldAt: z.string().datetime(),
  mode: z.enum(['stub', 'live']),
});
export type HoldFundsOutput = z.infer<typeof HoldFundsOutputSchema>;

export const ReleaseFundsInputSchema = z.object({
  escrowId: z.string().min(1),
  retirementCertificateId: z.string().min(1),
  sellerWallet: z.string().min(1),
});
export type ReleaseFundsInput = z.infer<typeof ReleaseFundsInputSchema>;

export const ReleaseFundsOutputSchema = z.object({
  escrowId: z.string(),
  state: EscrowStateSchema,
  releasedAt: z.string().datetime(),
  transferRef: z.string(),
  mode: z.enum(['stub', 'live']),
});
export type ReleaseFundsOutput = z.infer<typeof ReleaseFundsOutputSchema>;

export const RefundBuyerInputSchema = z.object({
  escrowId: z.string().min(1),
  reason: z.string().min(1),
});
export type RefundBuyerInput = z.infer<typeof RefundBuyerInputSchema>;

export const RefundBuyerOutputSchema = z.object({
  escrowId: z.string(),
  state: EscrowStateSchema,
  refundedAt: z.string().datetime(),
  refundRef: z.string(),
  mode: z.enum(['stub', 'live']),
});
export type RefundBuyerOutput = z.infer<typeof RefundBuyerOutputSchema>;

export const FreezeFundsInputSchema = z.object({
  escrowId: z.string().min(1),
  reason: z.string().min(1),
  frozenBy: z.enum(['buyer', 'seller', 'admin']),
});
export type FreezeFundsInput = z.infer<typeof FreezeFundsInputSchema>;

export const FreezeFundsOutputSchema = z.object({
  escrowId: z.string(),
  state: EscrowStateSchema,
  frozenAt: z.string().datetime(),
  mode: z.enum(['stub', 'live']),
});
export type FreezeFundsOutput = z.infer<typeof FreezeFundsOutputSchema>;

// ─── In-memory store (stub only) ─────────────────────────────────────────────

interface EscrowRecord {
  id: string;
  orderId: string;
  buyerWallet: string;
  amountUsd: number;
  creditId: string;
  state: EscrowState;
  heldAt: string;
  releasedAt?: string;
  refundedAt?: string;
  frozenAt?: string;
  retirementCertificateId?: string;
  sellerWallet?: string;
  refundReason?: string;
  freezeReason?: string;
  frozenBy?: 'buyer' | 'seller' | 'admin';
}

const stubStore = new Map<string, EscrowRecord>();

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── State-transition guard ───────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<EscrowState, EscrowState[]> = {
  idle: ['held'],
  held: ['released', 'refunded', 'frozen'],
  frozen: ['released', 'refunded'],
  released: [],
  refunded: [],
};

function canTransition(from: EscrowState, to: EscrowState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Hold buyer funds in escrow pending credit retirement confirmation.
 *
 * Live integration point: replace stub body with Stripe PaymentIntent capture
 * or on-chain escrow contract deposit call.
 */
export function holdFunds(
  input: HoldFundsInput,
): EscrowResult<HoldFundsOutput> {
  const parsed = HoldFundsInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'HOLD_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const id = generateId('escrow');
  const now = new Date().toISOString();
  const record: EscrowRecord = {
    id,
    orderId: parsed.data.orderId,
    buyerWallet: parsed.data.buyerWallet,
    amountUsd: parsed.data.amountUsd,
    creditId: parsed.data.creditId,
    state: 'held',
    heldAt: now,
  };
  stubStore.set(id, record);

  return {
    ok: true,
    data: {
      escrowId: id,
      state: 'held',
      heldAt: now,
      mode: 'stub',
    },
  };
}

/**
 * Release held funds to seller on retirement confirmation.
 *
 * Live integration point: Stripe transfer to connected seller account,
 * or on-chain contract release().
 */
export function releaseFunds(
  input: ReleaseFundsInput,
): EscrowResult<ReleaseFundsOutput> {
  const parsed = ReleaseFundsInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'RELEASE_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const record = stubStore.get(parsed.data.escrowId);
  if (!record) {
    return { ok: false, error: 'ESCROW_NOT_FOUND' };
  }
  if (!canTransition(record.state, 'released')) {
    return {
      ok: false,
      error: 'INVALID_STATE_TRANSITION',
      errorDetail: `Cannot release from state: ${record.state}`,
    };
  }

  const now = new Date().toISOString();
  record.state = 'released';
  record.releasedAt = now;
  record.retirementCertificateId = parsed.data.retirementCertificateId;
  record.sellerWallet = parsed.data.sellerWallet;

  return {
    ok: true,
    data: {
      escrowId: record.id,
      state: 'released',
      releasedAt: now,
      transferRef: generateId('txfr'),
      mode: 'stub',
    },
  };
}

/**
 * Refund buyer. Used when dispute resolves in buyer's favour or seller
 * fails to deliver.
 *
 * Live integration point: Stripe refund on the original PaymentIntent,
 * or on-chain contract refund().
 */
export function refundBuyer(
  input: RefundBuyerInput,
): EscrowResult<RefundBuyerOutput> {
  const parsed = RefundBuyerInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'REFUND_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const record = stubStore.get(parsed.data.escrowId);
  if (!record) {
    return { ok: false, error: 'ESCROW_NOT_FOUND' };
  }
  if (!canTransition(record.state, 'refunded')) {
    return {
      ok: false,
      error: 'INVALID_STATE_TRANSITION',
      errorDetail: `Cannot refund from state: ${record.state}`,
    };
  }

  const now = new Date().toISOString();
  record.state = 'refunded';
  record.refundedAt = now;
  record.refundReason = parsed.data.reason;

  return {
    ok: true,
    data: {
      escrowId: record.id,
      state: 'refunded',
      refundedAt: now,
      refundRef: generateId('rfnd'),
      mode: 'stub',
    },
  };
}

/**
 * Freeze funds while a dispute is under review. Prevents release or
 * refund until admin resolves contention.
 *
 * Live integration point: set Stripe PaymentIntent metadata flag,
 * add on-chain freeze guard.
 */
export function freezeFunds(
  input: FreezeFundsInput,
): EscrowResult<FreezeFundsOutput> {
  const parsed = FreezeFundsInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'FREEZE_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const record = stubStore.get(parsed.data.escrowId);
  if (!record) {
    return { ok: false, error: 'ESCROW_NOT_FOUND' };
  }
  if (!canTransition(record.state, 'frozen')) {
    return {
      ok: false,
      error: 'INVALID_STATE_TRANSITION',
      errorDetail: `Cannot freeze from state: ${record.state}`,
    };
  }

  const now = new Date().toISOString();
  record.state = 'frozen';
  record.frozenAt = now;
  record.freezeReason = parsed.data.reason;
  record.frozenBy = parsed.data.frozenBy;

  return {
    ok: true,
    data: {
      escrowId: record.id,
      state: 'frozen',
      frozenAt: now,
      mode: 'stub',
    },
  };
}

/** Test-only: read stub store state by escrow ID */
export function _stubGetRecord(escrowId: string): EscrowRecord | undefined {
  return stubStore.get(escrowId);
}

/** Test-only: clear stub store */
export function _stubClear(): void {
  stubStore.clear();
}
