import { describe, it, expect, beforeEach } from 'vitest';
import {
  holdFunds,
  releaseFunds,
  refundBuyer,
  freezeFunds,
  _stubClear,
  _stubGetRecord,
} from '../escrow';

beforeEach(() => {
  _stubClear();
});

describe('holdFunds', () => {
  it('returns ok:true and state held on valid input', () => {
    const result = holdFunds({
      orderId: 'order-1',
      buyerWallet: 'wallet-abc',
      amountUsd: 500,
      creditId: 'cb-au-arr-001',
    });
    expect(result.ok).toBe(true);
    expect(result.data?.state).toBe('held');
    expect(result.data?.mode).toBe('stub');
    expect(result.data?.escrowId).toMatch(/^escrow-/);
  });

  it('returns ok:false when amountUsd is zero', () => {
    const result = holdFunds({
      orderId: 'order-1',
      buyerWallet: 'wallet-abc',
      amountUsd: 0,
      creditId: 'cb-au-arr-001',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('HOLD_FAILED');
  });
});

describe('hold → release', () => {
  it('transitions held → released on valid retirement certificate', () => {
    const hold = holdFunds({
      orderId: 'order-2',
      buyerWallet: 'wallet-xyz',
      amountUsd: 1200,
      creditId: 'cb-ae-blue-001',
    });
    expect(hold.ok).toBe(true);
    const escrowId = hold.data!.escrowId;

    const release = releaseFunds({
      escrowId,
      retirementCertificateId: 'cert-001',
      sellerWallet: 'seller-wallet-1',
    });
    expect(release.ok).toBe(true);
    expect(release.data?.state).toBe('released');
    expect(release.data?.mode).toBe('stub');
    expect(release.data?.transferRef).toMatch(/^txfr-/);

    const record = _stubGetRecord(escrowId);
    expect(record?.state).toBe('released');
    expect(record?.retirementCertificateId).toBe('cert-001');
  });

  it('blocks release when escrow is already released', () => {
    const hold = holdFunds({
      orderId: 'order-3',
      buyerWallet: 'wallet-xyz',
      amountUsd: 100,
      creditId: 'cb-au-bio-001',
    });
    const escrowId = hold.data!.escrowId;
    releaseFunds({ escrowId, retirementCertificateId: 'cert-002', sellerWallet: 'sw-1' });

    const second = releaseFunds({
      escrowId,
      retirementCertificateId: 'cert-003',
      sellerWallet: 'sw-1',
    });
    expect(second.ok).toBe(false);
    expect(second.error).toBe('INVALID_STATE_TRANSITION');
  });
});

describe('hold → dispute (freeze) → resolve (refund)', () => {
  it('transitions held → frozen → refunded', () => {
    const hold = holdFunds({
      orderId: 'order-4',
      buyerWallet: 'wallet-dispute',
      amountUsd: 800,
      creditId: 'cb-au-arr-001',
    });
    const escrowId = hold.data!.escrowId;

    const freeze = freezeFunds({
      escrowId,
      reason: 'Seller did not deliver credits',
      frozenBy: 'buyer',
    });
    expect(freeze.ok).toBe(true);
    expect(freeze.data?.state).toBe('frozen');

    const refund = refundBuyer({
      escrowId,
      reason: 'Dispute resolved: seller failed to deliver',
    });
    expect(refund.ok).toBe(true);
    expect(refund.data?.state).toBe('refunded');
    expect(refund.data?.refundRef).toMatch(/^rfnd-/);

    const record = _stubGetRecord(escrowId);
    expect(record?.state).toBe('refunded');
  });

  it('blocks freeze on already-released escrow', () => {
    const hold = holdFunds({
      orderId: 'order-5',
      buyerWallet: 'w',
      amountUsd: 50,
      creditId: 'cb-x',
    });
    const escrowId = hold.data!.escrowId;
    releaseFunds({ escrowId, retirementCertificateId: 'c', sellerWallet: 's' });

    const freeze = freezeFunds({
      escrowId,
      reason: 'too late',
      frozenBy: 'admin',
    });
    expect(freeze.ok).toBe(false);
    expect(freeze.error).toBe('INVALID_STATE_TRANSITION');
  });
});

describe('escrow not found', () => {
  it('returns ESCROW_NOT_FOUND for unknown escrow ID', () => {
    const result = releaseFunds({
      escrowId: 'nonexistent',
      retirementCertificateId: 'cert-x',
      sellerWallet: 'sw',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ESCROW_NOT_FOUND');
  });
});

describe('refundBuyer', () => {
  it('transitions held → refunded directly', () => {
    const hold = holdFunds({
      orderId: 'order-6',
      buyerWallet: 'w',
      amountUsd: 200,
      creditId: 'cb-y',
    });
    const escrowId = hold.data!.escrowId;

    const refund = refundBuyer({ escrowId, reason: 'Seller withdrew listing' });
    expect(refund.ok).toBe(true);
    expect(refund.data?.state).toBe('refunded');
  });
});
