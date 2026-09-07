/**
 * API usage logging contract (Phase 1 alignment — CB-005).
 *
 * public.api_offset_logs (001_initial_schema.sql) has no `endpoint`, `method`
 * or `status_code` column, and requires `co2_tonnes` and `billing_period`.
 * These helpers build a payload that matches the real table; the HTTP context
 * goes into the existing `metadata` jsonb column.
 */

import type { ApiOffsetLogInsert } from './types';

/**
 * api_offset_logs.billing_period is `text` in the form `2026-03` (UTC month).
 */
export function billingPeriod(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Guard for values interpolated into a PostgREST `.or()` filter string.
 *
 * API keys are minted as `cb_<env>_<32 hex>` (see db.ts generateApiKey), so
 * restricting to word characters and dashes cannot reject a real key while
 * blocking the commas, dots and parentheses that would let a crafted header
 * rewrite the filter expression.
 */
export function isWellFormedApiKey(key: unknown): key is string {
  return typeof key === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(key);
}

export interface ApiOffsetLogContext {
  clientId: string;
  /** Tonnes of CO2e the call accounts for. api_offset_logs.co2_tonnes is NOT NULL. */
  co2Tonnes: number;
  endpoint: string;
  method: string;
  statusCode: number;
  creditTypeAllocated?: string | null;
  estimatedCost?: number | null;
  externalRef?: string | null;
  at?: Date;
}

export function buildApiOffsetLog(ctx: ApiOffsetLogContext): ApiOffsetLogInsert {
  return {
    client_id: ctx.clientId,
    co2_tonnes: ctx.co2Tonnes,
    credit_type_allocated: ctx.creditTypeAllocated ?? null,
    estimated_cost: ctx.estimatedCost ?? null,
    billing_period: billingPeriod(ctx.at ?? new Date()),
    status: 'logged',
    external_ref: ctx.externalRef ?? null,
    metadata: {
      endpoint: ctx.endpoint,
      method: ctx.method,
      status_code: ctx.statusCode,
    },
  };
}

/**
 * Retirement certificate reference: `CB-RET-<base36 timestamp>-<credit id tail>`.
 * Stored in retirement_certificates.certificate_ref (unique).
 */
export function buildCertificateRef(creditId: string, at: Date = new Date()): string {
  const tail = creditId.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase() || 'UNKNOWN';
  return `CB-RET-${at.getTime().toString(36).toUpperCase()}-${tail}`;
}
