/**
 * demo-session.ts
 *
 * DEMONSTRATION-ONLY in-browser session store.
 *
 * STUB STATUS: This module holds escrow and dispute state in module-level
 * memory for the demonstration flows. Nothing is persisted to a database,
 * written to any registry, or charged to any payment method.
 *
 * Replaced when: Supabase persistence + Stripe Connect + ADGM FSP
 * authorisation are in place.
 */

import { holdFunds, releaseFunds, refundBuyer, freezeFunds } from './escrow';
import { openDispute, submitEvidence } from './dispute';
import type {
  EscrowState,
  HoldFundsOutput,
  ReleaseFundsOutput,
  RefundBuyerOutput,
  FreezeFundsOutput,
} from './escrow';
import type {
  DisputeState,
  OpenDisputeOutput,
  SubmitEvidenceOutput,
} from './dispute';

// ─── Order session ───────────────────────────────────────────────────────────

export interface OrderSession {
  orderId: string;
  creditId: string;
  creditName: string;
  quantity: number;
  pricePerTonne: number;
  totalUsd: number;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  createdAt: string;
  // Escrow
  escrowId?: string;
  escrowState?: EscrowState;
  escrowHeldAt?: string;
  escrowMode: 'stub';
  // Retirement
  retirementCertId?: string;
  retirementRef?: string;
  retirementStatus?: 'pending' | 'processing' | 'demonstration_complete';
  // Dispute
  disputeId?: string;
  disputeState?: DisputeState;
}

// Module-level store — survives page navigation, resets on reload (demo only).
const sessions = new Map<string, OrderSession>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createOrder(params: Omit<OrderSession, 'orderId' | 'createdAt' | 'escrowMode'>): OrderSession {
  const orderId = genId('order');
  const session: OrderSession = {
    ...params,
    orderId,
    createdAt: new Date().toISOString(),
    escrowMode: 'stub',
  };
  sessions.set(orderId, session);
  return session;
}

export function getOrder(orderId: string): OrderSession | undefined {
  return sessions.get(orderId);
}

export function placeInEscrow(
  orderId: string,
): { ok: boolean; data?: HoldFundsOutput; error?: string } {
  const session = sessions.get(orderId);
  if (!session) return { ok: false, error: 'Order not found' };

  const result = holdFunds({
    orderId,
    buyerWallet: `demo-wallet-${session.buyerEmail}`,
    amountUsd: session.totalUsd,
    creditId: session.creditId,
  });

  if (!result.ok || !result.data) {
    return { ok: false, error: result.errorDetail ?? result.error ?? 'Hold failed' };
  }

  session.escrowId = result.data.escrowId;
  session.escrowState = 'held';
  session.escrowHeldAt = result.data.heldAt;
  return { ok: true, data: result.data };
}

export function retireCredits(
  orderId: string,
  beneficiaryName: string,
): { ok: boolean; certRef?: string; certId?: string; releaseData?: ReleaseFundsOutput; error?: string } {
  const session = sessions.get(orderId);
  if (!session) return { ok: false, error: 'Order not found' };
  if (!session.escrowId) return { ok: false, error: 'Escrow not held' };
  if (session.escrowState !== 'held') {
    return { ok: false, error: `Escrow is ${session.escrowState}, must be held` };
  }

  const certRef = `CB-RET-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const certId = genId('cert');

  const result = releaseFunds({
    escrowId: session.escrowId,
    retirementCertificateId: certId,
    sellerWallet: 'demo-seller-wallet',
  });

  if (!result.ok || !result.data) {
    return { ok: false, error: result.errorDetail ?? result.error ?? 'Release failed' };
  }

  session.escrowState = 'released';
  session.retirementCertId = certId;
  session.retirementRef = certRef;
  session.retirementStatus = 'demonstration_complete';

  return { ok: true, certRef, certId, releaseData: result.data };
}

export function openDisputeForOrder(
  orderId: string,
  reason: string,
): { ok: boolean; data?: OpenDisputeOutput; error?: string } {
  const session = sessions.get(orderId);
  if (!session) return { ok: false, error: 'Order not found' };
  if (!session.escrowId) return { ok: false, error: 'No escrow to dispute' };
  if (session.escrowState !== 'held' && session.escrowState !== 'frozen') {
    return { ok: false, error: `Escrow is ${session.escrowState}, cannot open dispute` };
  }

  // Freeze escrow first
  if (session.escrowState === 'held') {
    const freeze = freezeFunds({
      escrowId: session.escrowId,
      reason,
      frozenBy: 'buyer',
    });
    if (!freeze.ok) {
      return { ok: false, error: freeze.errorDetail ?? 'Freeze failed' };
    }
    session.escrowState = 'frozen';
  }

  const dispute = openDispute({
    orderId,
    escrowId: session.escrowId,
    raisedBy: 'buyer',
    reason,
    creditId: session.creditId,
  });

  if (!dispute.ok || !dispute.data) {
    return { ok: false, error: dispute.errorDetail ?? dispute.error ?? 'Dispute failed' };
  }

  session.disputeId = dispute.data.disputeId;
  session.disputeState = 'open';
  return { ok: true, data: dispute.data };
}

export function submitDisputeEvidence(
  orderId: string,
  description: string,
  attachmentNames: string[],
): { ok: boolean; data?: SubmitEvidenceOutput; error?: string } {
  const session = sessions.get(orderId);
  if (!session?.disputeId) return { ok: false, error: 'No open dispute' };

  const result = submitEvidence({
    disputeId: session.disputeId,
    submittedBy: 'buyer',
    description,
    attachments: attachmentNames,
  });

  if (!result.ok || !result.data) {
    return { ok: false, error: result.errorDetail ?? result.error ?? 'Evidence submit failed' };
  }

  session.disputeState = result.data.state;
  return { ok: true, data: result.data };
}

export function resolveDisputeForOrder(
  orderId: string,
  outcome: 'buyer_wins' | 'seller_wins',
): { ok: boolean; refundData?: RefundBuyerOutput; error?: string } {
  const session = sessions.get(orderId);
  if (!session?.escrowId) return { ok: false, error: 'No escrow' };

  if (outcome === 'buyer_wins') {
    const result = refundBuyer({
      escrowId: session.escrowId,
      reason: 'Dispute resolved in buyer favour (demonstration)',
    });
    if (!result.ok || !result.data) {
      return { ok: false, error: result.errorDetail ?? 'Refund failed' };
    }
    session.escrowState = 'refunded';
    session.disputeState = 'resolved';
    return { ok: true, refundData: result.data };
  } else {
    const result = releaseFunds({
      escrowId: session.escrowId,
      retirementCertificateId: 'dispute-resolved-no-cert',
      sellerWallet: 'demo-seller-wallet',
    });
    if (!result.ok) return { ok: false, error: result.errorDetail ?? 'Release failed' };
    session.escrowState = 'released';
    session.disputeState = 'resolved';
    return { ok: true };
  }
}

/** List all sessions — for the seller/developer dashboard demo */
export function listAllOrders(): OrderSession[] {
  return Array.from(sessions.values());
}
