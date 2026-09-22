/**
 * Tests for the purchase agreement builder and HTML generator (CB-004).
 *
 * Pure logic: src/lib/purchase-agreement.ts imports no Supabase client.
 */

import { describe, it, expect } from 'vitest';
import {
  buildAgreementDataFromOrder,
  escapeHtml,
  generateAgreementHTML,
  parseInsuranceProducts,
  type AgreementListingSource,
  type AgreementOrderSource,
  type AgreementProfileSource,
} from '../purchase-agreement';

const order: AgreementOrderSource = {
  created_at: '2026-09-08T21:30:00.000Z',
  quantity: 100,
  unit_price: 12.35,
  credit_total: 1235,
  total_amount: 1235,
  payment_method: 'bank_transfer',
  agreement_ref: 'PA-2026-00042',
  agreement_accepted_at: null,
  insurance_products: null,
  insurance_premium_total: null,
  insurance_policy_ref: null,
  verra_serial_numbers: null,
};

const listing: AgreementListingSource = {
  project_name: 'Kariba REDD+',
  project_id_verra: 'VCS-902',
  registry: 'verra',
  methodology: 'VM0009',
  credit_type: 'REDD+',
  vintage_year: 2023,
  quality_rating: 'A',
  corsia_eligible: true,
  cbam_eligible: false,
  nrcc_eligible: false,
  icvcm_ccp_aligned: true,
  is_cb_direct: false,
};

const buyer: AgreementProfileSource = {
  company_name: 'Acme Industries FZE',
  contact_name: 'Dana Rahal',
  email: 'dana@acme.example',
  country: 'AE',
};

const seller: AgreementProfileSource = {
  company_name: 'Green Forests Ltd',
  contact_name: 'Sam Oduya',
  email: 'sam@greenforests.example',
  country: 'KE',
};

function build(overrides: Partial<AgreementOrderSource> = {}) {
  return buildAgreementDataFromOrder({
    order: { ...order, ...overrides },
    listing,
    buyer,
    seller,
  });
}

describe('escapeHtml', () => {
  it('neutralises every character that can break out of a text node or attribute', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('escapes the ampersand first so an entity is not double-decoded', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('renders null and undefined as an empty string rather than the word', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('buildAgreementDataFromOrder', () => {
  it('uses the stored credit_total rather than recomputing quantity x unit_price', () => {
    // 99 x 12.345 = 1222.155, which the order stored as the rounded 1222.16.
    const data = build({ quantity: 99, unit_price: 12.345, credit_total: 1222.16 });
    expect(data.credits.totalPrice).toBe(1222.16);
    expect(data.credits.totalPrice).not.toBe(99 * 12.345);
  });

  it('formats the agreement date in UTC, not the runner timezone', () => {
    // 21:30Z on the 8th is already the 9th in Asia/Dubai (UTC+4).
    expect(build().date).toBe('8 September 2026');
    expect(build({ created_at: '2026-01-01T00:30:00.000Z' }).date).toBe('1 January 2026');
  });
});

describe('parseInsuranceProducts', () => {
  const rows = [
    { type: 'non_delivery', premium: 40, premium_rate: 0.02, provider: 'kita' },
    { type: 'invalidation', premium: 25, premium_rate: 0.01, provider: 'cfc' },
  ];

  it('uses a stored total of 0 instead of summing the product rows', () => {
    // A waived or fully discounted premium is stored as 0. Recomputing it from
    // the rows would show charges the order never had.
    expect(parseInsuranceProducts(rows, 0).totalPremium).toBe(0);
  });

  it('uses any other stored total verbatim', () => {
    expect(parseInsuranceProducts(rows, 55).totalPremium).toBe(55);
  });

  it('falls back to the product sum only when the stored total is null or absent', () => {
    expect(parseInsuranceProducts(rows, null).totalPremium).toBe(65);
    expect(parseInsuranceProducts(rows).totalPremium).toBe(65);
  });
});

describe('generateAgreementHTML', () => {
  it('renders a script tag in a company name escaped, not as markup', () => {
    const html = generateAgreementHTML(
      buildAgreementDataFromOrder({
        order,
        listing,
        buyer: { ...buyer, company_name: '<script>alert("xss")</script>' },
        seller,
      }),
    );

    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('escapes seller fields, project names and emails too', () => {
    const html = generateAgreementHTML(
      buildAgreementDataFromOrder({
        order,
        listing: { ...listing, project_name: '<img src=x onerror=alert(1)>' },
        buyer: { ...buyer, email: 'a@b.example"><script>1</script>' },
        seller: { ...seller, company_name: '<b>Not Bold</b>' },
      }),
    );

    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<b>Not Bold</b>');
    expect(html).not.toContain('"><script>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;b&gt;Not Bold&lt;/b&gt;');
  });

  it('leaves the document structure intact for ordinary values', () => {
    const html = generateAgreementHTML(build());
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('Acme Industries FZE');
    expect(html).toContain('Green Forests Ltd');
    expect(html).toContain('PA-2026-00042');
  });

  it('shows the stored credit total in the price table', () => {
    const html = generateAgreementHTML(
      build({ quantity: 99, unit_price: 12.345, credit_total: 1222.16 }),
    );
    expect(html).toContain('1,222.16');
  });
});
