import { describe, it, expect, beforeEach } from 'vitest';
import {
  openDispute,
  submitEvidence,
  resolveDispute,
  appealDispute,
  _stubClear,
  _stubGetRecord,
} from '../dispute';

beforeEach(() => {
  _stubClear();
});

describe('openDispute', () => {
  it('returns ok:true and state open on valid input', () => {
    const result = openDispute({
      orderId: 'order-1',
      escrowId: 'escrow-1',
      raisedBy: 'buyer',
      reason: 'Seller failed to deliver credits within agreed timeframe',
      creditId: 'cb-au-arr-001',
    });
    expect(result.ok).toBe(true);
    expect(result.data?.state).toBe('open');
    expect(result.data?.mode).toBe('stub');
    expect(result.data?.disputeId).toMatch(/^dispute-/);
  });

  it('returns ok:false when reason is too short', () => {
    const result = openDispute({
      orderId: 'order-1',
      escrowId: 'escrow-1',
      raisedBy: 'buyer',
      reason: 'Short',
      creditId: 'cb-au-arr-001',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('DISPUTE_OPEN_FAILED');
  });
});

describe('submitEvidence', () => {
  it('transitions open → evidence_submitted on evidence submission', () => {
    const open = openDispute({
      orderId: 'order-2',
      escrowId: 'escrow-2',
      raisedBy: 'buyer',
      reason: 'Seller provided incorrect vintage credits for the delivery',
      creditId: 'cb-ae-blue-001',
    });
    expect(open.ok).toBe(true);
    const disputeId = open.data!.disputeId;

    const evidence = submitEvidence({
      disputeId,
      submittedBy: 'buyer',
      description: 'Attached registry screenshot shows vintage 2023 instead of contracted 2025',
      attachments: ['registry_screenshot.png', 'purchase_agreement.pdf'],
    });
    expect(evidence.ok).toBe(true);
    expect(evidence.data?.state).toBe('evidence_submitted');
    expect(evidence.data?.mode).toBe('stub');
    expect(evidence.data?.evidenceId).toMatch(/^ev-/);

    const record = _stubGetRecord(disputeId);
    expect(record?.evidence).toHaveLength(1);
    expect(record?.evidence[0].attachments).toContain('registry_screenshot.png');
  });

  it('returns DISPUTE_NOT_FOUND for unknown dispute', () => {
    const result = submitEvidence({
      disputeId: 'nonexistent',
      submittedBy: 'buyer',
      description: 'Evidence for nonexistent dispute',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('DISPUTE_NOT_FOUND');
  });

  it('returns ALREADY_RESOLVED when dispute is resolved', () => {
    const open = openDispute({
      orderId: 'order-3',
      escrowId: 'escrow-3',
      raisedBy: 'seller',
      reason: 'Buyer has not confirmed receipt of credits after 30 days',
      creditId: 'cb-au-bio-001',
    });
    const disputeId = open.data!.disputeId;

    resolveDispute({ disputeId, resolvedBy: 'admin-1', outcome: 'seller_wins', notes: 'Registry confirms credits delivered' });

    const evidence = submitEvidence({
      disputeId,
      submittedBy: 'buyer',
      description: 'Late evidence submission',
    });
    expect(evidence.ok).toBe(false);
    expect(evidence.error).toBe('ALREADY_RESOLVED');
  });
});

describe('resolveDispute', () => {
  it('transitions open → resolved with buyer_wins outcome', () => {
    const open = openDispute({
      orderId: 'order-4',
      escrowId: 'escrow-4',
      raisedBy: 'buyer',
      reason: 'Seller failed to respond to delivery confirmation requests',
      creditId: 'cb-au-soil-001',
    });
    const disputeId = open.data!.disputeId;

    const resolve = resolveDispute({
      disputeId,
      resolvedBy: 'admin-007',
      outcome: 'buyer_wins',
      notes: 'Seller did not provide proof of registry transfer within review period',
    });
    expect(resolve.ok).toBe(true);
    expect(resolve.data?.state).toBe('resolved');
    expect(resolve.data?.outcome).toBe('buyer_wins');
    expect(resolve.data?.mode).toBe('stub');

    const record = _stubGetRecord(disputeId);
    expect(record?.state).toBe('resolved');
    expect(record?.outcome).toBe('buyer_wins');
    expect(record?.resolvedBy).toBe('admin-007');
  });

  it('transitions evidence_submitted → resolved', () => {
    const open = openDispute({
      orderId: 'order-5',
      escrowId: 'escrow-5',
      raisedBy: 'buyer',
      reason: 'Credits delivered do not match methodology specifications',
      creditId: 'cb-au-arr-001',
    });
    const disputeId = open.data!.disputeId;
    submitEvidence({ disputeId, submittedBy: 'buyer', description: 'VVB audit report attached' });

    const resolve = resolveDispute({
      disputeId,
      resolvedBy: 'admin-008',
      outcome: 'seller_wins',
      notes: 'Credits comply with VCS methodology — buyer claim not supported by evidence',
    });
    expect(resolve.ok).toBe(true);
    expect(resolve.data?.outcome).toBe('seller_wins');
  });

  it('blocks double-resolution', () => {
    const open = openDispute({
      orderId: 'order-6',
      escrowId: 'escrow-6',
      raisedBy: 'buyer',
      reason: 'Ongoing non-delivery after 60-day window has elapsed',
      creditId: 'cb-au-arr-001',
    });
    const disputeId = open.data!.disputeId;
    resolveDispute({ disputeId, resolvedBy: 'admin-1', outcome: 'buyer_wins', notes: 'First resolution' });

    const second = resolveDispute({
      disputeId,
      resolvedBy: 'admin-2',
      outcome: 'seller_wins',
      notes: 'Attempt to re-resolve',
    });
    expect(second.ok).toBe(false);
    expect(second.error).toBe('INVALID_STATE_TRANSITION');
  });

  it('handles split outcome with splitBuyerPct', () => {
    const open = openDispute({
      orderId: 'order-7',
      escrowId: 'escrow-7',
      raisedBy: 'buyer',
      reason: 'Partial delivery received — only 70% of contracted volume transferred',
      creditId: 'cb-ae-blue-001',
    });
    const disputeId = open.data!.disputeId;

    const resolve = resolveDispute({
      disputeId,
      resolvedBy: 'admin-009',
      outcome: 'split',
      notes: 'Partial delivery confirmed — 70% to buyer, 30% to seller',
      splitBuyerPct: 70,
    });
    expect(resolve.ok).toBe(true);
    expect(resolve.data?.outcome).toBe('split');

    const record = _stubGetRecord(disputeId);
    expect(record?.splitBuyerPct).toBe(70);
  });
});

describe('appealDispute', () => {
  it('transitions resolved → appealed', () => {
    const open = openDispute({
      orderId: 'order-8',
      escrowId: 'escrow-8',
      raisedBy: 'buyer',
      reason: 'Seller misrepresented the vintage year in listing documentation',
      creditId: 'cb-au-bio-001',
    });
    const disputeId = open.data!.disputeId;
    resolveDispute({ disputeId, resolvedBy: 'admin-1', outcome: 'seller_wins', notes: 'Initial resolution' });

    const appeal = appealDispute({
      disputeId,
      appealedBy: 'buyer',
      grounds: 'New evidence has emerged: registry audit confirms vintage discrepancy in original issuance documentation',
    });
    expect(appeal.ok).toBe(true);
    expect(appeal.data?.state).toBe('appealed');
    expect(appeal.data?.mode).toBe('stub');

    const record = _stubGetRecord(disputeId);
    expect(record?.state).toBe('appealed');
    expect(record?.appealedBy).toBe('buyer');
  });

  it('blocks appeal from non-resolved state', () => {
    const open = openDispute({
      orderId: 'order-9',
      escrowId: 'escrow-9',
      raisedBy: 'seller',
      reason: 'Buyer has not accepted delivery confirmation for over 45 days',
      creditId: 'cb-au-soil-001',
    });
    const disputeId = open.data!.disputeId;

    const appeal = appealDispute({
      disputeId,
      appealedBy: 'seller',
      grounds: 'Attempting appeal from open state — should fail',
    });
    expect(appeal.ok).toBe(false);
    expect(appeal.error).toBe('INVALID_STATE_TRANSITION');
  });

  it('returns DISPUTE_NOT_FOUND for unknown dispute ID', () => {
    const result = appealDispute({
      disputeId: 'does-not-exist',
      appealedBy: 'buyer',
      grounds: 'This dispute ID does not exist in the store',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('DISPUTE_NOT_FOUND');
  });
});
