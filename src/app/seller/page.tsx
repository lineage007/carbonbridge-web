'use client';

import { useState } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }); }

const SELLER = { name: 'Pacific Carbon Developments', type: 'Project Developer', registries: ['Verra VCS', 'Gold Standard'] };

const LISTINGS_DATA = [
  { id: 'cb-au-arr-001', name: 'Great Southern Forest Restoration', type: 'ARR / Reforestation', vintage: '2025', rating: 'AA', price: 26.40, available: 45000, total: 80000, sold: 35000, status: 'Active' as const, views: 1240, inquiries: 18 },
  { id: 'cb-au-bio-001', name: 'Queensland Biochar Sequestration', type: 'Biochar / CDR', vintage: '2026', rating: 'AA+', price: 142.00, available: 8200, total: 12000, sold: 3800, status: 'Active' as const, views: 890, inquiries: 12 },
  { id: 'cb-au-soil-001', name: 'Queensland Soil Carbon Initiative', type: 'Soil Carbon', vintage: '2025', rating: 'AA', price: 18.20, available: 32000, total: 50000, sold: 18000, status: 'Active' as const, views: 560, inquiries: 7 },
  { id: 'cb-au-arr-002', name: 'Tasmanian Wilderness Carbon Reserve', type: 'ARR / Reforestation', vintage: '2024', rating: 'A+', price: 22.80, available: 0, total: 25000, sold: 25000, status: 'Sold Out' as const, views: 2100, inquiries: 34 },
  { id: 'cb-au-arr-003', name: 'Murray-Darling Riparian Restoration', type: 'ARR / Reforestation', vintage: '2025', rating: 'A', price: 19.50, available: 60000, total: 60000, sold: 0, status: 'Pending Review' as const, views: 0, inquiries: 0 },
];

const ORDERS = [
  { id: 'SO-2026-0089', date: '2026-03-22', buyer: 'Emirates Industrial Group', credit: 'Great Southern Forest', qty: 2500, price: 26.40, total: 66000, insurance: true, status: 'Confirmed' as const },
  { id: 'SO-2026-0084', date: '2026-03-18', buyer: 'Etihad Airways', credit: 'Queensland Biochar', qty: 500, price: 142.00, total: 71000, insurance: true, status: 'Settled' as const },
  { id: 'SO-2026-0078', date: '2026-03-12', buyer: 'ADNOC Refining', credit: 'Great Southern Forest', qty: 5000, price: 26.40, total: 132000, insurance: false, status: 'Completed' as const },
  { id: 'SO-2026-0071', date: '2026-03-05', buyer: 'DP World', credit: 'Queensland Soil Carbon', qty: 10000, price: 18.20, total: 182000, insurance: true, status: 'Completed' as const },
  { id: 'SO-2026-0062', date: '2026-02-26', buyer: 'DEWA', credit: 'Tasmanian Wilderness', qty: 8000, price: 22.80, total: 182400, insurance: false, status: 'Completed' as const },
];

const PAYOUTS = [
  { id: 'PAY-0034', date: '2026-03-15', amount: 296400, credits: 3, method: 'Wire Transfer', status: 'Completed' as const },
  { id: 'PAY-0029', date: '2026-02-28', amount: 182400, credits: 1, method: 'Wire Transfer', status: 'Completed' as const },
  { id: 'PAY-0022', date: '2026-02-15', amount: 145200, credits: 2, method: 'Wire Transfer', status: 'Completed' as const },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'rgba(22,163,74,0.1)', text: '#16A34A' },
  'Sold Out': { bg: 'rgba(139,129,120,0.1)', text: '#8B8178' },
  'Pending Review': { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  Draft: { bg: 'rgba(156,163,175,0.1)', text: '#9CA3AF' },
  Confirmed: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  Settled: { bg: 'rgba(45,106,79,0.1)', text: '#2D6A4F' },
  Completed: { bg: 'rgba(22,163,74,0.15)', text: '#16A34A' },
};

type Tab = 'overview' | 'listings' | 'orders' | 'payouts' | 'analytics';

