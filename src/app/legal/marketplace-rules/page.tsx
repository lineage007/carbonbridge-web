import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Marketplace Rules' };
const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', sans-serif";
export default function Page() {
  return (
    <>
      <h1 style={ { fontFamily: fr, fontSize: '32px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' } }>Marketplace Rules</h1>
      <p style={ { fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '32px' } }>Last updated: March 2026 · Effective from platform launch</p>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8, marginBottom: '32px' } }>Rules and standards for listing and trading carbon credits on CarbonBridge.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>1. Listing Requirements</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>All credits listed must be: (a) issued by a recognised registry (Verra, Gold Standard, ACR, or ACCU Scheme), (b) currently valid and not retired, (c) free of encumbrances, liens, or competing claims, (d) accurately described.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>2. Quality Ratings</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>CarbonBridge assigns independent quality ratings (AAA to C) based on ICVCM Core Carbon Principles. Ratings are advisory and do not constitute financial advice.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>3. Pricing</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Sellers set their own prices. CarbonBridge publishes market benchmarks for reference. Price manipulation or artificial inflation is prohibited.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>4. Settlement</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Payment: within 3 business days via Stripe or bank transfer. Credit transfer: within 5 business days of confirmed payment. Extensions require buyer consent.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>5. Disputes</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Disputes are handled through CarbonBridge's internal resolution process. Either party may escalate to ADGM arbitration if internal resolution fails.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>6. Prohibited Conduct</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Wash trading, market manipulation, listing fraudulent credits, and misrepresenting credit attributes are prohibited and may result in immediate account suspension.</p>
    </>
  );
}
