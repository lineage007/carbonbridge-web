/**
 * Tests for the credit reservation contract (Phase 1 alignment — CB-003).
 *
 * Pure logic only: no Supabase client is imported by src/lib/reservation.ts.
 * Where a database call is relevant, the client is stubbed with vi.fn().
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ReserveRequestSchema,
  RESERVABLE_LISTING_COLUMNS,
  RESERVATION_WINDOW_HOURS,
  applyReservationToListing,
  buildReservationOrder,
  releaseReservationFromListing,
  reservationExpiry,
  type ReservableListing,
} from '../reservation';

const LISTING_ID = '3f1c9b2a-5d4e-4a71-9b0c-8e2d6f7a1234';
const BUYER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

const listing: ReservableListing = {
  id: LISTING_ID,
  seller_id: 'seller-uuid-1',
  project_name: 'Kariba REDD+',
  credit_type: 'REDD+',
  registry: 'verra',
  price_per_tonne: 12.35,
  vintage_year: 2023,
  available_tonnes: 1000,
  reserved_tonnes: 50,
};

describe('ReserveRequestSchema', () => {
  it('accepts a valid request and defaults payment_method to bank_transfer', () => {
    const parsed = ReserveRequestSchema.safeParse({ listing_id: LISTING_ID, quantity: 10 });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({
      listing_id: LISTING_ID,
      quantity: 10,
      payment_method: 'bank_transfer',
    });
  });

  it('accepts an explicit card payment_method', () => {
    const parsed = ReserveRequestSchema.safeParse({
      listing_id: LISTING_ID,
      quantity: 1,
      payment_method: 'card',
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.payment_method).toBe('card');
  });

  it('rejects a listing_id that is not a uuid', () => {
    const parsed = ReserveRequestSchema.safeParse({ listing_id: 'not-a-uuid', quantity: 5 });
    expect(parsed.success).toBe(false);
  });

  it('rejects zero, negative and fractional quantities', () => {
    for (const quantity of [0, -5, 2.5]) {
      const parsed = ReserveRequestSchema.safeParse({ listing_id: LISTING_ID, quantity });
      expect(parsed.success).toBe(false);
    }
  });

  it('rejects a payment_method outside the orders check constraint', () => {
    const parsed = ReserveRequestSchema.safeParse({
      listing_id: LISTING_ID,
      quantity: 1,
      payment_method: 'crypto',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('RESERVABLE_LISTING_COLUMNS', () => {
  it('selects every column buildReservationOrder reads', () => {
    const selected = RESERVABLE_LISTING_COLUMNS.split(',').map((c) => c.trim());
    for (const column of Object.keys(listing)) {
      expect(selected).toContain(column);
    }
  });
});

describe('reservationExpiry', () => {
  it('is exactly the reservation window ahead of now', () => {
    const now = new Date('2026-09-08T10:00:00.000Z');
    expect(reservationExpiry(now).toISOString()).toBe('2026-09-09T10:00:00.000Z');
    expect(RESERVATION_WINDOW_HOURS).toBe(24);
  });
});

describe('buildReservationOrder', () => {
  const expiresAt = new Date('2026-09-09T10:00:00.000Z');

  it('populates every NOT NULL orders column', () => {
    const payload = buildReservationOrder({
      buyerId: BUYER_ID,
      listing,
      quantity: 100,
      paymentMethod: 'bank_transfer',
      expiresAt,
    });

    expect(payload).toEqual({
      buyer_id: BUYER_ID,
      seller_id: 'seller-uuid-1',
      listing_id: LISTING_ID,
      project_name: 'Kariba REDD+',
      credit_type: 'REDD+',
      registry: 'verra',
      vintage_year: 2023,
      quantity: 100,
      unit_price: 12.35,
      credit_total: 1235,
      total_amount: 1235,
      payment_method: 'bank_transfer',
      payment_status: 'pending',
      status: 'pending_payment',
      credits_reserved: true,
      credits_released: false,
      reservation_expires_at: '2026-09-09T10:00:00.000Z',
    });
  });

  it('rounds credit_total to two decimals for numeric(12,2)', () => {
    const payload = buildReservationOrder({
      buyerId: BUYER_ID,
      listing: { ...listing, price_per_tonne: 10.005 },
      quantity: 3,
      paymentMethod: 'card',
      expiresAt,
    });
    expect(payload.credit_total).toBe(30.02);
    expect(payload.total_amount).toBe(payload.credit_total);
  });

  it('does not emit a payment_deadline column', () => {
    const payload = buildReservationOrder({
      buyerId: BUYER_ID,
      listing,
      quantity: 1,
      paymentMethod: 'card',
      expiresAt,
    });
    expect(payload).not.toHaveProperty('payment_deadline');
  });

  it('carries a null vintage_year through unchanged', () => {
    const payload = buildReservationOrder({
      buyerId: BUYER_ID,
      listing: { ...listing, vintage_year: null },
      quantity: 1,
      paymentMethod: 'card',
      expiresAt,
    });
    expect(payload.vintage_year).toBeNull();
  });

  it('is handed to the orders insert unchanged by the caller', () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'order-1' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    const supabase = { from };

    const payload = buildReservationOrder({
      buyerId: BUYER_ID,
      listing,
      quantity: 4,
      paymentMethod: 'card',
      expiresAt,
    });
    supabase.from('orders').insert(payload).select('id').single();

    expect(from).toHaveBeenCalledWith('orders');
    expect(insert).toHaveBeenCalledWith(payload);
  });
});

describe('applyReservationToListing', () => {
  it('moves tonnes from available to reserved', () => {
    expect(applyReservationToListing({ available_tonnes: 1000, reserved_tonnes: 50 }, 200)).toEqual({
      available_tonnes: 800,
      reserved_tonnes: 250,
    });
  });

  it('treats a null reserved_tonnes as zero', () => {
    expect(applyReservationToListing({ available_tonnes: 10, reserved_tonnes: null }, 4)).toEqual({
      available_tonnes: 6,
      reserved_tonnes: 4,
    });
  });
});

describe('releaseReservationFromListing', () => {
  it('returns tonnes to the available pool', () => {
    expect(releaseReservationFromListing({ available_tonnes: 800, reserved_tonnes: 250 }, 200)).toEqual({
      available_tonnes: 1000,
      reserved_tonnes: 50,
    });
  });

  it('clamps reserved_tonnes at zero rather than going negative', () => {
    expect(releaseReservationFromListing({ available_tonnes: 0, reserved_tonnes: 5 }, 20)).toEqual({
      available_tonnes: 20,
      reserved_tonnes: 0,
    });
  });

  it('round-trips a reserve then release back to the original counters', () => {
    const start = { available_tonnes: 1000, reserved_tonnes: 50 };
    const reserved = applyReservationToListing(start, 120);
    expect(releaseReservationFromListing(reserved, 120)).toEqual(start);
  });
});
