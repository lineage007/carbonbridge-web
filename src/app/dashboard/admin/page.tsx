'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminStats } from '@/lib/db';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', color: '#1A1714', marginBottom: '2px' }}>Command Centre</h1>
          <p style={{ fontSize: '12px', color: '#8A7E70' }}>CarbonBridge Admin Dashboard</p>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '4px 10px', borderRadius: '4px' }}>SUPER ADMIN</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Gross Volume', value: loading ? '...' : fmt(stats?.totalGmv || 0), color: '#1B3A2D' },
          { label: 'Pending Settlements', value: loading ? '...' : String(stats?.pendingSettlements || 0), color: (stats?.pendingSettlements || 0) > 0 ? '#dc2626' : '#2D6A4F' },
          { label: 'Registered Users', value: loading ? '...' : String(stats?.totalUsers || 0), color: '#C9A96E' },
          { label: 'Credits Listed', value: loading ? '...' : `${(stats?.totalCredits || 0).toLocaleString()} tCO₂e`, color: '#2D6A4F' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderLeft: `4px solid ${kpi.color}` }}>
            <div style={{ fontSize: '11px', color: '#8A7E70', marginBottom: '4px' }}>{kpi.label}</div>
            <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#1A1714' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Orders', href: '/dashboard/admin/orders', icon: '▤', desc: 'Review and process transactions' },
          { label: 'Listings', href: '/dashboard/admin/listings', icon: '▣', desc: 'Moderate credit listings' },
          { label: 'Users', href: '/dashboard/admin/users', icon: '◇', desc: 'Manage accounts & verification' },
          { label: 'Financials', href: '/dashboard/admin/financials', icon: '◈', desc: 'Revenue, P&L, cash flow' },
          { label: 'Analytics', href: '/dashboard/admin/analytics', icon: '◉', desc: 'Usage and performance data' },
          { label: 'Inventory', href: '/dashboard/admin/inventory', icon: '▦', desc: 'CB Direct credit inventory' },
        ].map(link => (
          <Link key={link.label} href={link.href} style={{
            background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px',
            textDecoration: 'none', transition: 'border-color 120ms',
          }} className="hover:border-[#C9A96E]">
            <span style={{ fontSize: '20px' }}>{link.icon}</span>
            <h3 style={{ fontFamily: fr, fontSize: '15px', color: '#1A1714', marginTop: '8px', marginBottom: '4px' }}>{link.label}</h3>
            <p style={{ fontSize: '12px', color: '#8A7E70' }}>{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity — from real data */}
      {!loading && stats?.orders?.length > 0 && (
        <div style={{ marginTop: '24px', background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '20px' }}>
          <h2 style={{ fontFamily: fr, fontSize: '16px', color: '#1A1714', marginBottom: '12px' }}>Recent Transactions</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead><tr style={{ borderBottom: '1px solid #E5DED3' }}>
              {['Date', 'Amount', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 0', textAlign: h === 'Date' ? 'left' : 'right', fontSize: '10px', fontWeight: 700, color: '#8A7E70', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {stats.orders.slice(0, 10).map((o: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                  <td style={{ padding: '10px 0', color: '#5A5248' }}>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: mono }}>{fmt(o.total_amount || 0)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: o.status === 'completed' ? '#dcfce7' : o.status === 'pending' ? '#fef3c7' : '#e0e7ff',
                      color: o.status === 'completed' ? '#166534' : o.status === 'pending' ? '#92400e' : '#3730a3',
                    }}>{(o.status || 'pending').replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
