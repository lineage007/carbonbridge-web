import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Insurance Terms' };
const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', sans-serif";
export default function Page() {
  return (
    <>
      <h1 style={ { fontFamily: fr, fontSize: '32px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' } }>Insurance Terms</h1>
      <p style={ { fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '32px' } }>Last updated: March 2026 · Effective from platform launch</p>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8, marginBottom: '32px' } }>Terms and conditions for carbon credit insurance products offered through the CarbonBridge platform.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>1. Insurance Provider</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Insurance products on CarbonBridge are underwritten by licensed insurance providers including Kita Earth and CFC Underwriting (Lloyd's syndicates). CarbonBridge acts as an appointed representative, not an insurer.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>2. Available Products</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Non-Delivery Cover: Protects against seller failure to transfer credits within the agreed timeframe. | Invalidation Cover: Protects against post-issuance credit invalidation by the registry. | Political Risk Cover: Protects against government actions that invalidate or restrict credit transfers. | CORSIA Guarantee: Comprehensive cover for aviation compliance credits.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>3. Claims Process</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Submit claims through your dashboard or email claims@carbonbridge.ae. Claims are reviewed within 5 business days and routed to the relevant underwriter for assessment.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>4. Exclusions</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Insurance does not cover: (a) voluntary credit cancellation by the buyer, (b) market price changes, (c) regulatory changes that do not directly invalidate specific credits.</p>
    </>
  );
}
