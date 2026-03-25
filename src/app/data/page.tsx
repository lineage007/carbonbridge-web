'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LISTINGS } from '@/data/credits';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

// ─── Market data (indicative benchmarks) ───────────────────
const PRICE_INDICES = [
  { name: 'CB Nature Index', desc: 'Nature-based credits (ARR, REDD+, IFM, Blue Carbon)', price: 14.80, change: +1.2, sparkline: [12.4, 12.8, 13.1, 13.5, 14.0, 14.3, 14.8] },
  { name: 'CB Tech Removal Index', desc: 'Engineered CDR (Biochar, DACCS, Enhanced Weathering)', price: 96.50, change: -2.1, sparkline: [105.0, 103.2, 101.5, 100.0, 98.8, 97.2, 96.5] },
  { name: 'CB Australia Index', desc: 'Australian-origin credits across all types', price: 22.30, change: +0.8, sparkline: [20.1, 20.5, 21.0, 21.4, 21.8, 22.0, 22.3] },
  { name: 'CB MENA Index', desc: 'Gulf and MENA-origin credits', price: 18.60, change: +3.4, sparkline: [15.8, 16.2, 16.8, 17.2, 17.8, 18.1, 18.6] },
  { name: 'CB CORSIA Eligible', desc: 'Credits eligible for airline compliance', price: 19.40, change: +1.8, sparkline: [17.0, 17.4, 17.9, 18.2, 18.6, 19.0, 19.4] },
];

const MARKET_STATS = [
  { label: 'VCM Total Value (2025)', value: '$1.7B', sub: 'Ecosystem Marketplace' },
  { label: 'Tonnes Retired (2025)', value: '164M', sub: 'Verra + Gold Standard' },
  { label: 'Avg. Nature Credit', value: '$8.40', sub: 'Global weighted average' },
  { label: 'Avg. CDR Credit', value: '$96.50', sub: 'Biochar + DACCS blend' },
  { label: 'ACCU Spot Price', value: 'A$32.50', sub: 'Clean Energy Regulator' },
  { label: 'EU ETS (EUA)', value: '€68.20', sub: 'ICE Futures Europe' },
];

const MONTHLY_VOLUME = [
  { month: 'Oct', nature: 12.4, tech: 2.1 }, { month: 'Nov', nature: 14.2, tech: 2.8 },
  { month: 'Dec', nature: 11.8, tech: 3.1 }, { month: 'Jan', nature: 15.6, tech: 3.4 },
  { month: 'Feb', nature: 16.8, tech: 3.9 }, { month: 'Mar', nature: 18.2, tech: 4.2 },
];

const REGULATORY_TIMELINE = [
  { date: 'Jul 2025', event: 'ICVCM CCP Labels begin', status: 'completed', detail: 'First batch of Verra and Gold Standard methodologies receive CCP approval. Labels now visible on VCU serial numbers.' },
  { date: 'Jan 2026', event: 'CORSIA Phase 1 begins', status: 'active', detail: 'Mandatory carbon offsetting for international aviation. Airlines must retire CORSIA-eligible credits for emissions above 85% of 2019 baseline.' },
  { date: 'Jan 2026', event: 'EU CBAM transition ends', status: 'active', detail: 'Full CBAM implementation. Importers of cement, iron, steel, aluminium, fertilisers, electricity, and hydrogen must surrender CBAM certificates.' },
  { date: 'Jul 2026', event: 'Australia NRCC commences', status: 'upcoming', detail: 'National Renewable Carbon Credits scheme. Entities exceeding 100,000 tCO₂e/year must surrender credits equivalent to 4.9% of scope 1 emissions.' },
  { date: 'Jan 2027', event: 'VCMI Claims Code mandatory', status: 'upcoming', detail: 'Companies making net-zero or carbon-neutral claims must follow VCMI Claims Code requirements, including use of CCP-labelled credits.' },
  { date: 'Jan 2028', event: 'SBTi BVCM framework', status: 'upcoming', detail: 'Science-Based Targets initiative requires Beyond Value Chain Mitigation commitments from all validated companies.' },
];

const TYPE_BREAKDOWN = (() => {
  const counts: Record<string, { count: number; volume: number; avgPrice: number }> = {};
  LISTINGS.forEach(c => {
    if (!counts[c.creditType]) counts[c.creditType] = { count: 0, volume: 0, avgPrice: 0 };
    counts[c.creditType].count++;
    counts[c.creditType].volume += c.volumeAvailable;
    counts[c.creditType].avgPrice += c.price;
  });
  return Object.entries(counts).map(([type, d]) => ({
    type, count: d.count, volume: d.volume, avgPrice: d.avgPrice / d.count,
  })).sort((a, b) => b.volume - a.volume);
})();

const maxVol = Math.max(...TYPE_BREAKDOWN.map(t => t.volume));

