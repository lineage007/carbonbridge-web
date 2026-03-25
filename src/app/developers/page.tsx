'use client';

import { useState } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const ENDPOINTS = [
  { method: 'POST', path: '/api/v1/estimate', desc: 'Estimate CO₂ and offset cost for an activity', returns: 'estimated_co2_tonnes, offset_cost_usd, credit_type, price_per_tonne' },
  { method: 'POST', path: '/api/v1/offset', desc: 'Log a carbon offset request', returns: 'transaction_id, co2_logged_tonnes, status, certificate_available' },
  { method: 'GET', path: '/api/v1/certificate/{id}', desc: 'Retrieve a retirement certificate', returns: 'Certificate details or PDF redirect' },
  { method: 'GET', path: '/api/v1/portfolio', desc: 'Client total offsets, spend, history', returns: 'total_co2_retired, total_spend, transactions[]' },
  { method: 'GET', path: '/api/v1/prices', desc: 'Current credit prices by type', returns: 'credit_types[] with price_per_tonne' },
];

const USE_CASES = [
  { icon: '✈️', title: 'Airline Booking', desc: 'Add "Offset your flight" at checkout. Calculate CO₂ from route distance, offer as optional add-on.', code: `fetch('https://api.carbonbridge.ae/v1/estimate', {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer cb_live_xxx' },\n  body: JSON.stringify({\n    activity: 'flight',\n    origin: 'DXB', destination: 'LHR',\n    passengers: 1, class: 'economy'\n  })\n})` },
  { icon: '🏨', title: 'Hotel Reservation', desc: 'Offset per-night carbon footprint. One API call per booking, monthly invoicing.', code: `fetch('https://api.carbonbridge.ae/v1/offset', {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer cb_live_xxx' },\n  body: JSON.stringify({\n    co2_tonnes: 0.042,\n    credit_type: 'blue_carbon',\n    external_ref: 'booking-12345'\n  })\n})` },
  { icon: '🛒', title: 'E-commerce', desc: 'Carbon-neutral shipping. Calculate per-package emissions, offset at checkout.', code: `// Estimate shipping carbon\nconst est = await cb.estimate({\n  activity: 'shipping',\n  weight_kg: 2.5,\n  origin: 'AUH', destination: 'SYD'\n});\n// Returns: { co2: 0.008, cost: 0.21 }` },
];

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  POST: { bg: 'rgba(22,163,74,0.1)', text: '#16A34A' },
  GET: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
};

