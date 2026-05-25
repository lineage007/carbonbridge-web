'use client';

import { useState, useEffect } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

interface RevenueStats {
  totalGmv: number;
  totalPlatformFees: number;
  settledOrders: number;
  retiredOrders: number;
  pendingOrders: number;
  recentOrders: Array<{
    id: string;
    project_name: string;
    credit_type: string;
    quantity: number;
    total_amount: number;
    platform_fee_amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => {
        const orders = data.orders || [];
        const settled = orders.filter((o: any) => ['settled', 'retired'].includes(o.status));
        const totalGmv = settled.reduce((s: number, o: any) => s + (o.total_amount || 0), 0);
        const totalPlatformFees = settled.reduce((s: number, o: any) => s + (o.platform_fee_amount || 0), 0);
        setStats({
          totalGmv,
          totalPlatformFees,
          settledOrders: orders.filter((o: any) => o.status === 'settled').length,
          retiredOrders: orders.filter((o: any) => o.status === 'retired').length,
          pendingOrders: orders.filter((o: any) => ['pending_kyc', 'pending_payment', 'payment_processing'].includes(o.status)).length,
          recentOrders: orders.slice(0, 20),
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const metricCards = stats ? [
    { label: 'Total GMV (settled + retired)', value: fmt(stats.totalGmv), sub: 'All-time confirmed transactions' },
    { label: 'Platform Fees Earned (3%)', value: fmt(stats.totalPlatformFees), sub: 'At 3% commission rate' },
    { label: 'Orders Settled', value: stats.settledOrders.toString(), sub: 'Awaiting registry transfer' },
    { label: 'Orders Retired', value: stats.retiredOrders.toString(), sub: 'Registry transfer confirmed' },
    { label: 'Pipeline (KYC + Payment)', value: stats.pendingOrders.toString(), sub: 'In-progress orders' },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Revenue Dashboard</h1>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>
          Live data from cb_orders table · Commission rate: 3% (configurable per seller)
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B8A74', fontFamily: bg, fontSize: '14px' }}>
          Loading from database...
        </div>
      ) : !stats ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B8A74', fontFamily: bg, fontSize: '14px' }}>
          Unable to load revenue data. Check admin permissions.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {metricCards.map(card => (
              <div key={card.label} style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{card.label}</div>
                <div style={{ fontFamily: fr, fontSize: '26px', fontWeight: 700, color: '#F2ECE0', marginBottom: '4px' }}>{card.value}</div>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#F2ECE0', marginBottom: '16px' }}>Recent Orders (Audit Log)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                    {['Date', 'Project', 'Type', 'Quantity', 'GMV', 'Platform Fee', 'Status'].map(h => (
                      <th key={h} style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '8px 12px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '11px', color: '#6B8A74' }}>
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#C4B8A8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.project_name}</td>
                      <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>{order.credit_type}</td>
                      <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#D4C9BA' }}>{order.quantity.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#D4C9BA' }}>{fmt(order.total_amount)}</td>
                      <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>{fmt(order.platform_fee_amount || 0)}</td>
                      <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: ['settled', 'retired'].includes(order.status) ? '#22C55E' : '#8AAA92' }}>
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
