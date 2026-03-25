'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { LISTINGS } from '@/data/credits';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

// ─── Mock user data ─────────────────────────────────────────
const USER = { name: 'Emirates Industrial Group', type: 'Corporate', compliance: ['NRCC', 'CBAM'] };

const ORDERS = [
  { id: 'CB-2026-00142', date: '2026-03-22', credit: 'Great Southern Forest Restoration', type: 'ARR', qty: 2500, unitPrice: 26.40, total: 66000, insurance: true, insurancePremium: 2310, status: 'Confirmed' as const },
  { id: 'CB-2026-00138', date: '2026-03-18', credit: 'Kalimantan Peatland Conservation', type: 'REDD+', qty: 10000, unitPrice: 12.80, total: 128000, insurance: true, insurancePremium: 4480, status: 'Settled' as const },
  { id: 'CB-2026-00125', date: '2026-03-10', credit: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 5000, unitPrice: 32.50, total: 162500, insurance: false, insurancePremium: 0, status: 'Completed' as const },
  { id: 'CB-2026-00098', date: '2026-02-28', credit: 'Queensland Soil Carbon Initiative', type: 'Soil Carbon', qty: 8000, unitPrice: 18.20, total: 145600, insurance: true, insurancePremium: 5096, status: 'Completed' as const },
];

const PORTFOLIO = [
  { credit: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 5000, vintage: 2025, rating: 'AAA', costBasis: 162500, marketValue: 175000, status: 'Active' as const },
  { credit: 'Queensland Soil Carbon Initiative', type: 'Soil Carbon', qty: 8000, vintage: 2025, rating: 'AA', costBasis: 145600, marketValue: 148800, status: 'Active' as const },
  { credit: 'Great Barrier Reef Mangrove', type: 'Blue Carbon', qty: 3000, vintage: 2024, rating: 'AA', costBasis: 97500, marketValue: 99000, status: 'Retired' as const },
];

const CERTIFICATES = [
  { id: 'RET-2026-0042', date: '2026-03-01', credit: 'Great Barrier Reef Mangrove', qty: 3000, serials: 'VCU-4821-0001 to VCU-4821-3000' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Submitted: { bg: 'rgba(201,169,110,0.1)', text: '#C9A96E' },
  Confirmed: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  Settled: { bg: 'rgba(45,106,79,0.1)', text: '#2D6A4F' },
  Completed: { bg: 'rgba(45,106,79,0.15)', text: '#16A34A' },
  Active: { bg: 'rgba(45,106,79,0.1)', text: '#2D6A4F' },
  Retired: { bg: 'rgba(139,129,120,0.1)', text: '#8B8178' },
};

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }); }