export default function DevelopersPage() {
  const [tab, setTab] = useState<'overview' | 'reference' | 'pricing'>('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#0C1C14' }}>
      {/* Header */}
      <header style={{ background: '#0C1C14', borderBottom: '1px solid rgba(201,169,110,0.06)', padding: '16px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px' }} /></Link>
            <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', padding: '2px 8px', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '4px' }}>DEVELOPERS</span>
          </div>
          <Link href="/register" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none' }}>Get API keys</Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 40px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '40px', fontWeight: 600, color: '#F2ECE0', marginBottom: '12px' }}>Retirement API</h1>
        <p style={{ fontFamily: bg, fontSize: '18px', color: '#8AAA92', maxWidth: '640px', lineHeight: 1.6 }}>
          Embed carbon offsetting into any product. Point-of-sale offset logging, monthly retirement, branded certificates.
        </p>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B8A74', marginTop: '12px' }}>
          Base URL: <code style={{ fontFamily: mono, fontSize: '13px', color: '#C9A96E', background: 'rgba(201,169,110,0.08)', padding: '2px 8px', borderRadius: '4px' }}>https://api.carbonbridge.ae/v1</code>
        </p>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(201,169,110,0.08)', marginBottom: '40px' }}>
          {(['overview', 'reference', 'pricing'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: bg, fontSize: '13px', fontWeight: tab === t ? 600 : 400,
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              color: tab === t ? '#C9A96E' : '#6B8A74',
              background: 'transparent',
              borderBottom: tab === t ? '2px solid #C9A96E' : '2px solid transparent',
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ paddingBottom: '80px' }}>
            {/* How it works */}
            <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '32px', marginBottom: '40px' }}>
              <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '20px' }}>How it works</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                {[
                  { step: '1', title: 'Integrate', desc: 'Add our REST API to your checkout or booking flow. One endpoint to log offsets.' },
                  { step: '2', title: 'Log offsets', desc: 'Each customer action calls /offset. We record the CO₂ in real-time. You show confirmation instantly.' },
                  { step: '3', title: 'Monthly invoice', desc: 'On the 1st, we tally your usage. Net 14 payment terms. No prepaid accounts.' },
                  { step: '4', title: 'We retire', desc: 'After payment, we retire credits on Verra and send you a branded monthly certificate.' },
                ].map(s => (
                  <div key={s.step}>
                    <div style={{ fontFamily: fr, fontSize: '28px', fontWeight: 300, color: '#C9A96E', opacity: 0.5, marginBottom: '8px' }}>{s.step}</div>
                    <h3 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#F2ECE0', marginBottom: '6px' }}>{s.title}</h3>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Use cases */}
            <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '20px' }}>Use cases</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {USE_CASES.map(uc => (
                <div key={uc.title} style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{uc.icon}</div>
                    <h3 style={{ fontFamily: bg, fontSize: '16px', fontWeight: 600, color: '#F2ECE0', marginBottom: '6px' }}>{uc.title}</h3>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92', lineHeight: 1.6 }}>{uc.desc}</p>
                  </div>
                  <div style={{ flex: '1 1 400px', background: '#060A08', borderRadius: '10px', padding: '16px', overflow: 'auto' }}>
                    <pre style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92', margin: 0, whiteSpace: 'pre-wrap' }}>{uc.code}</pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Sandbox */}
            <div style={{ background: 'linear-gradient(135deg, rgba(27,58,45,0.3), rgba(201,169,110,0.05))', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '8px' }}>Ready to integrate?</h2>
              <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', marginBottom: '20px' }}>Create an account, generate sandbox keys, and make your first test call in under 5 minutes.</p>
              <Link href="/register" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block' }}>
                Get API keys →
              </Link>
            </div>
          </div>
        )}

        {tab === 'reference' && (
          <div style={{ paddingBottom: '80px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '8px' }}>API Reference</h2>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', marginBottom: '28px' }}>
              Authentication: <code style={{ fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>Authorization: Bearer cb_live_xxxx</code> · Sandbox keys: <code style={{ fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>cb_test_xxxx</code>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ENDPOINTS.map(ep => {
                const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
                return (
                  <div key={ep.path} style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '12px', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: mono, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', background: mc.bg, color: mc.text }}>{ep.method}</span>
                      <code style={{ fontFamily: mono, fontSize: '14px', color: '#F2ECE0' }}>{ep.path}</code>
                    </div>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92', marginBottom: '8px' }}>{ep.desc}</p>
                    <div style={{ fontFamily: mono, fontSize: '11px', color: '#6B8A74' }}>Returns: {ep.returns}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div style={{ paddingBottom: '80px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '20px' }}>API Pricing</h2>
            <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {[
                  { label: 'Per-call fee', value: '$0.05–0.15', note: 'Based on volume tier' },
                  { label: 'Credit cost', value: 'At wholesale', note: '+ 15-25% margin' },
                  { label: 'Monthly minimum', value: '$500/mo', note: 'Usage below → billed at minimum' },
                  { label: 'Billing cycle', value: 'Net 14', note: 'Monthly invoicing, Net 14 terms' },
                ].map(p => (
                  <div key={p.label} style={{ padding: '16px', background: 'rgba(201,169,110,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{p.label}</div>
                    <div style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#F2ECE0', marginBottom: '2px' }}>{p.value}</div>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92' }}>{p.note}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', lineHeight: 1.6 }}>
                The end customer never sees a CarbonBridge charge. You charge your customer however you choose. We invoice you monthly for the total CO₂ logged through your API calls. After payment, we retire credits on Verra and issue your branded monthly certificate.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
