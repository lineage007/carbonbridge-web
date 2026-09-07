/**
 * Settlement state machine (Phase 1 alignment — CB-006).
 *
 * Pure transition logic for POST /api/settlements. Every column emitted here
 * exists on public.settlements as created by
 * supabase/migrations/005_phase1_contract_alignment.sql, and every order status
 * emitted is inside the orders_status_check constraint from
 * 002_fix_order_status_pending_payment.sql.
 */

import type { OrderStatusValue, SettlementRow } from './types';

export type SettlementStatus = SettlementRow['status'];

export type SettlementAction =
  | 'confirm_payment'
  | 'initiate_transfer'
  | 'confirm_delivery'
  | 'flag_dispute'
  | 'resolve_dispute'
  | 'mark_failed';

export interface SettlementTransition {
  from: SettlementStatus[];
  to: SettlementStatus;
  /** Request body fields that must be present for the transition to be accepted. */
  required: Array<'payment_reference' | 'verra_transfer_ref'>;
}

export const SETTLEMENT_TRANSITIONS: Record<SettlementAction, SettlementTransition> = {
  confirm_payment: { from: ['pending'], to: 'buyer_paid', required: ['payment_reference'] },
  initiate_transfer: { from: ['buyer_paid'], to: 'credits_transferred', required: [] },
  confirm_delivery: { from: ['credits_transferred'], to: 'completed', required: ['verra_transfer_ref'] },
  flag_dispute: { from: ['pending', 'buyer_paid', 'credits_transferred'], to: 'disputed', required: [] },
  // `to` is only the *default* target — the real target is the status the
  // settlement was in before the dispute. See resolveTargetStatus().
  resolve_dispute: { from: ['disputed'], to: 'pending', required: [] },
  mark_failed: { from: ['pending', 'buyer_paid', 'disputed'], to: 'failed', required: [] },
};

/**
 * Statuses a dispute may be resolved back into. A dispute raised from `pending`
 * must not resolve into `buyer_paid` — no payment was ever recorded (review
 * finding 3). `flag_dispute` stores the pre-dispute status in
 * settlements.previous_status; `resolve_dispute` reads it back.
 */
export const DISPUTE_RESOLUTION_STATUSES: SettlementStatus[] = [
  'pending',
  'buyer_paid',
  'credits_transferred',
];

/** Used when neither an explicit target nor a stored previous_status is available. */
export const DEFAULT_DISPUTE_RESOLUTION_STATUS: SettlementStatus =
  SETTLEMENT_TRANSITIONS.resolve_dispute.to;

export interface TargetStatusContext {
  /** settlements.previous_status — written by flag_dispute. */
  previousStatus?: SettlementStatus | string | null;
  /** Explicit override supplied by the caller (`target_status` in the body). */
  targetStatus?: SettlementStatus | string | null;
}

function asResolutionStatus(value: unknown): SettlementStatus | null {
  return typeof value === 'string' && (DISPUTE_RESOLUTION_STATUSES as string[]).includes(value)
    ? (value as SettlementStatus)
    : null;
}

/**
 * The status a transition actually lands on. Static for every action except
 * `resolve_dispute`, which returns to the pre-dispute state.
 */
export function resolveTargetStatus(
  action: SettlementAction,
  ctx: TargetStatusContext = {},
): SettlementStatus {
  if (action !== 'resolve_dispute') return SETTLEMENT_TRANSITIONS[action].to;
  return (
    asResolutionStatus(ctx.targetStatus) ??
    asResolutionStatus(ctx.previousStatus) ??
    DEFAULT_DISPUTE_RESOLUTION_STATUS
  );
}

/** Actions a buyer may not perform — restricted to the seller or an admin. */
export const ADMIN_OR_SELLER_ACTIONS: SettlementAction[] = [
  'initiate_transfer',
  'confirm_delivery',
  'mark_failed',
  'resolve_dispute',
];

/**
 * Mirror of the settlement status onto orders.status. `pending` has no order
 * counterpart — the order keeps whatever status the reservation left it in.
 */
export const ORDER_STATUS_BY_SETTLEMENT_STATUS: Record<SettlementStatus, OrderStatusValue | null> = {
  pending: null,
  buyer_paid: 'payment_received',
  credits_transferred: 'transfer_in_progress',
  completed: 'completed',
  disputed: 'disputed',
  failed: 'cancelled',
};

/**
 * orders.status for a transition. Resolving a dispute back to `pending` puts
 * the order back on the payment deadline rather than leaving it `disputed`.
 */
export function orderStatusForTransition(
  action: SettlementAction,
  target: SettlementStatus,
): OrderStatusValue | null {
  if (action === 'resolve_dispute' && target === 'pending') return 'pending_payment';
  return ORDER_STATUS_BY_SETTLEMENT_STATUS[target];
}

export const SETTLEMENT_ACTIONS = Object.keys(SETTLEMENT_TRANSITIONS) as SettlementAction[];

export function isSettlementAction(value: unknown): value is SettlementAction {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SETTLEMENT_TRANSITIONS, value);
}

export function canTransition(from: SettlementStatus, action: SettlementAction): boolean {
  return SETTLEMENT_TRANSITIONS[action].from.includes(from);
}

/** Names of the transition's required body fields that are missing or blank. */
export function missingRequiredFields(
  action: SettlementAction,
  body: { payment_reference?: unknown; verra_transfer_ref?: unknown },
): string[] {
  return SETTLEMENT_TRANSITIONS[action].required.filter((field) => {
    const value = body[field];
    return typeof value !== 'string' || value.trim() === '';
  });
}

export interface SettlementUpdateContext extends TargetStatusContext {
  now: Date;
  /** The settlement's current status — recorded as previous_status on a dispute. */
  fromStatus?: SettlementStatus;
  paymentReference?: string;
  /** orders.total_amount — recorded when payment is confirmed. */
  paymentAmount?: number | null;
  verraTransferRef?: string;
  notes?: string;
}

export type SettlementUpdate = Partial<
  Pick<
    SettlementRow,
    | 'status'
    | 'notes'
    | 'payment_reference'
    | 'payment_amount'
    | 'payment_received_at'
    | 'credits_transferred_at'
    | 'verra_transfer_ref'
    | 'completed_at'
    | 'updated_at'
    | 'previous_status'
  >
>;

export function buildSettlementUpdate(
  action: SettlementAction,
  ctx: SettlementUpdateContext,
): SettlementUpdate {
  const timestamp = ctx.now.toISOString();
  const to = resolveTargetStatus(action, ctx);

  const update: SettlementUpdate = {
    status: to,
    updated_at: timestamp,
  };

  if (ctx.notes) update.notes = ctx.notes;

  if (action === 'flag_dispute' && ctx.fromStatus) {
    // Remember where to come back to when the dispute is resolved.
    update.previous_status = ctx.fromStatus;
  }

  if (action === 'resolve_dispute') {
    update.previous_status = null;
  }

  if (action === 'confirm_payment') {
    update.payment_received_at = timestamp;
    update.payment_reference = ctx.paymentReference ?? null;
    // CB-006: previously hard-coded to 0 with a "will be set from order total"
    // TODO. The order total is now passed in by the route.
    update.payment_amount = ctx.paymentAmount ?? null;
  }

  if (action === 'initiate_transfer') {
    update.credits_transferred_at = timestamp;
  }

  if (action === 'confirm_delivery') {
    update.verra_transfer_ref = ctx.verraTransferRef ?? null;
    update.completed_at = timestamp;
  }

  return update;
}
