/**
 * demo-session.test.ts
 *
 * Tests for the Phase 2 demo-session module.
 * Verifies that the session layer correctly orchestrates
 * escrow and dispute state machine calls.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOrder,
  getOrder,
  placeInEscrow,
  retireCredits,
  openDisputeForOrder,
  submitDisputeEvidence,
  resolveDisputeForOrder,
  listAllOrders,
} from '../demo-session';
import { _stubClear as escrowClear } from '../escrow';
import { _stubClear as disputeClear } from '../dispute';

function clearAll() {
  escrowClear();
  disputeClear();
}

// There's no session-level clear exposed — create fresh orders by unique params.
// (Module-level Map persists across tests in the same file, so we key by unique orderId.)

describe('createOrder + getOrder', () => {
  it('creates a session and retrieves it by orderId', () => {
    const session = createOrder({
      creditId: 'cb-au-arr-001',
      creditName: 'Great Southern Forest Restoration',
      quantity: 500,
      pricePerTonne: 26.40,
      totalUsd: 13200,
      buyerName: 'Alice Smith',
      buyerEmail: 'alice@example.com',
      buyerCompany: 'Acme Carbon Co',
    });

    expect(session.orderId).toMatch(/^order-/);
    expect(session.escrowMode).toBe('stub');
    expect(session.escrowState).toBeUndefined();

    const retrieved = getOrder(session.orderId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.creditId).toBe('cb-au-arr-001');
    expect(retrieved?.quantity).toBe(500);
  });
});

describe('placeInEscrow', () => {
  beforeEach(() => { clearAll(); });

  it('transitions session to escrowState held', () => {
    const session = createOrder({
      creditId: 'cb-ae-blue-001',
      creditName: 'Abu Dhabi Blue Carbon',
      quantity: 1000,
      pricePerTonne: 32.50,
      totalUsd: 32500,
      buyerName: 'Bob Jones',
      buyerEmail: 'bob@corp.ae',
      buyerCompany: 'Gulf Energy Corp',
    });

    const result = placeInEscrow(session.orderId);
    expect(result.ok).toBe(true);
    expect(result.data?.state).toBe('held');
    expect(result.data?.mode).toBe('stub');

    const updated = getOrder(session.orderId);
    expect(updated?.escrowState).toBe('held');
    expect(updated?.escrowId).toMatch(/^escrow-/);
  });

  it('returns error for unknown orderId', () => {
    const result = placeInEscrow('nonexistent-order');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Order not found');
  });
});

describe('retireCredits', () => {
  beforeEach(() => { clearAll(); });

  it('transitions held → released and returns certRef', () => {
    const session = createOrder({
      creditId: 'cb-au-bio-001',
      creditName: 'Queensland Biochar Sequestration',
      quantity: 200,
      pricePerTonne: 142.00,
      totalUsd: 28400,
      buyerName: 'Carol Chen',
      buyerEmail: 'carol@greenco.com',
      buyerCompany: 'Green Horizons Ltd',
    });

    placeInEscrow(session.orderId);
    const result = retireCredits(session.orderId, 'Green Horizons Ltd');

    expect(result.ok).toBe(true);
    expect(result.certRef).toMatch(/^CB-RET-DEMO-/);
    expect(result.releaseData?.state).toBe('released');
    expect(result.releaseData?.mode).toBe('stub');

    const updated = getOrder(session.orderId);
    expect(updated?.escrowState).toBe('released');
    expect(updated?.retirementStatus).toBe('demonstration_complete');
  });

  it('fails when escrow is not held', () => {
    const session = createOrder({
      creditId: 'cb-au-soil-001',
      creditName: 'Queensland Soil Carbon Initiative',
      quantity: 100,
      pricePerTonne: 18.20,
      totalUsd: 1820,
      buyerName: 'Dan Park',
      buyerEmail: 'd@example.com',
      buyerCompany: 'Park Holdings',
    });
    // Escrow never placed
    const result = retireCredits(session.orderId, 'Park Holdings');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Escrow not held');
  });
});

describe('openDisputeForOrder', () => {
  beforeEach(() => { clearAll(); });

  it('opens dispute, freezes escrow, sets disputeId on session', () => {
    const session = createOrder({
      creditId: 'cb-au-arr-001',
      creditName: 'Great Southern Forest Restoration',
      quantity: 750,
      pricePerTonne: 26.40,
      totalUsd: 19800,
      buyerName: 'Eve Martinez',
      buyerEmail: 'eve@fund.com',
      buyerCompany: 'Atlas Carbon Fund',
    });

    placeInEscrow(session.orderId);
    const result = openDisputeForOrder(session.orderId, 'Seller did not deliver credits within the 30-day window specified in the purchase agreement');

    expect(result.ok).toBe(true);
    expect(result.data?.state).toBe('open');
    expect(result.data?.mode).toBe('stub');

    const updated = getOrder(session.orderId);
    expect(updated?.escrowState).toBe('frozen');
    expect(updated?.disputeId).toMatch(/^dispute-/);
    expect(updated?.disputeState).toBe('open');
  });
});

describe('submitDisputeEvidence', () => {
  beforeEach(() => { clearAll(); });

  it('submits evidence and updates dispute state', () => {
    const session = createOrder({
      creditId: 'cb-ae-blue-001',
      creditName: 'Abu Dhabi Blue Carbon',
      quantity: 300,
      pricePerTonne: 32.50,
      totalUsd: 9750,
      buyerName: 'Frank Lee',
      buyerEmail: 'frank@inc.ae',
      buyerCompany: 'MENA Carbon Inc',
    });

    placeInEscrow(session.orderId);
    openDisputeForOrder(session.orderId, 'Credits transferred to wrong registry account, seller unresponsive');

    const result = submitDisputeEvidence(
      session.orderId,
      'Registry confirmation email showing incorrect account transfer',
      ['registry_email.pdf'],
    );

    expect(result.ok).toBe(true);
    expect(result.data?.state).toBe('evidence_submitted');

    const updated = getOrder(session.orderId);
    expect(updated?.disputeState).toBe('evidence_submitted');
  });
});

describe('resolveDisputeForOrder', () => {
  beforeEach(() => { clearAll(); });

  it('buyer_wins: transitions escrow to refunded', () => {
    const session = createOrder({
      creditId: 'cb-au-arr-001',
      creditName: 'Great Southern Forest Restoration',
      quantity: 400,
      pricePerTonne: 26.40,
      totalUsd: 10560,
      buyerName: 'Grace Kim',
      buyerEmail: 'grace@corp.com',
      buyerCompany: 'Seoul Carbon Corp',
    });

    placeInEscrow(session.orderId);
    openDisputeForOrder(session.orderId, 'Non-delivery after 60 days and multiple follow-up attempts failed');

    const result = resolveDisputeForOrder(session.orderId, 'buyer_wins');
    expect(result.ok).toBe(true);
    expect(result.refundData?.state).toBe('refunded');

    const updated = getOrder(session.orderId);
    expect(updated?.escrowState).toBe('refunded');
    expect(updated?.disputeState).toBe('resolved');
  });

  it('seller_wins: transitions escrow to released', () => {
    const session = createOrder({
      creditId: 'cb-au-soil-001',
      creditName: 'Queensland Soil Carbon Initiative',
      quantity: 600,
      pricePerTonne: 18.20,
      totalUsd: 10920,
      buyerName: 'Hiro Tanaka',
      buyerEmail: 'hiro@jp.com',
      buyerCompany: 'Tanaka Holdings',
    });

    placeInEscrow(session.orderId);
    openDisputeForOrder(session.orderId, 'Buyer claims non-delivery but registry shows transfer completed correctly');

    const result = resolveDisputeForOrder(session.orderId, 'seller_wins');
    expect(result.ok).toBe(true);

    const updated = getOrder(session.orderId);
    expect(updated?.escrowState).toBe('released');
    expect(updated?.disputeState).toBe('resolved');
  });
});

describe('listAllOrders', () => {
  it('returns all sessions created in this test file', () => {
    const all = listAllOrders();
    // At least the orders created in tests above should be present
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });
});
