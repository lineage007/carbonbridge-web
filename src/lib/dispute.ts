/**
 * Dispute stub for CarbonBridge marketplace mechanics.
 *
 * STUB STATUS: All functions are in-memory stubs. No external dispute
 * management system is wired. Integration points documented inline.
 *
 * When live:
 *  - openDispute: write to disputes table, trigger admin notification,
 *    call freezeFunds() from escrow.ts
 *  - submitEvidence: upload files to object storage (Supabase Storage),
 *    persist evidence records linked to dispute
 *  - resolveDispute: call releaseFunds() or refundBuyer() depending on outcome
 *  - appealDispute: re-open dispute, freeze again, notify senior admin
 */

import { z } from 'zod';

// ─── Shared types ─────────────────────────────────────────────────────────────

export type DisputeState =
  | 'open'
  | 'evidence_submitted'
  | 'under_review'
  | 'resolved'
  | 'appealed';

export const DisputeStateSchema = z.enum([
  'open',
  'evidence_submitted',
  'under_review',
  'resolved',
  'appealed',
]);

export type DisputeOutcome = 'buyer_wins' | 'seller_wins' | 'split';

export type DisputeError =
  | 'DISPUTE_OPEN_FAILED'
  | 'EVIDENCE_SUBMIT_FAILED'
  | 'RESOLVE_FAILED'
  | 'APPEAL_FAILED'
  | 'DISPUTE_NOT_FOUND'
  | 'INVALID_STATE_TRANSITION'
  | 'ALREADY_RESOLVED';

export interface DisputeResult<T = void> {
  ok: boolean;
  data?: T;
  error?: DisputeError;
  errorDetail?: string;
}

// ─── Input schemas ────────────────────────────────────────────────────────────

export const OpenDisputeInputSchema = z.object({
  orderId: z.string().min(1),
  escrowId: z.string().min(1),
  raisedBy: z.enum(['buyer', 'seller']),
  reason: z.string().min(10).max(2000),
  creditId: z.string().min(1),
});
export type OpenDisputeInput = z.infer<typeof OpenDisputeInputSchema>;

export const OpenDisputeOutputSchema = z.object({
  disputeId: z.string(),
  state: DisputeStateSchema,
  openedAt: z.string().datetime(),
  mode: z.enum(['stub', 'live']),
});
export type OpenDisputeOutput = z.infer<typeof OpenDisputeOutputSchema>;

export const SubmitEvidenceInputSchema = z.object({
  disputeId: z.string().min(1),
  submittedBy: z.enum(['buyer', 'seller', 'admin']),
  description: z.string().min(1).max(5000),
  /** File references — in live system, these are object-storage keys */
  attachments: z.array(z.string()).optional(),
});
export type SubmitEvidenceInput = z.infer<typeof SubmitEvidenceInputSchema>;

export const SubmitEvidenceOutputSchema = z.object({
  disputeId: z.string(),
  evidenceId: z.string(),
  state: DisputeStateSchema,
  submittedAt: z.string().datetime(),
  mode: z.enum(['stub', 'live']),
});
export type SubmitEvidenceOutput = z.infer<typeof SubmitEvidenceOutputSchema>;

export const ResolveDisputeInputSchema = z.object({
  disputeId: z.string().min(1),
  resolvedBy: z.string().min(1),
  outcome: z.enum(['buyer_wins', 'seller_wins', 'split']),
  notes: z.string().min(1).max(5000),
  splitBuyerPct: z.number().min(0).max(100).optional(),
});
export type ResolveDisputeInput = z.infer<typeof ResolveDisputeInputSchema>;

export const ResolveDisputeOutputSchema = z.object({
  disputeId: z.string(),
  state: DisputeStateSchema,
  outcome: z.enum(['buyer_wins', 'seller_wins', 'split']),
  resolvedAt: z.string().datetime(),
  mode: z.enum(['stub', 'live']),
});
export type ResolveDisputeOutput = z.infer<typeof ResolveDisputeOutputSchema>;

export const AppealDisputeInputSchema = z.object({
  disputeId: z.string().min(1),
  appealedBy: z.enum(['buyer', 'seller']),
  grounds: z.string().min(10).max(5000),
});
export type AppealDisputeInput = z.infer<typeof AppealDisputeInputSchema>;

export const AppealDisputeOutputSchema = z.object({
  disputeId: z.string(),
  state: DisputeStateSchema,
  appealedAt: z.string().datetime(),
  mode: z.enum(['stub', 'live']),
});
export type AppealDisputeOutput = z.infer<typeof AppealDisputeOutputSchema>;

// ─── In-memory store (stub only) ─────────────────────────────────────────────

interface EvidenceRecord {
  id: string;
  submittedBy: 'buyer' | 'seller' | 'admin';
  description: string;
  attachments: string[];
  submittedAt: string;
}

interface DisputeRecord {
  id: string;
  orderId: string;
  escrowId: string;
  raisedBy: 'buyer' | 'seller';
  reason: string;
  creditId: string;
  state: DisputeState;
  openedAt: string;
  outcome?: DisputeOutcome;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  splitBuyerPct?: number;
  appealedAt?: string;
  appealedBy?: 'buyer' | 'seller';
  evidence: EvidenceRecord[];
}

const stubStore = new Map<string, DisputeRecord>();

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── State-transition guard ───────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<DisputeState, DisputeState[]> = {
  open: ['evidence_submitted', 'under_review', 'resolved'],
  evidence_submitted: ['under_review', 'resolved'],
  under_review: ['resolved'],
  resolved: ['appealed'],
  appealed: ['under_review', 'resolved'],
};

