/**
 * Credit reservation contract (Phase 1 alignment — CB-003).
 *
 * Pure request-validation and payload-building logic for
 * POST/DELETE /api/credits/reserve. Every column produced here exists in
 * supabase/migrations (001_initial_schema.sql + 002_fix_order_status_pending_payment.sql).
 *
 * Kept free of Supabase imports so it can be unit-tested without a network.
 */

import { z } from 'zod';
import type { OrderReservationInsert, PaymentMethodValue } from './types';

export const RESERVATION_WINDOW_HOURS = 24;

/**
 * The single payment-method default for the whole reservation → agreement flow
 * (review finding 4). The reserve route and the purchase-agreement builder both
 * read it, so an order created without an explicit payment_method and the
 * agreement rendered for that order can never disagree.
 */
export const DEFAULT_PAYMENT_METHOD: PaymentMethodValue = 'bank_transfer';

/** Days a purchase agreement stays valid, by payment method. */
export const AGREEMENT_VALIDITY_DAYS: Record<PaymentMethodValue, number> = {
  bank_transfer: 5,
  card: 3,
};

export function agreementValidityDays(paymentMethod: PaymentMethodValue): number {
  return AGREEMENT_VALIDITY_DAYS[paymentMethod];
}

export const ReserveRequestSchema = z.object({
  // Postgres `uuid` literal, validated here so a malformed id never reaches
  // PostgREST. Zod's own uuid check replaces the hand-rolled regex.
  listing_id: z.uuid('listing_id must be a uuid'),
  quantity: z.number().int().positive(),
  // orders.payment_method is NOT NULL with check (card|bank_transfer).
  payment_method: z.enum(['card', 'bank_transfer']).default(DEFAULT_PAYMENT_METHOD),
});

export type ReserveRequest = z.infer<typeof ReserveRequestSchema>;

/** The listing columns the reservation flow must read to satisfy orders' NOT NULL columns. */
export interface ReservableListing {
  id: string;
  seller_id: string;
  project_name: string;
  credit_type: string;
  registry: string;
  price_per_tonne: number;
  vintage_year: number | null;
  available_tonnes: number;
  reserved_tonnes: number | null;
}

/**
 * Columns the reservation flow needs from `listings`.
 *
 * The route no longer issues this SELECT itself: public.reserve_credits reads
 * the listing under a row lock instead. The list is kept because it documents,
 * and lets the tests assert, which listing columns the order insert depends on.
 */
export const RESERVABLE_LISTING_COLUMNS =
  'id, seller_id, project_name, credit_type, registry, price_per_tonne, vintage_year, available_tonnes, reserved_tonnes';

export function reservationExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + RESERVATION_WINDOW_HOURS * 60 * 60 * 1000);
}

function toMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Build the `orders` insert payload for a reservation.
 *
 * Populates every NOT NULL column on public.orders: seller_id, listing_id,
 * project_name, credit_type, registry, quantity, unit_price, credit_total,
 * total_amount, payment_method. `order_ref` and `agreement_ref` are filled by
 * database triggers.
 *
 * MIRRORED IN SQL: public.reserve_credits in
 * supabase/migrations/006_phase1_atomic_operations.sql builds the same INSERT.
 * The route calls that function rather than this one, so the reservation is
 * atomic; this stays the readable, unit-tested statement of the column
 * contract. Change the column list or the credit_total rounding in one place
 * and you must change the other.
 */
export function buildReservationOrder(params: {
  buyerId: string;
  listing: ReservableListing;
  quantity: number;
  paymentMethod: PaymentMethodValue;
  expiresAt: Date;
}): OrderReservationInsert {
  const { buyerId, listing, quantity, paymentMethod, expiresAt } = params;
  const creditTotal = toMoney(listing.price_per_tonne * quantity);

  return {
    buyer_id: buyerId,
    seller_id: listing.seller_id,
    listing_id: listing.id,
    project_name: listing.project_name,
    credit_type: listing.credit_type,
    registry: listing.registry,
    vintage_year: listing.vintage_year,
    quantity,
    unit_price: listing.price_per_tonne,
    credit_total: creditTotal,
    // No insurance is selected at reservation time, so total == credit total.
    total_amount: creditTotal,
    payment_method: paymentMethod,
    payment_status: 'pending',
    status: 'pending_payment',
    credits_reserved: true,
    credits_released: false,
    reservation_expires_at: expiresAt.toISOString(),
  };
}

/**
 * New listing counters after reserving `quantity` tonnes.
 *
 * MIRRORED IN SQL: the counter update inside public.reserve_credits
 * (006_phase1_atomic_operations.sql) does the same arithmetic under a row lock.
 */
export function applyReservationToListing(
  listing: Pick<ReservableListing, 'available_tonnes' | 'reserved_tonnes'>,
  quantity: number,
): { available_tonnes: number; reserved_tonnes: number } {
  return {
    available_tonnes: listing.available_tonnes - quantity,
    reserved_tonnes: (listing.reserved_tonnes ?? 0) + quantity,
  };
}

/**
 * New listing counters after releasing an expired reservation of `quantity`
 * tonnes.
 *
 * Only what is actually reserved can be released. Clamping reserved_tonnes at
 * zero while adding the full `quantity` back to available_tonnes invented
 * inventory whenever the two counters had already drifted (say a manual
 * correction, or a release that ran twice): releasing 20 against
 * reserved_tonnes = 5 used to add 20 available and drop 5 reserved. Both sides
 * now move by the same min(), so the pair stays balanced.
 *
 * MIRRORED IN SQL: public.release_expired_reservations
 * (006_phase1_atomic_operations.sql) applies the same LEAST() to both counters
 * while holding the listing row locked. The sweep route calls that function;
 * this remains the unit-tested statement of the arithmetic.
 */
export function releaseReservationFromListing(
  listing: Pick<ReservableListing, 'available_tonnes' | 'reserved_tonnes'>,
  quantity: number,
): { available_tonnes: number; reserved_tonnes: number } {
  const releasable = Math.min(quantity, listing.reserved_tonnes ?? 0);
  return {
    available_tonnes: listing.available_tonnes + releasable,
    reserved_tonnes: (listing.reserved_tonnes ?? 0) - releasable,
  };
}
