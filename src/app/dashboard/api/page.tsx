'use client';
import Link from 'next/link';
const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const TITLES: Record<string, { title: string; desc: string; content: string }> = {
  listings: { title: 'My Listings', desc: 'Manage your carbon credit listings on the marketplace.', content: 'seller_verification' },
  orders: { title: 'Orders Received', desc: 'Track and manage orders from buyers for your listed credits.', content: 'seller_verification' },
  forwards: { title: 'Forward Contracts', desc: 'Manage your pre-purchase forward credit contracts.', content: 'empty_forwards' },
  api: { title: 'API Access', desc: 'Manage your CarbonBridge API keys and monitor usage.', content: 'api_keys' },
  settings: { title: 'Account Settings', desc: 'Manage your profile, company details, and preferences.', content: 'settings_form' },
};

const page = 'api';
const info = TITLES[page] || { title: page, desc: '', content: '' };

export default function DashboardSubPage() {
  if (info.content === 'seller_verification') return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{info.title}</h1>
      <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259', marginBottom: '28px' }}>{info.desc}</p>
      <div style={{ background: 'linear-gradient(135deg, #1B3A2D, #2D6A4F)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '8px' }}>Seller Verification Required</h2>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          To list credits for sale or manage orders, your account needs to be verified as a seller. This includes confirming your registry accounts and company details.
        </p>
        <Link href="/dashboard/settings" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}>
          Apply for Seller Verification
        </Link>
      </div>
    </div>
  );

  if (info.content === 'empty_forwards') return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{info.title}</h1>
      <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259', marginBottom: '28px' }}>{info.desc}</p>
      <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1A1714', marginBottom: '8px' }}>No Forward Contracts</h2>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#8A7E70', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
          Forward contracts allow you to lock in pricing for future credit delivery. Submit an RFQ to get started.
        </p>
        <Link href="/rfq" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#fff', background: '#1B3A2D', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}>
          Submit RFQ
        </Link>
      </div>
    </div>
  );

  if (info.content === 'api_keys') return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{info.title}</h1>
      <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259', marginBottom: '28px' }}>{info.desc}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '8px' }}>Sandbox API Key</div>
          <div style={{ fontFamily: mono, fontSize: '13px', color: '#1A1714', background: '#F5F0E8', padding: '10px 14px', borderRadius: '8px', wordBreak: 'break-all' }}>cb_test_sk_••••••••••••••••</div>
          <button style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', fontWeight: 600 }}>Regenerate</button>
        </div>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '8px' }}>Live API Key</div>
          <div style={{ fontFamily: mono, fontSize: '13px', color: '#8A7E70', background: '#F5F0E8', padding: '10px 14px', borderRadius: '8px' }}>Not activated — request access below</div>
          <button style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', fontWeight: 600 }}>Request Live Access</button>
        </div>
      </div>
      <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontFamily: fr, fontSize: '16px', color: '#1A1714', marginBottom: '12px' }}>Usage This Month</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          {[{ label: 'API Calls', val: '0' }, { label: 'Credits Retired', val: '0 tCO₂e' }, { label: 'Revenue', val: '$0.00' }, { label: 'Avg Latency', val: '—' }].map(m => (
            <div key={m.label}><div style={{ fontFamily: bg, fontSize: '11px', color: '#8A7E70' }}>{m.label}</div><div style={{ fontFamily: mono, fontSize: '18px', fontWeight: 700, color: '#1A1714' }}>{m.val}</div></div>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginTop: '16px' }}>Full API documentation available at <Link href="/developers" style={{ color: '#C9A96E' }}>/developers</Link></p>
    </div>
  );

  // Settings
  return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{info.title}</h1>
      <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259', marginBottom: '28px' }}>{info.desc}</p>
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        {[
          { section: 'Company Details', fields: ['Company Name', 'Country', 'Registration Number', 'Contact Person', 'Email'] },
          { section: 'Compliance Profile', fields: ['Compliance Needs (NRCC, CBAM, CORSIA)', 'Estimated Annual Volume', 'Target Sectors'] },
          { section: 'Registry Accounts', fields: ['Verra Account ID', 'Gold Standard Account ID', 'ACR Account ID'] },
          { section: 'Seller Verification', fields: ['Verification Status', 'Submit Documentation'] },
        ].map(s => (
          <div key={s.section} style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ fontFamily: fr, fontSize: '16px', color: '#1A1714', marginBottom: '16px' }}>{s.section}</h3>
            {s.fields.map(f => (
              <div key={f} style={{ marginBottom: '12px' }}>
                <label style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', display: 'block', marginBottom: '4px' }}>{f}</label>
                <input type="text" placeholder={f} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5DED3', fontFamily: bg, fontSize: '14px', background: '#fff', outline: 'none' }} />
              </div>
            ))}
          </div>
        ))}
        <button style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#F2ECE0', background: '#1B3A2D', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