export default function DashboardPage() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'portfolio' | 'certificates'>('overview');
  const totalPortfolioValue = PORTFOLIO.filter(p => p.status === 'Active').reduce((s, p) => s + p.marketValue, 0);
  const totalCostBasis = PORTFOLIO.filter(p => p.status === 'Active').reduce((s, p) => s + p.costBasis, 0);
  const totalCredits = PORTFOLIO.filter(p => p.status === 'Active').reduce((s, p) => s + p.qty, 0);
  const totalRetired = PORTFOLIO.filter(p => p.status === 'Retired').reduce((s, p) => s + p.qty, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ─── Sidebar ─── */}
      <Sidebar />

      {/* ─── Main Content ─── */}
      <main style={{ flex: 1, background: '#FDFBF7', overflow: 'auto' }}>
        {/* Top bar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E8E2D6', padding: '16px 28px' }} className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714' }}>Dashboard</h1>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '2px' }}>Welcome back, {USER.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(27,58,45,0.1)', textDecoration: 'none' }}>Browse marketplace</Link>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#C9A96E' }}>{USER.name.charAt(0)}</span>
            </div>
          </div>
        </header>

        <div style={{ padding: '28px' }}>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '28px' }}>
            {[
              { label: 'Portfolio Value', value: fmt(totalPortfolioValue), sub: `${totalCredits.toLocaleString()} active credits`, color: '#1B3A2D' },
              { label: 'Unrealised P&L', value: fmt(totalPortfolioValue - totalCostBasis), sub: `${((totalPortfolioValue - totalCostBasis) / totalCostBasis * 100).toFixed(1)}% return`, color: '#2D6A4F' },
              { label: 'Credits Retired', value: totalRetired.toLocaleString(), sub: `${CERTIFICATES.length} certificate${CERTIFICATES.length !== 1 ? 's' : ''}`, color: '#C9A96E' },
              { label: 'Total Invested', value: fmt(ORDERS.reduce((s, o) => s + o.total, 0)), sub: `${ORDERS.length} transactions`, color: '#8B8178' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '20px', borderTop: `3px solid ${kpi.color}` }}>
                <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{kpi.label}</div>
                <div style={{ fontFamily: fr, fontSize: '26px', fontWeight: 700, color: '#1A1714', fontFeatureSettings: "'tnum'" }}>{kpi.value}</div>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '4px' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1" style={{ borderBottom: '1px solid #E8E2D6', marginBottom: '24px' }}>
            {(['overview', 'orders', 'portfolio', 'certificates'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily: bg, fontSize: '13px', fontWeight: tab === t ? 600 : 400,
                color: tab === t ? '#1B3A2D' : '#B0A99A',
                padding: '10px 16px', borderBottom: tab === t ? '2px solid #1B3A2D' : '2px solid transparent',
                background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </div>

          {/* Tab: Overview */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Recent Orders */}
                <Card title="Recent Orders" action={<button onClick={() => setTab('orders')} style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>}>
                  <div className="space-y-2">
                    {ORDERS.slice(0, 3).map(o => (
                      <div key={o.id} className="flex items-center justify-between" style={{ padding: '12px', background: '#FDFBF7', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{o.credit}</div>
                          <div style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '2px' }}>{o.id} · {o.date} · {o.qty.toLocaleString()} tCO₂e</div>
                        </div>
                        <div className="text-right">
                          <div style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{fmt(o.total)}</div>
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Compliance snapshot */}
                <Card title="Compliance Snapshot">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { framework: 'NRCC', status: 'On track', detail: '13,000 of 15,200 tCO₂e obligation covered (85%)', color: '#2D6A4F' },
                      { framework: 'CBAM', status: 'Monitoring', detail: 'No EU exports flagged. Review Q2 2026.', color: '#C9A96E' },
                    ].map(c => (
                      <div key={c.framework} style={{ padding: '16px', background: '#FDFBF7', borderRadius: '10px', borderLeft: `3px solid ${c.color}` }}>
                        <div className="flex items-center justify-between">
                          <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>{c.framework}</span>
                          <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: c.color, background: `${c.color}15`, padding: '3px 8px', borderRadius: '4px' }}>{c.status}</span>
                        </div>
                        <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '6px', lineHeight: 1.5 }}>{c.detail}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <Card title="Quick Actions">
                  <div className="space-y-2">
                    {[
                      { label: 'Browse marketplace', href: '/marketplace', icon: '◈' },
                      { label: 'Request a quote', href: '#', icon: '◇' },
                      { label: 'Retire credits', href: '#', icon: '◆' },
                      { label: 'Download reports', href: '#', icon: '◎' },
                    ].map(a => (
                      <Link key={a.label} href={a.href} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
                        fontFamily: bg, fontSize: '13px', color: '#1A1714', background: '#FDFBF7', textDecoration: 'none',
                        transition: 'background 0.15s',
                      }} className="hover:bg-[#F5F0E8]">
                        <span style={{ color: '#C9A96E' }}>{a.icon}</span> {a.label}
                      </Link>
                    ))}
                  </div>
                </Card>

                <Card title="Carbon Management">
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                    <p style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Coming soon</p>
                    <p style={{ fontFamily: bg, fontSize: '12px', color: '#B0A99A', lineHeight: 1.5 }}>Track emissions, manage compliance obligations, and optimise your portfolio — all in one place.</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tab: Orders */}
          {tab === 'orders' && (
            <Card title={`Purchase History (${ORDERS.length})`}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E8E2D6' }}>
                      {['Reference', 'Date', 'Credit', 'Type', 'Quantity', 'Total', 'Insurance', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #F5F0E8' }} className="hover:bg-[#FDFBF7]">
                        <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>{o.id}</td>
                        <td style={{ padding: '12px', color: '#8B8178' }}>{o.date}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1A1714' }}>{o.credit}</td>
                        <td style={{ padding: '12px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{o.type}</span></td>
                        <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px' }}>{o.qty.toLocaleString()}</td>
                        <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px', fontWeight: 600 }}>{fmt(o.total)}</td>
                        <td style={{ padding: '12px' }}>{o.insurance ? <span style={{ color: '#2D6A4F', fontSize: '11px' }}>✓ {fmt(o.insurancePremium)}</span> : <span style={{ color: '#B0A99A', fontSize: '11px' }}>—</span>}</td>
                        <td style={{ padding: '12px' }}><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab: Portfolio */}
          {tab === 'portfolio' && (
            <Card title="Active Portfolio">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E8E2D6' }}>
                      {['Credit', 'Type', 'Quantity', 'Vintage', 'Rating', 'Cost Basis', 'Market Value', 'P&L', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PORTFOLIO.map(p => {
                      const pnl = p.marketValue - p.costBasis;
                      return (
                        <tr key={p.credit} style={{ borderBottom: '1px solid #F5F0E8' }} className="hover:bg-[#FDFBF7]">
                          <td style={{ padding: '12px', fontWeight: 600, color: '#1A1714' }}>{p.credit}</td>
                          <td style={{ padding: '12px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{p.type}</span></td>
                          <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px' }}>{p.qty.toLocaleString()}</td>
                          <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px' }}>{p.vintage}</td>
                          <td style={{ padding: '12px' }}><span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 700, color: p.rating === 'AAA' ? '#C9A96E' : '#2D6A4F' }}>{p.rating}</span></td>
                          <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px' }}>{fmt(p.costBasis)}</td>
                          <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px', fontWeight: 600 }}>{fmt(p.marketValue)}</td>
                          <td style={{ padding: '12px', fontFamily: mono, fontSize: '12px', fontWeight: 600, color: pnl >= 0 ? '#2D6A4F' : '#B91C1C' }}>{pnl >= 0 ? '+' : ''}{fmt(pnl)}</td>
                          <td style={{ padding: '12px' }}><StatusBadge status={p.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab: Certificates */}
          {tab === 'certificates' && (
            <Card title="Retirement Certificates">
              {CERTIFICATES.length > 0 ? (
                <div className="space-y-3">
                  {CERTIFICATES.map(c => (
                    <div key={c.id} style={{ padding: '20px', background: '#FDFBF7', borderRadius: '10px', border: '1px solid #E8E2D6' }}>
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <div style={{ fontFamily: mono, fontSize: '12px', color: '#C9A96E', marginBottom: '4px' }}>{c.id}</div>
                          <div style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714' }}>{c.credit}</div>
                          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '4px' }}>{c.qty.toLocaleString()} tCO₂e retired on {c.date}</div>
                          <div style={{ fontFamily: mono, fontSize: '11px', color: '#B0A99A', marginTop: '6px' }}>Serials: {c.serials}</div>
                        </div>
                        <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(27,58,45,0.1)', cursor: 'pointer' }}>
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center" style={{ padding: '40px 0' }}>
                  <p style={{ fontFamily: bg, fontSize: '14px', color: '#B0A99A' }}>No retirement certificates yet.</p>
                  <p style={{ fontFamily: bg, fontSize: '12px', color: '#B0A99A', marginTop: '4px' }}>Certificates are generated when you retire credits from your portfolio.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '12px' }}>
      <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid #F5F0E8' }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '14px', fontWeight: 600, color: '#1A1714' }}>{title}</h3>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: '#f5f5f5', text: '#888' };
  return <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '10px', fontWeight: 700, color: c.text, background: c.bg, padding: '3px 8px', borderRadius: '4px' }}>{status}</span>;
}
