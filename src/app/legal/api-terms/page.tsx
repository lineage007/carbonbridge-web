import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'API Terms of Use' };
const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', sans-serif";
export default function Page() {
  return (
    <>
      <h1 style={ { fontFamily: fr, fontSize: '32px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' } }>API Terms of Use</h1>
      <p style={ { fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '32px' } }>Last updated: March 2026 · Effective from platform launch</p>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8, marginBottom: '32px' } }>Terms governing use of the CarbonBridge Retirement API.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>1. API Access</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>API access is available to registered CarbonBridge accounts. API keys are issued on request and subject to approval.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>2. Rate Limits</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Sandbox: 100 requests/minute. Production: 1,000 requests/minute. Higher limits available on request.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>3. Billing</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>API usage is billed monthly in arrears. Invoices are issued on the 1st of each month for the previous month's usage. Payment terms: Net 30.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>4. Acceptable Use</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>You agree not to: (a) share API keys, (b) exceed rate limits intentionally, (c) use the API for any purpose other than carbon credit retirement, (d) scrape or republish market data.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>5. SLA</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We target 99.9% uptime for production API endpoints. Planned maintenance windows are communicated 48 hours in advance.</p>
    </>
  );
}
