'use client';

import { useState } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

// Demo data — will be replaced with Supabase queries
const PORTFOLIO = [
  { credit: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 5000, vintage: 2025, rating: 'AA', value: 162500, cost: 145000 },
  { credit: 'Great Southern Forest', type: 'ARR', qty: 2500, vintage: 2024, rating: 'AAA', value: 66000, cost: 58000 },
  { credit: 'Queensland Soil Carbon', type: 'Soil Carbon', qty: 8000, vintage: 2025, rating: 'A', value: 145600, cost: 132000 },
];

const RECENT_ORDERS = [
  { ref: 'CB-2026-00142', date: '22 Mar 2026', credit: 'Great Southern Forest', qty: 2500, total: 66000, status: 'Confirmed' },
  { ref: 'CB-2026-00138', date: '18 Mar 2026', credit: 'Kalimantan Peatland', qty: 10000, total: 128000, status: 'Completed' },
  { ref: 'CB-2026-00125', date: '10 Mar 2026', credit: 'Abu Dhabi Blue Carbon', qty: 5000, total: 162500, status: 'Completed' },
];

const totalValue = PORTFOLIO.reduce((s, p) => s + p.value, 0);
const totalCost = PORTFOLIO.reduce((s, p) => s + p.cost, 0);
const totalTonnes = PORTFOLIO.reduce((s, p) => s + p.qty, 0);

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Confirmed: { bg: 'rgba(201,169,110,0.1)', text: '#C9A96E' },
  Completed: { bg: 'rgba(22,163,74,0.08)', text: '#16A34A' },
  'In Progress': { bg: 'rgba(59,130,246,0.08)', text: '#2563EB' },
  Cancelled: { bg: 'rgba(239,68,68,0.08)', text: '#EF4444' },
};

export default function DashboardOverview() {
  const [showSellerCTA] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259' }}>Welcome back. Here&apos;s your carbon portfolio overview.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Portfolio Value', value: fmt(totalValue), sub: `${fmt(totalValue - totalCost)} unrealised`, color: '#1B3A2D' },
          { label: 'Credits Held', value: `${totalTonnes.toLocaleString()} tCO₂e`, sub: `${PORTFOLIO.length} projects`, color: '#2D6A4F' },
          { label: 'Active Orders', value: '1', sub: 'Awaiting settlement', color: '#C9A96E' },
          { label: 'Credits Retired', value: '0 tCO₂e', sub: 'Retire from portfolio →', color: '#4A6A7A' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '20px', borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ fontFamily: bg, fontSize: '12px', color: '#6B6259', marginBottom: '8px' }}>{kpi.label}</div>
            <div style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Seller CTA */}
      {showSellerCTA && (
        <div style={{ background: 'linear-gradient(135deg, #1B3A2D, #2D6A4F)', borderRadius: '14px', padding: '24px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontFamily: fr, fontSize: '18px', color: '#F2ECE0', marginBottom: '4px' }}>Want to list credits for sale?</h3>
            <p style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92' }}>Complete seller verification to access listing and order management features.</p>
          </div>
          <Link href="/dashboard/settings" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>
            Apply for seller access
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Portfolio */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714' }}>Portfolio</h2>
            <Link href="/dashboard/portfolio" style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5DED3' }}>
                  {['Credit', 'Type', 'Qty (tCO₂e)', 'Vintage', 'Rating', 'Value', 'P&L'].map(h => (
                    <th key={h} style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8A7E70', textAlign: 'left', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PORTFOLIO.map(p => (
                  <tr key={p.credit} style={{ borderBottom: '1px solid #F5F0E8' }}>
                    <td style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714', padding: '12px' }}>{p.credit}</td>
                    <td><span style={{ fontFamily: bg, fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(27,58,45,0.06)', color: '#1B3A2D' }}>{p.type}</span></td>
                    <td style={{ fontFamily: mono, fontSize: '13px', color: '#1A1714', padding: '12px' }}>{p.qty.toLocaleString()}</td>
                    <td style={{ fontFamily: mono, fontSize: '13px', color: '#6B6259', padding: '12px' }}>{p.vintage}</td>
                    <td><span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#1B3A2D' }}>{p.rating}</span></td>
                    <td style={{ fontFamily: mono, fontSize: '13px', color: '#1A1714', padding: '12px' }}>{fmt(p.value)}</td>
                    <td style={{ fontFamily: mono, fontSize: '13px', color: p.value > p.cost ? '#16A34A' : '#EF4444', padding: '12px' }}>{fmt(p.value - p.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714' }}>Recent purchases</h2>
            <Link href="/dashboard/purchases" style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RECENT_ORDERS.map(o => (
              <div key={o.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F5F0E8', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{o.credit}</div>
                  <div style={{ fontFamily: mono, fontSize: '11px', color: '#8A7E70' }}>{o.ref} · {o.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{fmt(o.total)}</div>
                  <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', ...(STATUS_COLORS[o.status] || STATUS_COLORS.Confirmed) }}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '16px' }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Browse marketplace', href: '/marketplace', desc: 'Discover verified credits' },
              { label: 'Compare credits', href: '/compare', desc: 'Side-by-side comparison' },
              { label: 'Submit RFQ', href: '/rfq', desc: 'Request quotes for large volumes' },
              { label: 'View data & insights', href: '/data', desc: 'Market intelligence' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5DED3', textDecoration: 'none', transition: 'all 150ms' }} className="hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.03)]">
                <div>
                  <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{a.label}</div>
                  <div style={{ fontFamily: bg, fontSize: '11px', color: '#8A7E70' }}>{a.desc}</div>
                </div>
                <span style={{ color: '#C9A96E', fontSize: '16px' }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