function canTransition(from: DisputeState, to: DisputeState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Open a dispute for an order. Caller should also call freezeFunds() from
 * escrow.ts to prevent disbursement while dispute is live.
 *
 * Live integration point: write to disputes Supabase table, send admin
 * notification, call escrow.freezeFunds().
 */
export function openDispute(
  input: OpenDisputeInput,
): DisputeResult<OpenDisputeOutput> {
  const parsed = OpenDisputeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'DISPUTE_OPEN_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const id = generateId('dispute');
  const now = new Date().toISOString();
  const record: DisputeRecord = {
    id,
    orderId: parsed.data.orderId,
    escrowId: parsed.data.escrowId,
    raisedBy: parsed.data.raisedBy,
    reason: parsed.data.reason,
    creditId: parsed.data.creditId,
    state: 'open',
    openedAt: now,
    evidence: [],
  };
  stubStore.set(id, record);

  return {
    ok: true,
    data: {
      disputeId: id,
      state: 'open',
      openedAt: now,
      mode: 'stub',
    },
  };
}

/**
 * Submit evidence for an existing dispute.
 *
 * Live integration point: store attachments to Supabase Storage bucket
 * `dispute-evidence/{disputeId}/`, write evidence row to DB.
 */
export function submitEvidence(
  input: SubmitEvidenceInput,
): DisputeResult<SubmitEvidenceOutput> {
  const parsed = SubmitEvidenceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'EVIDENCE_SUBMIT_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const record = stubStore.get(parsed.data.disputeId);
  if (!record) {
    return { ok: false, error: 'DISPUTE_NOT_FOUND' };
  }
  if (record.state === 'resolved') {
    return {
      ok: false,
      error: 'ALREADY_RESOLVED',
      errorDetail: 'Cannot submit evidence to a resolved dispute',
    };
  }

  const now = new Date().toISOString();
  const evidenceId = generateId('ev');
  record.evidence.push({
    id: evidenceId,
    submittedBy: parsed.data.submittedBy,
    description: parsed.data.description,
    attachments: parsed.data.attachments ?? [],
    submittedAt: now,
  });

  if (canTransition(record.state, 'evidence_submitted')) {
    record.state = 'evidence_submitted';
  }

  return {
    ok: true,
    data: {
      disputeId: record.id,
      evidenceId,
      state: record.state,
      submittedAt: now,
      mode: 'stub',
    },
  };
}

/**
 * Resolve a dispute. After resolution, caller should call
 * escrow.releaseFunds() (seller wins) or escrow.refundBuyer() (buyer wins).
 *
 * Live integration point: write resolution to DB, trigger escrow action,
 * send notification emails to both parties.
 */
export function resolveDispute(
  input: ResolveDisputeInput,
): DisputeResult<ResolveDisputeOutput> {
  const parsed = ResolveDisputeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'RESOLVE_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const record = stubStore.get(parsed.data.disputeId);
  if (!record) {
    return { ok: false, error: 'DISPUTE_NOT_FOUND' };
  }
  if (!canTransition(record.state, 'resolved')) {
    return {
      ok: false,
      error: 'INVALID_STATE_TRANSITION',
      errorDetail: `Cannot resolve from state: ${record.state}`,
    };
  }

  const now = new Date().toISOString();
  record.state = 'resolved';
  record.outcome = parsed.data.outcome;
  record.resolvedAt = now;
  record.resolvedBy = parsed.data.resolvedBy;
  record.resolutionNotes = parsed.data.notes;
  if (parsed.data.outcome === 'split') {
    record.splitBuyerPct = parsed.data.splitBuyerPct ?? 50;
  }

  return {
    ok: true,
    data: {
      disputeId: record.id,
      state: 'resolved',
      outcome: parsed.data.outcome,
      resolvedAt: now,
      mode: 'stub',
    },
  };
}

/**
 * Appeal a resolved dispute. Returns the dispute to review state.
 * Only one appeal per dispute is tracked; further appeals require admin
 * escalation outside this flow.
 *
 * Live integration point: write to appeals table, notify senior admin,
 * re-freeze escrow if already disbursed (may not be possible — surface to human).
 */
export function appealDispute(
  input: AppealDisputeInput,
): DisputeResult<AppealDisputeOutput> {
  const parsed = AppealDisputeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'APPEAL_FAILED',
      errorDetail: parsed.error.message,
    };
  }

  const record = stubStore.get(parsed.data.disputeId);
  if (!record) {
    return { ok: false, error: 'DISPUTE_NOT_FOUND' };
  }
  if (!canTransition(record.state, 'appealed')) {
    return {
      ok: false,
      error: 'INVALID_STATE_TRANSITION',
      errorDetail: `Cannot appeal from state: ${record.state}`,
    };
  }

  const now = new Date().toISOString();
  record.state = 'appealed';
  record.appealedAt = now;
  record.appealedBy = parsed.data.appealedBy;

  return {
    ok: true,
    data: {
      disputeId: record.id,
      state: 'appealed',
      appealedAt: now,
      mode: 'stub',
    },
  };
}

/** Test-only: read stub store state by dispute ID */
export function _stubGetRecord(
  disputeId: string,
): DisputeRecord | undefined {
  return stubStore.get(disputeId);
}

/** Test-only: clear stub store */
export function _stubClear(): void {
  stubStore.clear();
}
