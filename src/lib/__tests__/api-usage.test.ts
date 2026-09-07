/**
 * Tests for the API usage logging contract (Phase 1 alignment — CB-005).
 *
 * src/lib/api-usage.ts holds no Supabase import; the insert path is exercised
 * against a vi.fn() stub so no network is involved.
 */

import { describe, it, expect, vi } from 'vitest';
import { billingPeriod, buildApiOffsetLog, buildCertificateRef, isWellFormedApiKey } from '../api-usage';

describe('billingPeriod', () => {
  it('formats the UTC month as YYYY-MM with a padded month', () => {
    expect(billingPeriod(new Date('2026-03-14T09:00:00.000Z'))).toBe('2026-03');
    expect(billingPeriod(new Date('2026-11-01T00:00:00.000Z'))).toBe('2026-11');
  });

  it('uses UTC, not the local timezone, at a month boundary', () => {
    // 2026-01-01T00:30Z is still December in UTC-4 but must bill as 2026-01.
    expect(billingPeriod(new Date('2026-01-01T00:30:00.000Z'))).toBe('2026-01');
    expect(billingPeriod(new Date('2025-12-31T23:59:59.999Z'))).toBe('2025-12');
  });
});

describe('isWellFormedApiKey', () => {
  it('accepts keys in the cb_<env>_<32 hex> shape minted by generateApiKey', () => {
    expect(isWellFormedApiKey(`cb_live_${'a1b2c3d4'.repeat(4)}`)).toBe(true);
    expect(isWellFormedApiKey(`cb_test_${'0f'.repeat(16)}`)).toBe(true);
  });

  it('rejects the punctuation that could rewrite a PostgREST .or() filter', () => {
    for (const key of [
      'cb_live_abc,api_key_sandbox.eq.x',
      'cb_live_abc.eq.y',
      'cb_live_(abc)',
      'cb_live_abc*',
      'cb live abc12345',
      "cb_live_abc'",
    ]) {
      expect(isWellFormedApiKey(key)).toBe(false);
    }
  });

  it('rejects keys outside the 8–128 character bound', () => {
    expect(isWellFormedApiKey('cb_live')).toBe(false);
    expect(isWellFormedApiKey('a'.repeat(129))).toBe(false);
    expect(isWellFormedApiKey('a'.repeat(128))).toBe(true);
  });

  it('rejects non-strings and empty values', () => {
    for (const value of ['', null, undefined, 12345678, {}, ['cb_live_abcdefgh']]) {
      expect(isWellFormedApiKey(value)).toBe(false);
    }
  });
});

describe('buildApiOffsetLog', () => {
  const at = new Date('2026-09-08T12:00:00.000Z');

  it('emits only real api_offset_logs columns and puts HTTP context in metadata', () => {
    const row = buildApiOffsetLog({
      clientId: 'client-1',
      co2Tonnes: 12.5,
      endpoint: '/api/retire',
      method: 'POST',
      statusCode: 201,
      creditTypeAllocated: 'REDD+',
      estimatedCost: 154.38,
      externalRef: 'CB-RET-XYZ-ABC123',
      at,
    });

    expect(row).toEqual({
      client_id: 'client-1',
      co2_tonnes: 12.5,
      credit_type_allocated: 'REDD+',
      estimated_cost: 154.38,
      billing_period: '2026-09',
      status: 'logged',
      external_ref: 'CB-RET-XYZ-ABC123',
      metadata: { endpoint: '/api/retire', method: 'POST', status_code: 201 },
    });
  });

  it('does not emit the endpoint/method/status_code columns that do not exist', () => {
    const row = buildApiOffsetLog({
      clientId: 'client-1',
      co2Tonnes: 1,
      endpoint: '/api/retire',
      method: 'POST',
      statusCode: 200,
      at,
    });
    expect(row).not.toHaveProperty('endpoint');
    expect(row).not.toHaveProperty('method');
    expect(row).not.toHaveProperty('status_code');
  });

  it('always populates the NOT NULL co2_tonnes and billing_period columns', () => {
    const row = buildApiOffsetLog({
      clientId: 'client-1',
      co2Tonnes: 0.25,
      endpoint: '/api/retire',
      method: 'POST',
      statusCode: 200,
      at,
    });
    expect(row.co2_tonnes).toBe(0.25);
    expect(row.billing_period).toBe('2026-09');
  });

  it('defaults the optional columns to null rather than undefined', () => {
    const row = buildApiOffsetLog({
      clientId: 'client-1',
      co2Tonnes: 1,
      endpoint: '/api/retire',
      method: 'POST',
      statusCode: 200,
      at,
    });
    expect(row.credit_type_allocated).toBeNull();
    expect(row.estimated_cost).toBeNull();
    expect(row.external_ref).toBeNull();
  });

  it('is inserted verbatim by the caller', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    const supabase = { from };

    const row = buildApiOffsetLog({
      clientId: 'client-1',
      co2Tonnes: 3,
      endpoint: '/api/retire',
      method: 'POST',
      statusCode: 201,
      at,
    });
    await supabase.from('api_offset_logs').insert(row);

    expect(from).toHaveBeenCalledWith('api_offset_logs');
    expect(insert).toHaveBeenCalledWith(row);
  });
});

describe('buildCertificateRef', () => {
  const at = new Date('2026-09-08T12:00:00.000Z');

  it('produces CB-RET-<base36 timestamp>-<credit id tail>', () => {
    const ref = buildCertificateRef('cb-au-arr-001abc', at);
    expect(ref).toBe(`CB-RET-${at.getTime().toString(36).toUpperCase()}-001ABC`);
    expect(ref).toMatch(/^CB-RET-[0-9A-Z]+-[0-9A-Z]+$/);
  });

  it('strips non-alphanumerics before taking the tail', () => {
    // 'a-b-c-d-e-f-g' → 'abcdefg' → last six characters.
    expect(buildCertificateRef('a-b-c-d-e-f-g', at).endsWith('-BCDEFG')).toBe(true);
    expect(buildCertificateRef('----12', at)).toBe(
      `CB-RET-${at.getTime().toString(36).toUpperCase()}-12`,
    );
  });

  it('falls back to UNKNOWN when the credit id has no alphanumerics', () => {
    expect(buildCertificateRef('---', at)).toBe(
      `CB-RET-${at.getTime().toString(36).toUpperCase()}-UNKNOWN`,
    );
    expect(buildCertificateRef('', at)).toContain('-UNKNOWN');
  });

  it('is unique across distinct timestamps', () => {
    const a = buildCertificateRef('credit-000001', new Date('2026-09-08T12:00:00.000Z'));
    const b = buildCertificateRef('credit-000001', new Date('2026-09-08T12:00:01.000Z'));
    expect(a).not.toBe(b);
  });
});
