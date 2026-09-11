/**
 * Exception-message → HTTP response mapping for the atomic RPCs in
 * supabase/migrations/006_phase1_atomic_operations.sql.
 *
 * Those functions signal business failures with `RAISE EXCEPTION ... USING
 * ERRCODE = 'P0001'` and a stable message, either a bare `CODE` or
 * `CODE:<detail>`. PostgREST surfaces the message on `error.message`. The
 * helpers here turn it back into exactly the status codes and response bodies
 * the routes returned when the checks still ran in TypeScript, so moving the
 * work into the database did not change the API.
 *
 * Kept pure and free of Supabase imports so the mapping can be unit-tested
 * without a database. `null` means "not one of ours" and the caller should fall
 * through to its generic 500 rather than leak a raw Postgres message.
 */

export interface RpcException {
  /** The part before the first colon, e.g. `INSUFFICIENT_CREDITS`. */
  code: string;
  /** The part after the first colon, or null when the message carries none. */
  detail: string | null;
}

export interface MappedRpcError {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Split a raised message into its code and optional detail.
 *
 * Splits on the FIRST colon only, so a detail that itself contains a colon
 * survives intact. Returns null for an absent or blank message.
 */
export function parseRpcException(message: string | null | undefined): RpcException | null {
  if (typeof message !== 'string') return null;

  const trimmed = message.trim();
  if (trimmed === '') return null;

  const separator = trimmed.indexOf(':');
  if (separator === -1) return { code: trimmed, detail: null };

  const code = trimmed.slice(0, separator).trim();
  const detail = trimmed.slice(separator + 1).trim();

  return { code, detail: detail === '' ? null : detail };
}

/** The detail as a finite number, or null when it is absent or not numeric. */
function numericDetail(detail: string | null): number | null {
  if (detail === null) return null;
  const value = Number(detail);
  return Number.isFinite(value) ? value : null;
}

/**
 * Map a `reserve_credits` failure.
 *
 * `requested` is echoed back in the insufficient-credits body exactly as the
 * pre-RPC route did; the available figure comes from the message, because the
 * route no longer reads the listing itself.
 */
export function reserveCreditsError(
  message: string | null | undefined,
  ctx: { requested: number },
): MappedRpcError | null {
  const parsed = parseRpcException(message);
  if (!parsed) return null;

  if (parsed.code === 'LISTING_NOT_FOUND') {
    return { status: 404, body: { error: 'Listing not found or not active' } };
  }

  if (parsed.code === 'INSUFFICIENT_CREDITS') {
    const available = numericDetail(parsed.detail);
    return {
      status: 409,
      body: {
        error: 'Insufficient available credits',
        ...(available === null ? {} : { available }),
        requested: ctx.requested,
      },
    };
  }

  return null;
}

/** Map a `create_retirement_certificate` failure. */
export function retirementError(message: string | null | undefined): MappedRpcError | null {
  const parsed = parseRpcException(message);
  if (!parsed) return null;

  if (parsed.code === 'ORDER_NOT_FOUND') {
    return { status: 404, body: { error: 'Order not found, not completed, or not yours' } };
  }

  if (parsed.code === 'ALREADY_RETIRED') {
    const alreadyRetired = numericDetail(parsed.detail);
    return {
      status: 409,
      body: {
        error: 'All credits from this order already retired',
        ...(alreadyRetired === null ? {} : { already_retired: alreadyRetired }),
      },
    };
  }

  if (parsed.code === 'EXCEEDS_REMAINING') {
    const remaining = numericDetail(parsed.detail);
    return {
      status: 409,
      body: {
        error:
          remaining === null
            ? 'Not enough credits remaining to retire'
            : `Only ${remaining} tCO₂e remaining to retire`,
        ...(remaining === null ? {} : { remaining }),
      },
    };
  }

  return null;
}
