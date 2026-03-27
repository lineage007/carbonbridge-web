const fr = "'Fraunces', Georgia, serif";

export const metadata = { title: 'Cookie Policy | CarbonBridge' };

export default function cookiesPage() {
  return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>cookies</h1>
      <p style={{ fontSize: '13px', color: '#8A7E70', marginBottom: '32px' }}>Last updated: March 2026 · CarbonBridge Ltd, Abu Dhabi Global Market</p>
      
      <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '20px 24px', marginBottom: '32px', fontSize: '14px', color: '#6B6259' }}>
        <strong style={{ color: '#1A1714' }}>Note:</strong> This page contains placeholder legal text. Final legal terms will be drafted by ADGM-qualified legal counsel before platform launch. The structure and sections below represent the topics that will be covered.
      </div>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1B3A2D', marginBottom: '12px' }}>1. Introduction</h2>
        <p>CarbonBridge Ltd (&ldquo;CarbonBridge,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates a carbon credit marketplace platform accessible at carbonbridge.ae. These terms govern your use of the platform.</p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1B3A2D', marginBottom: '12px' }}>2. Definitions</h2>
        <p>[Legal definitions to be provided by counsel — Platform, User, Buyer, Seller, Credit, Transaction, Purchase Agreement, etc.]</p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1B3A2D', marginBottom: '12px' }}>3. Governing Law</h2>
        <p>These terms are governed by the laws of the Abu Dhabi Global Market (ADGM). Any disputes shall be resolved in the ADGM Courts.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1B3A2D', marginBottom: '12px' }}>4. Contact</h2>
        <p>For questions about these terms, contact: <a href="mailto:legal@carbonbridge.ae" style={{ color: '#C9A96E' }}>legal@carbonbridge.ae</a></p>
      </section>
    </div>
  );
}
