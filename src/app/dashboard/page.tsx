'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPortfolio, getUserOrders } from '@/lib/db';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getPortfolio(user.id), getUserOrders(user.id)])
      .then(([p, o]) => { setPortfolio(p); setOrders(o); })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const totalValue = portfolio.reduce((s, p) => s + (p.listing?.price_per_tonne || 0) * (p.quantity || 0), 0);
  const totalTonnes = portfolio.reduce((s, p) => s + (p.quantity || 0), 0);
  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => !['completed', 'cancelled', 'refunded'].includes(o.status));

  return (
    <div style={{ fontFamily: bg }}>
      <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>
        Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
      </h1>
      <p style={{ fontSize: '13px', color: '#8A7E70', marginBottom: '28px' }}>
        Your carbon credit portfolio overview
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Portfolio Value', value: loading ? '...' : fmt(totalValue), sub: `${portfolio.length} projects`, color: '#1B3A2D' },
          { label: 'Credits Held', value: loading ? '...' : `${totalTonnes.toLocaleString()} tCO₂e`, sub: `${portfolio.length} vintages`, color: '#2D6A4F' },
          { label: 'Total Invested', value: loading ? '...' : fmt(totalSpent), sub: `${orders.length} orders`, color: '#C9A96E' },
          { label: 'Pending Orders', value: loading ? '...' : String(pendingOrders.length), sub: pendingOrders.length > 0 ? 'Action needed' : 'All settled', color: pendingOrders.length > 0 ? '#dc2626' : '#2D6A4F' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '20px', borderLeft: `4px solid ${kpi.color}` }}>
            <div style={{ fontSize: '12px', color: '#8A7E70', marginBottom: '4px' }}>{kpi.label}</div>
            <div style={{ fontFamily: mono, fontSize: '24px', fontWeight: 700, color: '#1A1714' }}>{kpi.value}</div>
            <div style={{ fontSize: '11px', color: '#8A7E70', marginTop: '2px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Portfolio */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '16px', color: '#1A1714' }}>Portfolio</h2>
            <Link href="/dashboard/portfolio" style={{ fontSize: '12px', color: '#C9A96E' }}>View all →</Link>
          </div>
          {loading ? (
            <p style={{ fontSize: '13px', color: '#8A7E70', padding: '20px 0', textAlign: 'center' }}>Loading...</p>
          ) : portfolio.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>◇</div>
              <p style={{ fontSize: '14px', color: '#1A1714', fontWeight: 600, marginBottom: '4px' }}>No credits in your portfolio yet</p>
              <p style={{ fontSize: '12px', color: '#8A7E70', marginBottom: '16px' }}>Browse the marketplace to find verified carbon credits</p>
              <Link href="/marketplace" style={{ fontSize: '13px', fontWeight: 600, color: '#F2ECE0', background: '#1B3A2D', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: '1px solid #E5DED3' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Credit</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Tonnes</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Value</th>
              </tr></thead>
              <tbody>{portfolio.slice(0, 5).map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0EBE0', cursor: 'pointer' }} onClick={() => p.listing?.id && (window.location.href = `/credits/${p.listing.id}`)}>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: '#1B3A2D' }}>{p.listing?.project_name || 'Unknown'}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: mono }}>{(p.quantity || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: mono }}>{fmt((p.listing?.price_per_tonne || 0) * (p.quantity || 0))}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '16px', color: '#1A1714' }}>Recent Orders</h2>
            <Link href="/dashboard/purchases" style={{ fontSize: '12px', color: '#C9A96E' }}>View all →</Link>
          </div>
          {loading ? (
            <p style={{ fontSize: '13px', color: '#8A7E70', padding: '20px 0', textAlign: 'center' }}>Loading...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>◈</div>
              <p style={{ fontSize: '14px', color: '#1A1714', fontWeight: 600, marginBottom: '4px' }}>No orders yet</p>
              <p style={{ fontSize: '12px', color: '#8A7E70' }}>Your purchase history will appear here</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: '1px solid #E5DED3' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Ref</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Credit</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Total</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#8A7E70', fontSize: '11px', fontWeight: 600 }}>Status</th>
              </tr></thead>
              <tbody>{orders.slice(0, 5).map((o, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                  <td style={{ padding: '10px 0', fontFamily: mono, fontSize: '11px', color: '#C9A96E' }}>{o.reference || `CB-${String(i+1).padStart(4, '0')}`}</td>
                  <td style={{ padding: '10px 0', color: '#1A1714' }}>{o.listing?.project_name || '—'}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: mono }}>{fmt(o.total_amount || 0)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: o.status === 'completed' ? '#dcfce7' : o.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                      color: o.status === 'completed' ? '#166534' : o.status === 'cancelled' ? '#991b1b' : '#92400e',
                    }}>{(o.status || 'pending').replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>

      {/* Seller CTA if not approved */}
      {profile && String(profile.seller_status || '') !== 'approved' && (
        <div style={{ marginTop: '20px', background: '#1B3A2D', borderRadius: '14px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: fr, fontSize: '16px', color: '#F2ECE0', marginBottom: '4px' }}>Want to sell carbon credits?</h3>
            <p style={{ fontSize: '13px', color: '#8AAA92' }}>Apply for seller verification to list your credits on the marketplace</p>
          </div>
          <Link href="/dashboard/settings" style={{ fontSize: '13px', fontWeight: 600, color: '#1B3A2D', background: '#C9A96E', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none' }}>
            Apply Now
          </Link>
        </div>
      )}
    </div>
  );
}
