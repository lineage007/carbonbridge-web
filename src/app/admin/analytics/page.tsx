'use client';

import { useState } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

const BUYER_ANALYTICS = [
  { company: 'Emirates Industrial Group', orders: 3, volume: 15500, spend: 374100, avgPrice: 24.13, compliance: ['NRCC', 'CBAM'], lastOrder: '22 Mar', retention: 'high' },
  { company: 'Masdar Clean Energy', orders: 4, volume: 18000, spend: 422500, avgPrice: 23.47, compliance: ['NRCC'], lastOrder: '20 Mar', retention: 'high' },
  { company: 'Abu Dhabi Airports', orders: 1, volume: 15000, spend: 192000, avgPrice: 12.80, compliance: ['CORSIA'], lastOrder: '21 Mar', retention: 'new' },
  { company: 'ADNOC', orders: 1, volume: 5000, spend: 162500, avgPrice: 32.50, compliance: ['NRCC', 'CBAM'], lastOrder: '10 Mar', retention: 'at_risk' },
  { company: 'Emirates Steel Arkan', orders: 1, volume: 10000, spend: 128000, avgPrice: 12.80, compliance: ['CBAM'], lastOrder: '18 Mar', retention: 'new' },
  { company: 'Dubai Holding', orders: 1, volume: 8000, spend: 145600, avgPrice: 18.20, compliance: [], lastOrder: '28 Feb', retention: 'at_risk' },
];

const CREDIT_TYPE_DATA = [
  { type: 'REDD+', volume: 35000, value: 448000, avgPrice: 12.80, pct: 33 },
  { type: 'Blue Carbon', volume: 18000, value: 585000, avgPrice: 32.50, pct: 25 },
  { type: 'ARR', volume: 12500, value: 330000, avgPrice: 26.40, pct: 15 },
  { type: 'Soil Carbon', volume: 16000, value: 291200, avgPrice: 18.20, pct: 14 },
  { type: 'Cookstove', volume: 8000, value: 72000, avgPrice: 9.00, pct: 8 },
  { type: 'Biochar', volume: 5000, value: 225000, avgPrice: 45.00, pct: 5 },
];

