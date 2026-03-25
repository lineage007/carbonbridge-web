import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Cookie Policy' };
const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', sans-serif";
export default function Page() {
  return (
    <>
      <h1 style={ { fontFamily: fr, fontSize: '32px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' } }>Cookie Policy</h1>
      <p style={ { fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '32px' } }>Last updated: March 2026 · Effective from platform launch</p>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8, marginBottom: '32px' } }>This Cookie Policy explains how CarbonBridge uses cookies and similar technologies.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>1. Essential Cookies</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Required for platform functionality: authentication tokens, session management, CSRF protection. Cannot be disabled.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>2. Analytics Cookies</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We use privacy-respecting analytics (Plausible or similar) to understand how the platform is used. No personal data is tracked.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>3. Managing Cookies</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>You can manage cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.</p>
    </>
  );
}
