import { describe, expect, it } from 'vitest';
import {
  parseRpcException,
  reserveCreditsError,
  retirementError,
} from '../rpc-errors';

// The messages asserted here are the ones raised by
// supabase/migrations/006_phase1_atomic_operations.sql. They are an API
// contract: rewording a RAISE EXCEPTION there without changing this file turns
// a 404/409 into a 500.

describe('parseRpcException', () => {
  it('reads a bare code with no detail', () => {
    expect(parseRpcException('LISTING_NOT_FOUND')).toEqual({
      code: 'LISTING_NOT_FOUND',
      detail: null,
    });
  });

  it('splits a code from its detail', () => {
    expect(parseRpcException('INSUFFICIENT_CREDITS:120')).toEqual({
      code: 'INSUFFICIENT_CREDITS',
      detail: '120',
    });
  });

  it('splits on the first colon only, so a detail may contain colons', () => {
    expect(parseRpcException('SOME_CODE:a:b:c')).toEqual({
      code: 'SOME_CODE',
      detail: 'a:b:c',
    });
  });

  it('treats an empty detail as absent', () => {
    expect(parseRpcException('ALREADY_RETIRED:')).toEqual({
      code: 'ALREADY_RETIRED',
      detail: null,
    });
  });

  it('trims surrounding whitespace on both parts', () => {
    expect(parseRpcException('  EXCEEDS_REMAINING : 40  ')).toEqual({
      code: 'EXCEEDS_REMAINING',
      detail: '40',
    });
  });

  it('returns null for a missing, blank or non-string message', () => {
    expect(parseRpcException(null)).toBeNull();
    expect(parseRpcException(undefined)).toBeNull();
    expect(parseRpcException('')).toBeNull();
    expect(parseRpcException('   ')).toBeNull();
  });
});

describe('reserveCreditsError', () => {
  it('maps LISTING_NOT_FOUND to the route 404', () => {
    expect(reserveCreditsError('LISTING_NOT_FOUND', { requested: 10 })).toEqual({
      status: 404,
      body: { error: 'Listing not found or not active' },
    });
  });

  it('maps INSUFFICIENT_CREDITS to a 409 carrying available and requested', () => {
    expect(reserveCreditsError('INSUFFICIENT_CREDITS:7', { requested: 25 })).toEqual({
      status: 409,
      body: {
        error: 'Insufficient available credits',
        available: 7,
        requested: 25,
      },
    });
  });

  it('keeps an available of 0, which is the common case', () => {
    const mapped = reserveCreditsError('INSUFFICIENT_CREDITS:0', { requested: 5 });
    expect(mapped?.body.available).toBe(0);
  });

  it('omits available when the detail is missing or not numeric', () => {
    expect(reserveCreditsError('INSUFFICIENT_CREDITS', { requested: 5 })).toEqual({
      status: 409,
      body: { error: 'Insufficient available credits', requested: 5 },
    });
    expect(reserveCreditsError('INSUFFICIENT_CREDITS:many', { requested: 5 })).toEqual({
      status: 409,
      body: { error: 'Insufficient available credits', requested: 5 },
    });
  });

  it('returns null for an unrelated database error so the route answers 500', () => {
    expect(reserveCreditsError('deadlock detected', { requested: 5 })).toBeNull();
    expect(reserveCreditsError(null, { requested: 5 })).toBeNull();
    expect(reserveCreditsError('ORDER_NOT_FOUND', { requested: 5 })).toBeNull();
  });
});

describe('retirementError', () => {
  it('maps ORDER_NOT_FOUND to the route 404', () => {
    expect(retirementError('ORDER_NOT_FOUND')).toEqual({
      status: 404,
      body: { error: 'Order not found, not completed, or not yours' },
    });
  });

  it('maps ALREADY_RETIRED to a 409 carrying the retired total', () => {
    expect(retirementError('ALREADY_RETIRED:500')).toEqual({
      status: 409,
      body: {
        error: 'All credits from this order already retired',
        already_retired: 500,
      },
    });
  });

  it('maps EXCEEDS_REMAINING to the same 409 message the route used to build', () => {
    expect(retirementError('EXCEEDS_REMAINING:40')).toEqual({
      status: 409,
      body: { error: 'Only 40 tCO₂e remaining to retire', remaining: 40 },
    });
  });

  it('handles a fractional remaining figure, since tonnes_retired is numeric', () => {
    expect(retirementError('EXCEEDS_REMAINING:12.5')).toEqual({
      status: 409,
      body: { error: 'Only 12.5 tCO₂e remaining to retire', remaining: 12.5 },
    });
  });

  it('falls back to a generic message when EXCEEDS_REMAINING carries no figure', () => {
    expect(retirementError('EXCEEDS_REMAINING')).toEqual({
      status: 409,
      body: { error: 'Not enough credits remaining to retire' },
    });
  });

  it('returns null for an unrelated database error so the route answers 500', () => {
    expect(retirementError('duplicate key value violates unique constraint')).toBeNull();
    expect(retirementError(undefined)).toBeNull();
    expect(retirementError('LISTING_NOT_FOUND')).toBeNull();
  });
});
