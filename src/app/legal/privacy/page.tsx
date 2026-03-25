import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Policy' };
const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', sans-serif";
export default function Page() {
  return (
    <>
      <h1 style={ { fontFamily: fr, fontSize: '32px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' } }>Privacy Policy</h1>
      <p style={ { fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '32px' } }>Last updated: March 2026 · Effective from platform launch</p>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8, marginBottom: '32px' } }>This Privacy Policy explains how CarbonBridge collects, uses, and protects your personal information.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>1. Information We Collect</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We collect: (a) account information (name, email, company, role), (b) transaction data (purchases, sales, retirements), (c) usage data (pages visited, features used), (d) communications (support tickets, emails).</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>2. How We Use Information</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We use your information to: (a) provide and improve the platform, (b) process transactions, (c) send transactional emails, (d) comply with legal obligations, (e) prevent fraud.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>3. Data Sharing</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We share data with: (a) payment processors (Stripe) for transaction processing, (b) insurance underwriters for policy administration, (c) carbon registries for credit verification, (d) law enforcement when required by law.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>4. Data Retention</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We retain account data for 7 years after account closure to comply with financial record-keeping requirements. Transaction records are retained indefinitely for audit purposes.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>5. Your Rights</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>You have the right to: (a) access your data, (b) correct inaccurate data, (c) request deletion (subject to legal retention requirements), (d) export your data in machine-readable format.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>6. Security</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest (AES-256), role-based access controls, and regular security audits.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>7. Contact</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>For privacy inquiries, contact privacy@carbonbridge.ae.</p>
    </>
  );
}
