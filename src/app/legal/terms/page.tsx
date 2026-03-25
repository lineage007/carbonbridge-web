import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Terms of Service' };
const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', sans-serif";
export default function Page() {
  return (
    <>
      <h1 style={ { fontFamily: fr, fontSize: '32px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' } }>Terms of Service</h1>
      <p style={ { fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '32px' } }>Last updated: March 2026 · Effective from platform launch</p>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8, marginBottom: '32px' } }>These Terms of Service govern your use of the CarbonBridge platform.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>1. Acceptance</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>By accessing or using CarbonBridge, you agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>2. Eligibility</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>You must be a registered business entity to use CarbonBridge. Individual consumer accounts are not supported. You must be at least 18 years of age.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>3. Account Registration</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>4. Buyer Obligations</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Buyers agree to: (a) complete payment within the specified settlement window, (b) provide accurate compliance information, (c) not resell credits purchased through the platform without prior written consent.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>5. Seller Obligations</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Sellers agree to: (a) list only credits they have the legal right to transfer, (b) complete credit transfers within the agreed timeframe, (c) maintain valid registry accounts, (d) comply with all applicable environmental regulations.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>6. Platform Fees</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>CarbonBridge charges a transaction fee on completed trades as published on the pricing page. Fees are subject to change with 30 days notice.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>7. Insurance Products</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>Insurance products offered through CarbonBridge are underwritten by third-party insurance providers. CarbonBridge acts as a distribution channel only. Claims are subject to the terms of each insurance policy.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>8. Limitation of Liability</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>CarbonBridge is a marketplace facilitator. We do not guarantee the quality, validity, or permanence of any carbon credit listed on the platform. Our liability is limited to the fees collected on the relevant transaction.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>9. Governing Law</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>These Terms are governed by the laws of the Abu Dhabi Global Market (ADGM), United Arab Emirates.</p>
      <h2 style={ { fontFamily: fr, fontSize: '20px', fontWeight: 600, color: '#1A1714', marginTop: '32px', marginBottom: '8px' } }>10. Contact</h2>
      <p style={ { fontFamily: bg, fontSize: '14px', color: '#6B6259', lineHeight: 1.8 } }>For questions about these Terms, contact legal@carbonbridge.ae.</p>
    </>
  );
}
