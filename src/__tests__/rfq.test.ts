import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RFQ_EMAIL, RFQ_MAILTO_MAX, RFQ_NOTES_MAX, RFQ_NOTES_OMITTED, rfqBody, rfqMailto, rfqProblem, type RfqRequest } from '../app/rfq/rfq-email';

const request: RfqRequest = {
  creditTypes: ['ARR', 'REDD+'],
  quantity: '25,000',
  priceMin: '',
  priceMax: '',
  delivery: 'flexible',
  quality: 'bbb',
  notes: '',
};

const decoded = (url: string) => {
  const parsed = new URL(url);
  return { to: parsed.pathname, subject: parsed.searchParams.get('subject'), body: parsed.searchParams.get('body') };
};

describe('rfqProblem', () => {
  it('asks for a credit type first', () => {
    expect(rfqProblem({ ...request, creditTypes: [] })).toBe('Choose at least one credit type.');
  });
  it('asks for a quantity, and spaces do not count', () => {
    expect(rfqProblem({ ...request, quantity: '   ' })).toBe('Enter the quantity you need.');
  });
  it('lets a complete request through', () => {
    expect(rfqProblem(request)).toBeNull();
  });
});

describe('rfqBody', () => {
  it('leaves out what the buyer left empty', () => {
    expect(rfqBody(request)).toBe(
      'Credit types: ARR, REDD+\nQuantity: 25,000 tCO2e\nDelivery timeline: Flexible\nMinimum quality: BBB',
    );
  });
  it.each([
    [{ priceMin: '5', priceMax: '9' }, 'Target price: 5 to 9 USD per tonne'],
    [{ priceMin: '5', priceMax: '' }, 'Target price: from 5 USD per tonne'],
    [{ priceMin: '', priceMax: '9' }, 'Target price: up to 9 USD per tonne'],
  ])('words the price range %#', (prices, line) => {
    expect(rfqBody({ ...request, ...prices })).toContain(line);
  });
  it('names the delivery option and writes Any as a word', () => {
    const body = rfqBody({ ...request, delivery: '3m', quality: 'any' });
    expect(body).toContain('Delivery timeline: Within 3 months');
    expect(body).toContain('Minimum quality: Any');
  });
  it('keeps notes to the limit by whole characters', () => {
    const body = rfqBody({ ...request, notes: '😀'.repeat(RFQ_NOTES_MAX + 5) });
    const notes = body.slice(body.indexOf('Notes: ') + 'Notes: '.length);
    expect(Array.from(notes)).toHaveLength(RFQ_NOTES_MAX);
  });
});

describe('rfqMailto', () => {
  it('addresses the published mailbox with the request in the body', () => {
    const { to, subject, body } = decoded(rfqMailto(request));
    expect(to).toBe(RFQ_EMAIL);
    expect(subject).toBe('Request for quote: 25,000 tCO2e');
    expect(body).toContain('Credit types: ARR, REDD+');
  });
  it('survives characters that would break a URL or add a mail header', () => {
    const url = rfqMailto({ ...request, quantity: '10&cc=x@example.com', notes: 'a&b=c?d#e\r\nBcc: x@example.com' });
    expect(url).not.toContain('&cc=');
    expect(url.split('?')[1].split('&').map(part => part.split('=')[0])).toEqual(['subject', 'body']);
    expect(decoded(url).body).toContain('a&b=c?d#e');
  });
  it('writes line breaks as CRLF', () => {
    expect(rfqMailto(request)).toContain('%0D%0A');
    expect(rfqMailto(request).replace(/%0D%0A/g, '')).not.toContain('%0A');
  });
  it('turns any line ending into a single CRLF', () => {
    const url = rfqMailto({ ...request, notes: 'a\r\nb\rc\nd' });
    expect(url).toContain('a%0D%0Ab%0D%0Ac%0D%0Ad');
  });
  it('stays under the mail handoff limit, keeping the notes on the page', () => {
    const long = { ...request, notes: 'شهادات'.repeat(150) };
    const url = rfqMailto(long);
    expect(rfqMailto(request).length).toBeLessThan(RFQ_MAILTO_MAX);
    expect(url.length).toBeLessThanOrEqual(RFQ_MAILTO_MAX);
    expect(decoded(url).body).toContain(RFQ_NOTES_OMITTED);
    expect(rfqBody(long)).toContain('شهادات');
  });
  it.each([
    ['notes', { notes: 'ok \uD83D' }],
    ['quantity', { quantity: '10\uDE00' }],
  ])('does not throw on a lone surrogate in %s', (_, broken) => {
    expect(() => rfqMailto({ ...request, ...broken })).not.toThrow();
  });
  it('does not throw on a note at the limit that ends in an emoji', () => {
    expect(() => rfqMailto({ ...request, notes: 'a'.repeat(RFQ_NOTES_MAX - 1) + '😀😀' })).not.toThrow();
  });
});

describe('/rfq page', () => {
  const page = readFileSync(join(process.cwd(), 'src/app/rfq/page.tsx'), 'utf8');

  it.each(['sent to matching sellers', 'within 48 hours', 'verified sellers', 'RFQ submitted', 'Submit RFQ'])(
    'no longer says "%s"',
    text => {
      expect(page).not.toContain(text);
    },
  );
  it('sends the buyer to the email draft and says what is still to do', () => {
    expect(page).toContain('rfqMailto(form)');
    expect(page).toContain('only when you press send');
  });
});
