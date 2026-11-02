export const RFQ_EMAIL = 'hello@carbonbridge.ae';
export const RFQ_NOTES_MAX = 1000;
// Windows hands a mailto link to the mail app through a limit of about 2,083 characters.
export const RFQ_MAILTO_MAX = 2000;
export const RFQ_NOTES_OMITTED = 'too long for this draft, please paste them from the page you just left';

export interface RfqRequest {
  creditTypes: string[];
  quantity: string;
  priceMin: string;
  priceMax: string;
  delivery: string;
  quality: string;
  notes: string;
}

const DELIVERY_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  '3m': 'Within 3 months',
  '6m': 'Within 6 months',
  flexible: 'Flexible',
};

/** The first thing stopping this request from being useful, or null when it can go. */
export function rfqProblem(request: RfqRequest): string | null {
  if (request.creditTypes.length === 0) return 'Choose at least one credit type.';
  if (!request.quantity.trim()) return 'Enter the quantity you need.';
  return null;
}

function priceLine({ priceMin, priceMax }: RfqRequest): string | null {
  const min = priceMin.trim();
  const max = priceMax.trim();
  if (min && max) return `Target price: ${min} to ${max} USD per tonne`;
  if (min) return `Target price: from ${min} USD per tonne`;
  if (max) return `Target price: up to ${max} USD per tonne`;
  return null;
}

// Splits by code point, so the limit can never cut an emoji in half: a lone
// surrogate makes encodeURIComponent throw.
function clipNotes(notes: string): string {
  return Array.from(notes.trim()).slice(0, RFQ_NOTES_MAX).join('');
}

export function rfqBody(request: RfqRequest): string {
  const notes = clipNotes(request.notes);
  const lines = [
    `Credit types: ${request.creditTypes.join(', ')}`,
    `Quantity: ${request.quantity.trim()} tCO2e`,
    priceLine(request),
    `Delivery timeline: ${DELIVERY_LABELS[request.delivery] ?? request.delivery}`,
    `Minimum quality: ${request.quality === 'any' ? 'Any' : request.quality.toUpperCase()}`,
    notes ? `Notes: ${notes}` : null,
  ];
  return lines.filter((line): line is string => line !== null).join('\n');
}

// A lone surrogate makes encodeURIComponent throw, which would leave the button dead.
const LONE_SURROGATE = new RegExp('\\p{Cs}', 'gu');

function mailto(request: RfqRequest): string {
  const subject = `Request for quote: ${request.quantity.trim()} tCO2e`.replace(LONE_SURROGATE, '\uFFFD');
  // RFC 6068: line breaks in a mailto body are written as CRLF.
  const body = rfqBody(request).replace(LONE_SURROGATE, '\uFFFD').replace(/\r\n|\r|\n/g, '\r\n');
  return `mailto:${RFQ_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** The draft link. Notes that would make it too long stay on the page, which shows them in full. */
export function rfqMailto(request: RfqRequest): string {
  const full = mailto(request);
  return full.length <= RFQ_MAILTO_MAX ? full : mailto({ ...request, notes: RFQ_NOTES_OMITTED });
}
