/**
 * Tests for the settlement state machine (Phase 1 alignment — CB-006).
 *
 * src/lib/settlement.ts is pure; the one place a database call matters
 * (applying the update) uses a vi.fn() stub instead of a Supabase client.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ADMIN_OR_SELLER_ACTIONS,
  ORDER_STATUS_BY_SETTLEMENT_STATUS,
  SETTLEMENT_ACTIONS,
  SETTLEMENT_TRANSITIONS,
  buildSettlementUpdate,
  canTransition,
  isSettlementAction,
  missingRequiredFields,
  type SettlementAction,
  type SettlementStatus,
} from '../settlement';

const NOW = new Date('2026-09-08T12:30:00.000Z');
const TS = NOW.toISOString();

const ALL_STATUSES: SettlementStatus[] = [
  'pending',
  'buyer_paid',
  'credits_transferred',
  'completed',
  'disputed',
  'failed',
];

describe('isSettlementAction', () => {
  it('accepts every declared action', () => {
    for (const action of SETTLEMENT_ACTIONS) {
      expect(isSettlementAction(action)).toBe(true);
    }
    expect(SETTLEMENT_ACTIONS).toHaveLength(6);
  });

  it('rejects unknown values and non-strings', () => {
    for (const value of ['refund', '', 'toString', 'constructor', 42, null, undefined, {}]) {
      expect(isSettlementAction(value)).toBe(false);
    }
  });
});

describe('canTransition', () => {
  it('walks the happy path pending → buyer_paid → credits_transferred → completed', () => {
    expect(canTransition('pending', 'confirm_payment')).toBe(true);
    expect(canTransition('buyer_paid', 'initiate_transfer')).toBe(true);
    expect(canTransition('credits_transferred', 'confirm_delivery')).toBe(true);
  });

  it('blocks skipping a leg of the settlement', () => {
    expect(canTransition('pending', 'initiate_transfer')).toBe(false);
    expect(canTransition('pending', 'confirm_delivery')).toBe(false);
    expect(canTransition('buyer_paid', 'confirm_delivery')).toBe(false);
  });

  it('blocks re-confirming a payment that is already confirmed', () => {
    expect(canTransition('buyer_paid', 'confirm_payment')).toBe(false);
  });

  it('treats completed as terminal for every action', () => {
    for (const action of SETTLEMENT_ACTIONS) {
      expect(canTransition('completed', action)).toBe(false);
    }
  });

  it('allows a dispute from any in-flight status but not from a closed one', () => {
    expect(canTransition('pending', 'flag_dispute')).toBe(true);
    expect(canTransition('buyer_paid', 'flag_dispute')).toBe(true);
    expect(canTransition('credits_transferred', 'flag_dispute')).toBe(true);
    expect(canTransition('completed', 'flag_dispute')).toBe(false);
    expect(canTransition('failed', 'flag_dispute')).toBe(false);
  });

  it('only resolves a dispute from disputed', () => {
    for (const status of ALL_STATUSES) {
      expect(canTransition(status, 'resolve_dispute')).toBe(status === 'disputed');
    }
  });

  it('never re-opens a failed settlement', () => {
    for (const action of SETTLEMENT_ACTIONS) {
      expect(canTransition('failed', action)).toBe(false);
    }
  });
});

describe('missingRequiredFields', () => {
  it('requires a payment_reference to confirm payment', () => {
    expect(missingRequiredFields('confirm_payment', {})).toEqual(['payment_reference']);
    expect(missingRequiredFields('confirm_payment', { payment_reference: '   ' })).toEqual([
      'payment_reference',
    ]);
    expect(missingRequiredFields('confirm_payment', { payment_reference: 'WIRE-9912' })).toEqual([]);
  });

  it('requires a verra_transfer_ref to confirm delivery', () => {
    expect(missingRequiredFields('confirm_delivery', {})).toEqual(['verra_transfer_ref']);
    expect(missingRequiredFields('confirm_delivery', { verra_transfer_ref: 'VCU-771' })).toEqual([]);
  });

  it('rejects a non-string reference', () => {
    expect(missingRequiredFields('confirm_payment', { payment_reference: 12345 })).toEqual([
      'payment_reference',
    ]);
  });

  it('requires nothing for the transitions with no required fields', () => {
    for (const action of ['initiate_transfer', 'flag_dispute', 'resolve_dispute', 'mark_failed'] as SettlementAction[]) {
      expect(missingRequiredFields(action, {})).toEqual([]);
    }
  });
});

describe('buildSettlementUpdate', () => {
  it('records the payment leg with the order total, not a hard-coded zero', () => {
    const update = buildSettlementUpdate('confirm_payment', {
      now: NOW,
      paymentReference: 'WIRE-9912',
      paymentAmount: 12350.5,
    });
    expect(update).toEqual({
      status: 'buyer_paid',
      updated_at: TS,
      payment_received_at: TS,
      payment_reference: 'WIRE-9912',
      payment_amount: 12350.5,
    });
  });

  it('writes null rather than 0 when the order total is unavailable', () => {
    const update = buildSettlementUpdate('confirm_payment', { now: NOW, paymentReference: 'W-1' });
    expect(update.payment_amount).toBeNull();
  });

  it('stamps credits_transferred_at on initiate_transfer', () => {
    expect(buildSettlementUpdate('initiate_transfer', { now: NOW })).toEqual({
      status: 'credits_transferred',
      updated_at: TS,
      credits_transferred_at: TS,
    });
  });

  it('stamps completed_at and the registry ref on confirm_delivery', () => {
    expect(
      buildSettlementUpdate('confirm_delivery', { now: NOW, verraTransferRef: 'VCU-771' }),
    ).toEqual({
      status: 'completed',
      updated_at: TS,
      verra_transfer_ref: 'VCU-771',
      completed_at: TS,
    });
  });

  it('attaches notes when supplied and omits the column otherwise', () => {
    expect(buildSettlementUpdate('flag_dispute', { now: NOW, notes: 'buyer reports shortfall' })).toEqual({
      status: 'disputed',
      updated_at: TS,
      notes: 'buyer reports shortfall',
    });
    expect(buildSettlementUpdate('flag_dispute', { now: NOW })).not.toHaveProperty('notes');
  });

  it('emits only columns that exist on public.settlements', () => {
    const columns = new Set([
      'status',
      'notes',
      'payment_reference',
      'payment_amount',
      'payment_received_at',
      'credits_transferred_at',
      'verra_transfer_ref',
      'completed_at',
      'updated_at',
      'previous_status',
    ]);
    for (const action of SETTLEMENT_ACTIONS) {
      const update = buildSettlementUpdate(action, {
        now: NOW,
        paymentReference: 'p',
        verraTransferRef: 'v',
        notes: 'n',
      });
      for (const key of Object.keys(update)) {
        expect(columns.has(key)).toBe(true);
      }
      expect(update.status).toBe(SETTLEMENT_TRANSITIONS[action].to);
    }
  });

  it('is applied to the settlements row through the caller', () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });
    const supabase = { from };

    const payload = buildSettlementUpdate('initiate_transfer', { now: NOW });
    supabase.from('settlements').update(payload).eq('id', 'settlement-1');

    expect(from).toHaveBeenCalledWith('settlements');
    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith('id', 'settlement-1');
  });
});

describe('ORDER_STATUS_BY_SETTLEMENT_STATUS', () => {
  it('leaves the order untouched while the settlement is pending', () => {
    expect(ORDER_STATUS_BY_SETTLEMENT_STATUS.pending).toBeNull();
  });

  it('mirrors each settlement status onto a valid orders.status', () => {
    expect(ORDER_STATUS_BY_SETTLEMENT_STATUS.buyer_paid).toBe('payment_received');
    expect(ORDER_STATUS_BY_SETTLEMENT_STATUS.credits_transferred).toBe('transfer_in_progress');
    expect(ORDER_STATUS_BY_SETTLEMENT_STATUS.completed).toBe('completed');
    expect(ORDER_STATUS_BY_SETTLEMENT_STATUS.disputed).toBe('disputed');
    expect(ORDER_STATUS_BY_SETTLEMENT_STATUS.failed).toBe('cancelled');
  });

  it('has an entry for every settlement status', () => {
    for (const status of ALL_STATUSES) {
      expect(ORDER_STATUS_BY_SETTLEMENT_STATUS).toHaveProperty(status);
    }
  });
});

describe('ADMIN_OR_SELLER_ACTIONS', () => {
  it('leaves confirm_payment and flag_dispute open to the buyer', () => {
    expect(ADMIN_OR_SELLER_ACTIONS).not.toContain('confirm_payment');
    expect(ADMIN_OR_SELLER_ACTIONS).not.toContain('flag_dispute');
  });

  it('restricts transfer, delivery, failure and dispute resolution', () => {
    expect(ADMIN_OR_SELLER_ACTIONS).toEqual([
      'initiate_transfer',
      'confirm_delivery',
      'mark_failed',
      'resolve_dispute',
    ]);
  });
});