const FUNNEL = [
  { stage: 'Visitors', count: 2840, pct: 100 },
  { stage: 'Registered', count: 342, pct: 12 },
  { stage: 'Browsed marketplace', count: 218, pct: 7.7 },
  { stage: 'Added to cart / RFQ', count: 67, pct: 2.4 },
  { stage: 'Completed purchase', count: 23, pct: 0.8 },
  { stage: 'Repeat buyer', count: 8, pct: 0.3 },
];

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<'buyers' | 'credits' | 'funnel' | 'geo'>('buyers');

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Analytics</h1>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>Buyer behaviour, credit demand, conversion funnel</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Avg order value', value: '$48,250', trend: '+12%' },
          { label: 'Insurance attach', value: '62%', trend: '+5%' },
          { label: 'Repeat rate', value: '35%', trend: '+8%' },
          { label: 'Days to close', value: '4.2', trend: '-1.3' },
          { label: 'NPS score', value: '72', trend: '+6' },
        ].map(k => (
          <div key={k.label} style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontFamily: mono, fontSize: '20px', fontWeight: 700, color: '#F2ECE0' }}>{k.value}</span>
              <span style={{ fontFamily: mono, fontSize: '11px', color: '#16A34A' }}>{k.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {[{ k: 'buyers', l: 'Buyer Analysis' }, { k: 'credits', l: 'Credit Demand' }, { k: 'funnel', l: 'Conversion Funnel' }, { k: 'geo', l: 'Geography' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} style={{
            fontFamily: bg, fontSize: '12px', fontWeight: tab === t.k ? 600 : 400,
            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === t.k ? 'rgba(201,169,110,0.1)' : 'transparent',
            color: tab === t.k ? '#C9A96E' : '#6B8A74',
          }}>{t.l}</button>
        ))}
      </div>

      {tab === 'buyers' && (
        <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                {['Company', 'Orders', 'Volume (tCO₂e)', 'Total Spend', 'Avg $/t', 'Compliance', 'Last Order', 'Status'].map(h => (
                  <th key={h} style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textAlign: 'left', padding: '10px 12px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUYER_ANALYTICS.map(b => (
                <tr key={b.company} style={{ borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                  <td style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', padding: '12px', fontWeight: 500 }}>{b.company}</td>
                  <td style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92', padding: '12px' }}>{b.orders}</td>
                  <td style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92', padding: '12px' }}>{b.volume.toLocaleString()}</td>
                  <td style={{ fontFamily: mono, fontSize: '12px', color: '#F2ECE0', padding: '12px', fontWeight: 600 }}>{fmt(b.spend)}</td>
                  <td style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92', padding: '12px' }}>${b.avgPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {b.compliance.map(c => (
                        <span key={c} style={{ fontFamily: bg, fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                          background: c === 'CORSIA' ? 'rgba(59,130,246,0.1)' : c === 'CBAM' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: c === 'CORSIA' ? '#3B82F6' : c === 'CBAM' ? '#F59E0B' : '#EF4444',
                        }}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontFamily: bg, fontSize: '12px', color: '#8AAA92', padding: '12px' }}>{b.lastOrder}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                      background: b.retention === 'high' ? 'rgba(22,163,74,0.1)' : b.retention === 'new' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      color: b.retention === 'high' ? '#16A34A' : b.retention === 'new' ? '#3B82F6' : '#F59E0B',
                    }}>{b.retention === 'high' ? 'Repeat buyer' : b.retention === 'new' ? 'New' : 'At risk'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'credits' && (
        <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '20px' }}>Credit Type Demand</div>
          {CREDIT_TYPE_DATA.map(c => (
            <div key={c.type} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 500, color: '#F2ECE0' }}>{c.type}</span>
                <span style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92' }}>{c.volume.toLocaleString()} tCO₂e · {fmt(c.value)} · ${c.avgPrice}/t</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,252,246,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${c.pct * 2.5}%`, height: '100%', background: 'linear-gradient(90deg, #1B3A2D, #2D6A4F)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'funnel' && (
        <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '24px' }}>Conversion Funnel</div>
          {FUNNEL.map((f, i) => (
            <div key={f.stage} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ width: '160px', fontFamily: bg, fontSize: '12px', color: '#8AAA92', textAlign: 'right' }}>{f.stage}</div>
              <div style={{ flex: 1, height: '32px', position: 'relative' }}>
                <div style={{ width: `${Math.max(f.pct, 3)}%`, height: '100%', background: `rgba(45,106,79,${0.2 + (1 - i / FUNNEL.length) * 0.6})`, borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                  <span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 600, color: '#F2ECE0' }}>{f.count.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ width: '50px', fontFamily: mono, fontSize: '11px', color: '#6B8A74' }}>{f.pct}%</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'geo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '16px' }}>Buyer Geography</div>
            {[
              { country: '🇦🇪 UAE', pct: 68, buyers: 12 },
              { country: '🇸🇦 Saudi Arabia', pct: 14, buyers: 3 },
              { country: '🇶🇦 Qatar', pct: 8, buyers: 2 },
              { country: '🇸🇬 Singapore', pct: 6, buyers: 1 },
              { country: '🇦🇺 Australia', pct: 4, buyers: 1 },
            ].map(g => (
              <div key={g.country} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', width: '120px' }}>{g.country}</span>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,252,246,0.04)', borderRadius: '3px' }}>
                  <div style={{ width: `${g.pct}%`, height: '100%', background: '#C9A96E', borderRadius: '3px' }} />
                </div>
                <span style={{ fontFamily: mono, fontSize: '11px', color: '#6B8A74', width: '60px', textAlign: 'right' }}>{g.pct}% ({g.buyers})</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '16px' }}>Credit Origin</div>
            {[
              { country: '🇦🇺 Australia', pct: 35, projects: 8 },
              { country: '🇮🇩 Indonesia', pct: 22, projects: 4 },
              { country: '🇦🇪 UAE', pct: 18, projects: 3 },
              { country: '🇧🇷 Brazil', pct: 12, projects: 2 },
              { country: '🇰🇪 Kenya', pct: 8, projects: 2 },
              { country: '🇮🇳 India', pct: 5, projects: 1 },
            ].map(g => (
              <div key={g.country} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', width: '120px' }}>{g.country}</span>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,252,246,0.04)', borderRadius: '3px' }}>
                  <div style={{ width: `${g.pct}%`, height: '100%', background: '#2D6A4F', borderRadius: '3px' }} />
                </div>
                <span style={{ fontFamily: mono, fontSize: '11px', color: '#6B8A74', width: '80px', textAlign: 'right' }}>{g.pct}% ({g.projects})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