export default function SellerDashboard() {
  const [tab, setTab] = useState<Tab>('overview');

  const totalRevenue = ORDERS.filter(o => o.status === 'Completed' || o.status === 'Settled').reduce((s, o) => s + o.total, 0);
  const totalSold = LISTINGS_DATA.reduce((s, l) => s + l.sold, 0);
  const activeListings = LISTINGS_DATA.filter(l => l.status === 'Active').length;
  const avgPrice = LISTINGS_DATA.filter(l => l.status === 'Active').reduce((s, l) => s + l.price, 0) / activeListings;

  return (
    <div style={{ background: '#FAFAF7', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--forest-deep, #1B3A2D)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px', width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: bg, fontSize: '13px', color: 'rgba(255,252,246,0.6)' }}>Seller Portal</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#C9A96E' }}>PD</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Welcome back, Pacific Carbon</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>Manage your carbon credit listings, track sales, and monitor performance.</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Revenue', value: fmt(totalRevenue), sub: `${ORDERS.length} orders`, accent: '#2D6A4F' },
            { label: 'Credits Sold', value: totalSold.toLocaleString(), sub: 'tCO₂e total', accent: '#16A34A' },
            { label: 'Active Listings', value: String(activeListings), sub: `of ${LISTINGS_DATA.length} total`, accent: '#3B82F6' },
            { label: 'Avg Price', value: `$${avgPrice.toFixed(2)}`, sub: 'per tCO₂e', accent: '#C9A96E' },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px', borderTop: `3px solid ${kpi.accent}` }}>
              <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{kpi.label}</div>
              <div style={{ fontFamily: mono, fontSize: '26px', fontWeight: 700, color: '#1A1714', marginBottom: '2px' }}>{kpi.value}</div>
              <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #E8E2D8', marginBottom: '24px' }}>
          {(['overview', 'listings', 'orders', 'payouts', 'analytics'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: bg, fontSize: '13px', fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#1B3A2D' : '#8B8178', background: 'transparent',
              border: 'none', padding: '10px 18px', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #1B3A2D' : '2px solid transparent',
              transition: 'all 0.2s', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Recent Orders */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Recent Orders</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ORDERS.slice(0, 4).map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#FAFAF7', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{o.buyer}</div>
                      <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{o.credit} · {o.qty.toLocaleString()} tCO₂e</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 600, color: '#2D6A4F' }}>{fmt(o.total)}</div>
                      <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.text }}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Performance */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Listing Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {LISTINGS_DATA.filter(l => l.status === 'Active').map(l => {
                  const pct = (l.sold / l.total) * 100;
                  return (
                    <div key={l.id} style={{ padding: '12px', background: '#FAFAF7', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{l.name}</span>
                        <span style={{ fontFamily: mono, fontSize: '12px', color: '#2D6A4F' }}>{pct.toFixed(0)}% sold</span>
                      </div>
                      <div style={{ height: '6px', background: '#E8E2D8', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #1B3A2D, #2D6A4F)', borderRadius: '3px', transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{l.sold.toLocaleString()} / {l.total.toLocaleString()} tCO₂e</span>
                        <span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{l.views} views · {l.inquiries} inquiries</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'List New Credits', desc: 'Add a new carbon credit listing to the marketplace', icon: '＋' },
                  { label: 'Update Pricing', desc: 'Adjust prices across your active listings', icon: '◎' },
                  { label: 'Download Reports', desc: 'Export sales and payout reports (CSV/PDF)', icon: '↓' },
                  { label: 'Verification Status', desc: 'Check registry verification and audit status', icon: '✓' },
                ].map(a => (
                  <button key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#FAFAF7', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.background = '#FFFCF6'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#FAFAF7'; }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', fontFamily: mono, fontSize: '16px', flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{a.label}</div>
                      <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Summary */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Payout Summary</h3>
              <div style={{ fontFamily: mono, fontSize: '32px', fontWeight: 700, color: '#2D6A4F', marginBottom: '4px' }}>{fmt(PAYOUTS.reduce((s, p) => s + p.amount, 0))}</div>
              <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginBottom: '20px' }}>Total received · {PAYOUTS.length} payouts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PAYOUTS.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAF7', borderRadius: '6px' }}>
                    <div>
                      <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{p.id}</span>
                      <span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', marginLeft: '8px' }}>{p.date}</span>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#2D6A4F' }}>{fmt(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {tab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#1A1714' }}>Your Listings</h3>
              <button style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1B3A2D', background: '#C9A96E', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>＋ New Listing</button>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8E2D8' }}>
                    {['Project', 'Type', 'Vintage', 'Rating', 'Price', 'Available', 'Sold', 'Status', ''].map(h => (
                      <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 14px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LISTINGS_DATA.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #F0EDE6' }} onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714', maxWidth: '220px' }}>{l.name}</td>
                      <td style={{ padding: '14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{l.type}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{l.vintage}</td>
                      <td style={{ padding: '14px' }}><span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 700, color: '#C9A96E', background: 'rgba(201,169,110,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{l.rating}</span></td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>${l.price.toFixed(2)}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{l.available.toLocaleString()}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#2D6A4F' }}>{l.sold.toLocaleString()}</td>
                      <td style={{ padding: '14px' }}><span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: STATUS_COLORS[l.status]?.bg || '#f0f0f0', color: STATUS_COLORS[l.status]?.text || '#666' }}>{l.status}</span></td>
                      <td style={{ padding: '14px' }}><Link href={`/credits/${l.id}`} style={{ fontFamily: bg, fontSize: '11px', color: '#1B3A2D', textDecoration: 'underline' }}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8E2D8' }}>
                  {['Order', 'Date', 'Buyer', 'Credit', 'Qty (tCO₂e)', 'Price', 'Total', 'Insured', 'Status'].map(h => (
                    <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 14px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F0EDE6' }} onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '12px', color: '#1B3A2D', fontWeight: 600 }}>{o.id}</td>
                    <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{o.date}</td>
                    <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{o.buyer}</td>
                    <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{o.credit}</td>
                    <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{o.qty.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>${o.price.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#2D6A4F' }}>{fmt(o.total)}</td>
                    <td style={{ padding: '12px 14px' }}>{o.insurance ? <span style={{ color: '#16A34A', fontSize: '14px' }}>✓</span> : <span style={{ color: '#D1D5DB', fontSize: '14px' }}>—</span>}</td>
                    <td style={{ padding: '12px 14px' }}><span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.text }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payouts Tab */}
        {tab === 'payouts' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px', borderTop: '3px solid #2D6A4F' }}>
                <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total Paid</div>
                <div style={{ fontFamily: mono, fontSize: '28px', fontWeight: 700, color: '#2D6A4F' }}>{fmt(PAYOUTS.reduce((s, p) => s + p.amount, 0))}</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px', borderTop: '3px solid #C9A96E' }}>
                <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Pending</div>
                <div style={{ fontFamily: mono, fontSize: '28px', fontWeight: 700, color: '#C9A96E' }}>{fmt(66000)}</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px', borderTop: '3px solid #3B82F6' }}>
                <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Next Payout</div>
                <div style={{ fontFamily: mono, fontSize: '28px', fontWeight: 700, color: '#3B82F6' }}>Mar 31</div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8E2D8' }}>
                    {['Payout ID', 'Date', 'Amount', 'Credits Covered', 'Method', 'Status'].map(h => (
                      <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 14px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAYOUTS.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F0EDE6' }}>
                      <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '12px', fontWeight: 600, color: '#1B3A2D' }}>{p.id}</td>
                      <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{p.date}</td>
                      <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '14px', fontWeight: 700, color: '#2D6A4F' }}>{fmt(p.amount)}</td>
                      <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', color: '#1A1714' }}>{p.credits} listings</td>
                      <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{p.method}</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Sales by Month */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Monthly Sales Volume</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { month: 'Jan 2026', vol: 12000, rev: 218400 },
                  { month: 'Feb 2026', vol: 33000, rev: 445600 },
                  { month: 'Mar 2026', vol: 18000, rev: 397000 },
                ].map(m => (
                  <div key={m.month}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{m.month}</span>
                      <span style={{ fontFamily: mono, fontSize: '12px', color: '#2D6A4F' }}>{m.vol.toLocaleString()} tCO₂e · {fmt(m.rev)}</span>
                    </div>
                    <div style={{ height: '8px', background: '#E8E2D8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(m.vol / 33000) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #1B3A2D, #2D6A4F)', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer Breakdown */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Top Buyers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Etihad Airways', vol: 15000, type: 'CORSIA' },
                  { name: 'Emirates Industrial Group', vol: 12500, type: 'NRCC' },
                  { name: 'DP World', vol: 10000, type: 'CBAM' },
                  { name: 'ADNOC Refining', vol: 8000, type: 'Voluntary' },
                  { name: 'DEWA', vol: 8000, type: 'NRCC' },
                ].map((b, i) => (
                  <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#FAFAF7', borderRadius: '8px' }}>
                    <span style={{ fontFamily: mono, fontSize: '14px', fontWeight: 700, color: '#C9A96E', width: '24px' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{b.name}</div>
                      <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{b.type} compliance</div>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{b.vol.toLocaleString()} tCO₂e</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Type Distribution */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Revenue by Credit Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { type: 'ARR / Reforestation', pct: 38, rev: 380400, color: '#16A34A' },
                  { type: 'Biochar / CDR', pct: 27, rev: 269800, color: '#8B5CF6' },
                  { type: 'Soil Carbon', pct: 22, rev: 220200, color: '#C9A96E' },
                  { type: 'Blue Carbon', pct: 13, rev: 130000, color: '#0EA5E9' },
                ].map(t => (
                  <div key={t.type} style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${t.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <span style={{ fontFamily: mono, fontSize: '20px', fontWeight: 700, color: t.color }}>{t.pct}%</span>
                    </div>
                    <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{t.type}</div>
                    <div style={{ fontFamily: mono, fontSize: '12px', color: '#8B8178' }}>{fmt(t.rev)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
