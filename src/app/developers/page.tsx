'use client';
import Link from 'next/link';
import { useState } from 'react';

const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const ENDPOINTS = [
  { method: 'POST', path: '/api/v1/retire', desc: 'Retire carbon credits on behalf of a customer', auth: 'API Key', billing: 'Per-tonne' },
  { method: 'GET', path: '/api/v1/credits', desc: 'List available credits with filters', auth: 'API Key', billing: 'Free' },
  { method: 'GET', path: '/api/v1/credits/:id', desc: 'Get credit detail including price and availability', auth: 'API Key', billing: 'Free' },
  { method: 'GET', path: '/api/v1/price', desc: 'Get current market price for a credit type', auth: 'API Key', billing: 'Free' },
  { method: 'POST', path: '/api/v1/estimate', desc: 'Estimate cost for retiring N tonnes', auth: 'API Key', billing: 'Free' },
  { method: 'GET', path: '/api/v1/retirements', desc: 'List all retirements for your account', auth: 'API Key', billing: 'Free' },
  { method: 'GET', path: '/api/v1/retirements/:id', desc: 'Get retirement detail + certificate URL', auth: 'API Key', billing: 'Free' },
  { method: 'GET', path: '/api/v1/usage', desc: 'Get current billing period usage', auth: 'API Key', billing: 'Free' },
];

const CODE_EXAMPLE = `// Install: npm install carbonbridge
import { CarbonBridge } from 'carbonbridge';

const cb = new CarbonBridge({ apiKey: 'cb_live_...' });

// Retire credits at checkout
const retirement = await cb.retire({
  tonnes: 0.5,
  creditType: 'ARR',          // optional preference
  minQuality: 'A',            // optional minimum
  metadata: {
    orderId: 'ORD-12345',
    customerEmail: 'buyer@example.com',
  }
});

console.log(retirement);
// {
//   id: 'ret_abc123',
//   tonnes: 0.5,
//   credit: 'Great Southern Forest Restoration',
//   registry: 'Verra VCS-1234',
//   certificateUrl: 'https://carbonbridge.ae/certificates/ret_abc123.pdf',
//   cost: 13.20,
//   billedAt: 'end-of-month'
// }`;

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'authentication' | 'billing'>('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF6' }}>
      {/* Nav */}
      <nav style={{ background: '#0C1C14', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '32px' }} /></Link>
          <span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 600, color: '#C9A96E', background: 'rgba(201,169,110,0.1)', padding: '3px 10px', borderRadius: '4px' }}>API Docs</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/register" style={{ fontFamily: bg, fontSize: '13px', background: '#C9A96E', color: '#0C1C14', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>Get API Key</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: fr, fontSize: '36px', fontWeight: 600, color: '#1A1714', marginBottom: '12px' }}>Retirement API</h1>
          <p style={{ fontFamily: bg, fontSize: '16px', color: '#8B8178', maxWidth: '600px', lineHeight: 1.7 }}>Add carbon offsetting to any transaction. One API call retires real, verified credits and returns a certificate. Billed monthly — no per-call charges, no prepayment.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: '1px solid #E8E2D8' }}>
          {(['overview', 'endpoints', 'authentication', 'billing'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              fontFamily: bg, fontSize: '13px', fontWeight: activeTab === t ? 600 : 400, padding: '10px 16px', border: 'none', cursor: 'pointer',
              color: activeTab === t ? '#1B3A2D' : '#8B8178', background: 'transparent',
              borderBottom: activeTab === t ? '2px solid #1B3A2D' : '2px solid transparent', marginBottom: '-1px',
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: explanation */}
            <div>
              <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>How it works</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { step: '1', title: 'Register & get API keys', desc: 'Sign up as a buyer. Navigate to Settings → API Keys. Get a sandbox key for testing and a live key for production.' },
                  { step: '2', title: 'Call /retire at checkout', desc: 'When your customer completes a purchase, POST to /api/v1/retire with the tonnes to offset. We select the best available credit automatically.' },
                  { step: '3', title: 'We retire the credits', desc: 'CarbonBridge retires real credits on the appropriate registry (Verra, Gold Standard, ACR). A retirement certificate is generated immediately.' },
                  { step: '4', title: 'Monthly invoice', desc: 'At month-end, we invoice you for all retirements. $0.02/tonne platform fee + credit cost. Net-30 payment terms.' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '12px', fontWeight: 700, color: '#C9A96E', flexShrink: 0 }}>{s.step}</div>
                    <div>
                      <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '2px' }}>{s.title}</div>
                      <div style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: code example */}
            <div style={{ background: '#0C1C14', borderRadius: '14px', padding: '20px', overflow: 'auto' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
              </div>
              <pre style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{CODE_EXAMPLE}</pre>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#1B3A2D' }}>
                {['Method', 'Endpoint', 'Description', 'Auth', 'Billing'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
              </tr></thead>
              <tbody>{ENDPOINTS.map((ep, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0EDE6' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: mono, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: ep.method === 'POST' ? 'rgba(22,163,74,0.08)' : 'rgba(37,99,235,0.08)', color: ep.method === 'POST' ? '#16A34A' : '#2563EB' }}>{ep.method}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{ep.path}</td>
                  <td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{ep.desc}</td>
                  <td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{ep.auth}</td>
                  <td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '11px', color: ep.billing === 'Free' ? '#2D6A4F' : '#C9A96E', fontWeight: 600 }}>{ep.billing}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {activeTab === 'authentication' && (
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Authentication</h2>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '20px' }}>All API requests require an API key sent in the <code style={{ fontFamily: mono, fontSize: '12px', background: '#F5F0E8', padding: '2px 6px', borderRadius: '4px' }}>Authorization</code> header.</p>
            <div style={{ background: '#0C1C14', borderRadius: '10px', padding: '16px 20px', fontFamily: mono, fontSize: '13px', color: '#8AAA92', marginBottom: '24px' }}>
              Authorization: Bearer cb_live_your_api_key_here
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { key: 'cb_sandbox_...', env: 'Sandbox', desc: 'For testing. No real credits retired. No charges.' },
                { key: 'cb_live_...', env: 'Production', desc: 'Real credit retirements. Billed monthly.' },
              ].map(k => (
                <div key={k.env} style={{ padding: '16px', border: '1px solid #E8E2D8', borderRadius: '10px', background: '#fff' }}>
                  <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{k.env}</div>
                  <div style={{ fontFamily: mono, fontSize: '12px', color: '#8B8178', marginTop: '4px' }}>{k.key}</div>
                  <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '4px' }}>{k.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Billing Model</h2>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '24px' }}>No per-call charges. No prepayment. You only pay for actual credit retirements, invoiced monthly.</p>
            <div style={{ border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#FAFAF7' }}>
                  {['Component', 'Rate', 'Details'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#8B8178' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F0EDE6' }}><td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>Credit cost</td><td style={{ padding: '10px 14px', fontFamily: mono, fontSize: '13px' }}>Market rate</td><td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>Actual cost of the retired credit</td></tr>
                  <tr style={{ borderBottom: '1px solid #F0EDE6' }}><td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>Platform fee</td><td style={{ padding: '10px 14px', fontFamily: mono, fontSize: '13px' }}>$0.02/tCO₂e</td><td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>CarbonBridge processing fee</td></tr>
                  <tr><td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>Minimum</td><td style={{ padding: '10px 14px', fontFamily: mono, fontSize: '13px' }}>$100/month</td><td style={{ padding: '10px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>Monthly minimum commitment</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