export default function DataPage() {
  const [timeframe, setTimeframe] = useState<'6m' | '1y' | 'all'>('6m');

  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(12,28,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M6 26 L16 6 L26 26" stroke="#C9A96E" strokeWidth="2" fill="none"/><path d="M10 20 H22" stroke="#C9A96E" strokeWidth="1.5"/></svg>
            <span style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#FFFCF6' }}>CarbonBridge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', color: 'rgba(255,252,246,0.5)' }} className="hover:text-white transition-colors">Marketplace</Link>
            <span style={{ fontFamily: bg, fontSize: '13px', color: '#C9A96E', fontWeight: 600 }}>Data & Insights</span>
            <Link href="/register" style={{ fontFamily: bg, fontSize: '13px', background: '#C9A96E', color: '#0C1C14', padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}>Create Account</Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Header */}
        <div style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D)', padding: '48px 0 40px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <h1 style={{ fontFamily: fr, fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: '#FFFCF6', letterSpacing: '-0.02em', marginBottom: '8px' }}>Market Data & Insights</h1>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92' }}>Real-time carbon credit price indices, market intelligence, and regulatory tracking.</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-10">

          {/* ═══ PRICE INDICES ═══ */}
          <Section title="CarbonBridge Price Indices" sub="Proprietary benchmark indices updated daily. Based on weighted transaction data across major registries.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRICE_INDICES.map(idx => (
                <div key={idx.name} style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', transition: 'all 0.2s' }}
                  className="hover:shadow-md hover:border-[rgba(201,169,110,0.3)]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#1A1714' }}>{idx.name}</h3>
                      <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '2px' }}>{idx.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <span style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1A1714', fontFeatureSettings: "'tnum'" }}>${idx.price.toFixed(2)}</span>
                      <span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 600, color: idx.change >= 0 ? '#2D6A4F' : '#B91C1C', marginLeft: '8px' }}>
                        {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.change).toFixed(1)}%
                      </span>
                    </div>
                    {/* Sparkline */}
                    <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
                      <polyline
                        points={idx.sparkline.map((v, i) => {
                          const min = Math.min(...idx.sparkline);
                          const max = Math.max(...idx.sparkline);
                          const range = max - min || 1;
                          const x = (i / (idx.sparkline.length - 1)) * 76 + 2;
                          const y = 26 - ((v - min) / range) * 24;
                          return `${x},${y}`;
                        }).join(' ')}
                        stroke={idx.change >= 0 ? '#2D6A4F' : '#B91C1C'}
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '12px', fontStyle: 'italic' }}>
              Indices are indicative benchmarks. Not investment advice. Source: CarbonBridge proprietary data, Ecosystem Marketplace, ACX.
            </p>
          </Section>

          {/* ═══ MARKET OVERVIEW ═══ */}
          <Section title="Market Overview" sub="Key metrics across global voluntary and compliance carbon markets.">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {MARKET_STATS.map(s => (
                <div key={s.label} style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontFamily: fr, fontSize: '24px', fontWeight: 700, color: '#1B3A2D', fontFeatureSettings: "'tnum'" }}>{s.value}</div>
                  <div style={{ fontFamily: bg, fontSize: '11px', color: '#1A1714', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                  <div style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', marginTop: '2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══ VOLUME BY TYPE ═══ */}
          <Section title="Available Volume by Credit Type" sub="Current marketplace inventory across all listed projects.">
            <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '24px' }}>
              <div className="space-y-4">
                {TYPE_BREAKDOWN.map(t => (
                  <div key={t.type} className="flex items-center gap-4">
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', width: '140px', flexGrow: 0, flexShrink: 0 }}>{t.type}</span>
                    <div style={{ flex: 1, height: '28px', background: '#F5F0E8', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${(t.volume / maxVol) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #1B3A2D, #2D6A4F)', borderRadius: '6px', transition: 'width 0.5s' }} />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: '11px', fontWeight: 600, color: t.volume / maxVol > 0.5 ? '#FFFCF6' : '#1A1714' }}>
                        {t.volume >= 1000000 ? `${(t.volume / 1000000).toFixed(1)}M` : `${(t.volume / 1000).toFixed(0)}K`} tCO₂e
                      </span>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: '11px', color: '#8B8178', width: '60px', textAlign: 'right' }}>${t.avgPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3" style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A' }}>
                <span>Avg. price/tCO₂e →</span>
              </div>
            </div>
          </Section>

          {/* ═══ MONTHLY TRADING VOLUME ═══ */}
          <Section title="Monthly Trading Volume" sub="Nature-based vs. technology-based credit retirements (millions of tonnes).">
            <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '24px' }}>
              <div className="flex items-center gap-2 mb-6">
                {(['6m', '1y', 'all'] as const).map(t => (
                  <button key={t} onClick={() => setTimeframe(t)} style={{
                    fontFamily: bg, fontSize: '11px', fontWeight: timeframe === t ? 700 : 500,
                    color: timeframe === t ? '#1B3A2D' : '#B0A99A',
                    background: timeframe === t ? 'rgba(27,58,45,0.06)' : 'transparent',
                    border: `1px solid ${timeframe === t ? '#1B3A2D' : '#E8E2D6'}`,
                    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
                  }}>{t === '6m' ? '6 months' : t === '1y' ? '1 year' : 'All time'}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px' }}>
                {MONTHLY_VOLUME.map(m => {
                  const maxTotal = Math.max(...MONTHLY_VOLUME.map(v => v.nature + v.tech));
                  const natureH = (m.nature / maxTotal) * 150;
                  const techH = (m.tech / maxTotal) * 150;
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontFamily: mono, fontSize: '9px', color: '#B0A99A' }}>{(m.nature + m.tech).toFixed(1)}M</span>
                      <div style={{ width: '100%', maxWidth: '48px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <div style={{ height: `${techH}px`, background: '#C9A96E', borderRadius: '3px 3px 0 0' }} />
                        <div style={{ height: `${natureH}px`, background: '#2D6A4F', borderRadius: '0 0 3px 3px' }} />
                      </div>
                      <span style={{ fontFamily: bg, fontSize: '10px', color: '#8B8178', marginTop: '4px' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 justify-center" style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>
                <span className="flex items-center gap-2"><span style={{ width: '10px', height: '10px', background: '#2D6A4F', borderRadius: '2px', display: 'inline-block' }} /> Nature-based</span>
                <span className="flex items-center gap-2"><span style={{ width: '10px', height: '10px', background: '#C9A96E', borderRadius: '2px', display: 'inline-block' }} /> Technology-based</span>
              </div>
            </div>
          </Section>

          {/* ═══ REGULATORY TIMELINE ═══ */}
          <Section title="Regulatory Timeline" sub="Key compliance milestones driving carbon credit demand.">
            <div className="space-y-0">
              {REGULATORY_TIMELINE.map((r, i) => (
                <div key={r.event} className="flex gap-4" style={{ position: 'relative' }}>
                  {/* Timeline line */}
                  <div className="flex flex-col items-center" style={{ width: '20px' }}>
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                      background: r.status === 'completed' ? '#2D6A4F' : r.status === 'active' ? '#C9A96E' : '#E8E2D6',
                      border: r.status === 'active' ? '2px solid #C9A96E' : 'none',
                    }} />
                    {i < REGULATORY_TIMELINE.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: '#E8E2D6', minHeight: '40px' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: '28px', flex: 1 }}>
                    <div className="flex items-baseline gap-3">
                      <span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 600, color: r.status === 'active' ? '#C9A96E' : r.status === 'completed' ? '#2D6A4F' : '#B0A99A' }}>{r.date}</span>
                      <span style={{ fontFamily: bg, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        color: r.status === 'completed' ? '#2D6A4F' : r.status === 'active' ? '#C9A96E' : '#B0A99A',
                        background: r.status === 'completed' ? 'rgba(45,106,79,0.08)' : r.status === 'active' ? 'rgba(201,169,110,0.1)' : 'rgba(176,169,154,0.1)',
                        padding: '2px 8px', borderRadius: '4px' }}>
                        {r.status}
                      </span>
                    </div>
                    <h4 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714', marginTop: '4px', marginBottom: '4px' }}>{r.event}</h4>
                    <p style={{ fontFamily: bg, fontSize: '12.5px', color: '#8B8178', lineHeight: 1.6 }}>{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══ RESEARCH ═══ */}
          <Section title="Research & Reports" sub="Market analysis and regulatory intelligence from the CarbonBridge research team.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'NRCC Buyer\'s Guide: What Australian Corporates Need to Know', date: 'March 2026', tag: 'Compliance', reading: '12 min' },
                { title: 'CORSIA Phase 1: Which Credits Qualify and at What Price?', date: 'February 2026', tag: 'Aviation', reading: '8 min' },
                { title: 'MENA Carbon Markets: The Gulf\'s Compliance Wave', date: 'January 2026', tag: 'Market Analysis', reading: '15 min' },
                { title: 'Blue Carbon Pricing Outlook 2026-2030', date: 'December 2025', tag: 'Pricing', reading: '10 min' },
                { title: 'CBAM Impact Assessment: What Exporters to the EU Must Prepare', date: 'November 2025', tag: 'Trade', reading: '14 min' },
                { title: 'Credit Insurance: Why It Matters and Who Provides It', date: 'October 2025', tag: 'Insurance', reading: '7 min' },
              ].map(r => (
                <div key={r.title} style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '22px', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="hover:shadow-md hover:border-[rgba(201,169,110,0.3)]">
                  <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.tag}</span>
                  <h4 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714', marginTop: '8px', marginBottom: '12px', lineHeight: 1.4 }}>{r.title}</h4>
                  <div className="flex items-center justify-between" style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>
                    <span>{r.date}</span>
                    <span>{r.reading} read</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </main>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{title}</h2>
      <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '13px', color: '#8B8178', marginBottom: '20px' }}>{sub}</p>
      {children}
    </section>
  );
}
