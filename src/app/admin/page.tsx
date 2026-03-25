'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

function fmt(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 }); }

type Tab = 'overview' | 'orders' | 'listings' | 'users' | 'revenue' | 'claims';

// Mock data
const METRICS = [
  { label: 'Transaction Volume', value: '$2.4M', change: '+18%', color: '#2D6A4F' },
  { label: 'Revenue Earned', value: '$186K', change: '+12%', color: '#C9A96E' },
  { label: 'Active Listings', value: '47', change: '+5', color: '#1B3A2D' },
  { label: 'Registered Users', value: '312', change: '+23', color: '#2563EB' },
  { label: 'Pending Orders', value: '8', change: '', color: '#EF4444' },
  { label: 'Pending Approvals', value: '3', change: '', color: '#F59E0B' },
];

const ORDERS = [
  { id: 'CB-2026-00289', date: '2026-03-24', buyer: 'Emirates Industrial Group', seller: 'Great Southern Carbon', credit: 'Forest Restoration', type: 'ARR', qty: 5000, total: 132000, insurance: ['non_delivery'], paymentStatus: 'received' as const, transferStatus: 'in_progress' as const, status: 'transfer_in_progress' as const },
  { id: 'CB-2026-00288', date: '2026-03-24', buyer: 'Etihad Airways', seller: 'CarbonBridge Direct', credit: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 15000, total: 487500, insurance: ['non_delivery', 'corsia_guarantee'], paymentStatus: 'pending' as const, transferStatus: 'not_started' as const, status: 'new' as const },
  { id: 'CB-2026-00285', date: '2026-03-23', buyer: 'ADNOC Logistics', seller: 'Queensland Carbon Projects', credit: 'Soil Carbon Initiative', type: 'Soil Carbon', qty: 8000, total: 145600, insurance: [], paymentStatus: 'received' as const, transferStatus: 'completed' as const, status: 'completed' as const },
  { id: 'CB-2026-00280', date: '2026-03-22', buyer: 'Dubai Properties', seller: 'Kalimantan Conservation', credit: 'Peatland Conservation', type: 'REDD+', qty: 10000, total: 128000, insurance: ['non_delivery'], paymentStatus: 'received' as const, transferStatus: 'completed' as const, status: 'completed' as const },
  { id: 'CB-2026-00275', date: '2026-03-21', buyer: 'Emirates Steel', seller: 'CarbonBridge Direct', credit: 'WA Biochar Facility', type: 'Biochar', qty: 3000, total: 135000, insurance: ['invalidation'], paymentStatus: 'received' as const, transferStatus: 'not_started' as const, status: 'payment_received' as const },
];

const PENDING_SELLERS = [
  { name: 'Kalimantan Conservation', email: 'ops@kalcon.id', registry: 'Verra VCS-2847', projects: 3, date: '2026-03-23' },
  { name: 'East African Cookstoves', email: 'admin@eacookstoves.org', registry: 'Gold Standard GS-4521', projects: 1, date: '2026-03-24' },
  { name: 'Abu Dhabi Mangroves Trust', email: 'partnerships@admt.ae', registry: 'Verra VCS-5103', projects: 2, date: '2026-03-25' },
];

const ACTIVITY = [
  { time: '10:42', action: 'New order', detail: 'CB-2026-00288 — Etihad Airways, 15,000 tCO₂e Blue Carbon', type: 'order' },
  { time: '10:38', action: 'Payment received', detail: 'CB-2026-00289 — Emirates Industrial, $132,000 (bank transfer)', type: 'payment' },
  { time: '09:55', action: 'Seller application', detail: 'Abu Dhabi Mangroves Trust applied as seller', type: 'user' },
  { time: '09:30', action: 'Listing submitted', detail: 'Queensland Soil Carbon Initiative — pending review', type: 'listing' },
  { time: '09:12', action: 'Credit transfer complete', detail: 'CB-2026-00285 — 8,000 tCO₂e Soil Carbon to ADNOC Logistics', type: 'transfer' },
  { time: '08:45', action: 'New registration', detail: 'Masdar Clean Energy — buyer account', type: 'user' },
  { time: '08:20', action: 'Retirement processed', detail: 'API client: Rotana Hotels — 42 tCO₂e monthly batch', type: 'retirement' },
  { time: '07:50', action: 'Insurance claim', detail: 'CLM-2026-0012 — submitted by Dubai Properties', type: 'claim' },
];

const statusColor = (s: string) => {
  switch (s) {
    case 'new': return { bg: 'rgba(37,99,235,0.08)', text: '#2563EB' };
    case 'payment_received': return { bg: 'rgba(201,169,110,0.1)', text: '#C9A96E' };
    case 'transfer_in_progress': return { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B' };
    case 'completed': return { bg: 'rgba(22,163,74,0.08)', text: '#16A34A' };
    case 'cancelled': case 'refunded': return { bg: 'rgba(239,68,68,0.08)', text: '#EF4444' };
    default: return { bg: 'rgba(0,0,0,0.04)', text: '#8B8178' };
  }
};

const activityIcon = (type: string) => {
  switch (type) {
    case 'order': return '🛒'; case 'payment': return '💳'; case 'user': return '👤';
    case 'listing': return '📋'; case 'transfer': return '✅'; case 'retirement': return '🌱';
    case 'claim': return '🛡️'; default: return '•';
  }
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const Badge = ({ status }: { status: string }) => {
    const c = statusColor(status);
    return <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: c.bg, color: c.text }}>{status.replace(/_/g, ' ')}</span>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, background: '#FAFAF7', overflow: 'auto' }}>
        <div style={{ padding: '28px', maxWidth: '1400px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1A1714' }}>Admin Panel</h1>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '2px' }}>Platform operations centre</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['overview', 'orders', 'listings', 'users', 'revenue', 'claims'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  fontFamily: bg, fontSize: '12px', fontWeight: tab === t ? 600 : 400, padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  color: tab === t ? '#1B3A2D' : '#8B8178', background: tab === t ? 'rgba(27,58,45,0.06)' : 'transparent',
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
          </div>

          {tab === 'overview' && (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" style={{ marginBottom: '24px' }}>
                {METRICS.map(m => (
                  <div key={m.label} style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '10px', padding: '16px', borderLeft: `3px solid ${m.color}` }}>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#1A1714' }}>{m.value}</div>
                    {m.change && <div style={{ fontFamily: bg, fontSize: '11px', color: '#2D6A4F', marginTop: '2px' }}>{m.change} this month</div>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pending actions */}
                <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px' }}>
                  <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>⚡ Requires Action</h2>
                  {ORDERS.filter(o => o.status !== 'completed').map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0EDE6' }}>
                      <div>
                        <div style={{ fontFamily: mono, fontSize: '12px', color: '#1A1714', fontWeight: 600 }}>{o.id}</div>
                        <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{o.buyer} · {o.qty.toLocaleString()} tCO₂e</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge status={o.status} />
                        <button onClick={() => { setTab('orders'); setSelectedOrder(o.id); }} style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity feed */}
                <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px' }}>
                  <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>📋 Recent Activity</h2>
                  {ACTIVITY.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F0EDE6' }}>
                      <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{activityIcon(a.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{a.action}</div>
                        <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{a.detail}</div>
                      </div>
                      <span style={{ fontFamily: mono, fontSize: '10px', color: '#C5BFB3' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending seller approvals */}
              <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
                <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>🔎 Pending Seller Approvals ({PENDING_SELLERS.length})</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '13px' }}>
                    <thead><tr style={{ borderBottom: '1px solid #E8E2D8' }}>
                      {['Company', 'Email', 'Registry', 'Projects', 'Applied', 'Actions'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{PENDING_SELLERS.map(s => (
                      <tr key={s.name} style={{ borderBottom: '1px solid #F5F0E8' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1A1714' }}>{s.name}</td>
                        <td style={{ padding: '10px 12px', color: '#8B8178' }}>{s.email}</td>
                        <td style={{ padding: '10px 12px' }}><span style={{ fontFamily: mono, fontSize: '11px', padding: '2px 8px', background: 'rgba(27,58,45,0.06)', borderRadius: '4px', color: '#1B3A2D' }}>{s.registry}</span></td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{s.projects}</td>
                        <td style={{ padding: '10px 12px', color: '#8B8178', fontSize: '12px' }}>{s.date}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#1B3A2D', color: '#FFFCF6' }}>Approve</button>
                            <button style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '6px', border: '1px solid #E8E2D8', cursor: 'pointer', background: '#fff', color: '#8B8178' }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'orders' && (
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E2D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714' }}>Order Management</h2>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['All', 'New', 'Payment received', 'Transfer in progress', 'Completed'].map(f => (
                    <button key={f} style={{ fontFamily: bg, fontSize: '11px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #E8E2D8', background: f === 'All' ? 'rgba(27,58,45,0.06)' : '#fff', color: f === 'All' ? '#1B3A2D' : '#8B8178', cursor: 'pointer' }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '12px' }}>
                  <thead><tr style={{ background: '#FAFAF7' }}>
                    {['Order', 'Date', 'Buyer', 'Seller', 'Credit', 'Qty', 'Total', 'Insurance', 'Payment', 'Transfer', 'Status'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{ORDERS.map(o => (
                    <tr key={o.id} onClick={() => setSelectedOrder(o.id === selectedOrder ? null : o.id)} style={{ borderBottom: '1px solid #F5F0E8', cursor: 'pointer', background: selectedOrder === o.id ? 'rgba(201,169,110,0.04)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontFamily: mono, fontWeight: 600, color: '#1A1714', fontSize: '11px' }}>{o.id}</td>
                      <td style={{ padding: '10px 12px', color: '#8B8178', whiteSpace: 'nowrap' }}>{o.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1A1714' }}>{o.buyer}</td>
                      <td style={{ padding: '10px 12px', color: o.seller === 'CarbonBridge Direct' ? '#C9A96E' : '#8B8178' }}>{o.seller}</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(27,58,45,0.06)', borderRadius: '4px', color: '#1B3A2D', fontWeight: 600 }}>{o.type}</span> {o.credit}</td>
                      <td style={{ padding: '10px 12px', fontFamily: mono, textAlign: 'right' }}>{o.qty.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', fontFamily: mono, fontWeight: 600 }}>{fmt(o.total)}</td>
                      <td style={{ padding: '10px 12px' }}>{o.insurance.length > 0 ? o.insurance.map(i => <span key={i} style={{ fontSize: '9px', padding: '2px 5px', background: 'rgba(201,169,110,0.08)', borderRadius: '3px', color: '#C9A96E', fontWeight: 600, marginRight: '3px' }}>{i.replace('_', ' ')}</span>) : <span style={{ color: '#C5BFB3' }}>—</span>}</td>
                      <td style={{ padding: '10px 12px' }}><Badge status={o.paymentStatus} /></td>
                      <td style={{ padding: '10px 12px' }}><Badge status={o.transferStatus} /></td>
                      <td style={{ padding: '10px 12px' }}><Badge status={o.status} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {/* Selected order detail */}
              {selectedOrder && (() => {
                const o = ORDERS.find(x => x.id === selectedOrder)!;
                return (
                  <div style={{ padding: '20px', borderTop: '2px solid #C9A96E', background: 'rgba(201,169,110,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontFamily: mono, fontSize: '16px', fontWeight: 700, color: '#1A1714' }}>{o.id}</div>
                        <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '2px' }}>{o.buyer} → {o.seller} · {o.qty.toLocaleString()} tCO₂e {o.type} · {fmt(o.total)}</div>
                      </div>
                      <Badge status={o.status} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {o.paymentStatus === 'pending' && <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#2D6A4F', color: '#fff' }}>✓ Confirm Payment Received</button>}
                      {o.paymentStatus === 'received' && o.transferStatus === 'not_started' && <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1B3A2D', color: '#FFFCF6' }}>↗ Initiate Credit Transfer</button>}
                      {o.transferStatus === 'in_progress' && <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#16A34A', color: '#fff' }}>✓ Confirm Transfer Complete</button>}
                      <button style={{ fontFamily: bg, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8E2D8', cursor: 'pointer', background: '#fff', color: '#8B8178' }}>📧 Contact Buyer</button>
                      <button style={{ fontFamily: bg, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8E2D8', cursor: 'pointer', background: '#fff', color: '#8B8178' }}>📧 Contact Seller</button>
                      <button style={{ fontFamily: bg, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8E2D8', cursor: 'pointer', background: '#fff', color: '#EF4444' }}>✕ Cancel Order</button>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', display: 'block', marginBottom: '4px' }}>Internal Notes</label>
                      <textarea style={{ width: '100%', height: '60px', padding: '8px 12px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '12px', resize: 'vertical', outline: 'none' }} placeholder="Add a note visible only to admin team..." />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {tab === 'listings' && (
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Listing Moderation</h2>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>Review submitted listings, approve or reject, and manage CarbonBridge Direct inventory.</p>
              <div style={{ marginTop: '16px', padding: '40px', textAlign: 'center', color: '#C5BFB3' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
                <div style={{ fontFamily: bg, fontSize: '13px' }}>3 listings pending review</div>
                <div style={{ fontFamily: bg, fontSize: '11px', marginTop: '4px' }}>Connected to Supabase — listings will appear here</div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>User Management</h2>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>View all registered users, approve sellers, manage roles.</p>
              <div style={{ marginTop: '16px', padding: '40px', textAlign: 'center', color: '#C5BFB3' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
                <div style={{ fontFamily: bg, fontSize: '13px' }}>312 registered users</div>
                <div style={{ fontFamily: bg, fontSize: '11px', marginTop: '4px' }}>Connected to Supabase Auth — user data will populate here</div>
              </div>
            </div>
          )}

          {tab === 'revenue' && (
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Revenue Tracking</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '20px' }}>
                {[{ l: 'Marketplace Take Rate', v: '$124,800', p: '67%' }, { l: 'Insurance Commissions', v: '$38,200', p: '20%' }, { l: 'CarbonBridge Direct Spread', v: '$23,400', p: '13%' }].map(r => (
                  <div key={r.l} style={{ padding: '16px', border: '1px solid #E8E2D8', borderRadius: '10px' }}>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{r.l}</div>
                    <div style={{ fontFamily: mono, fontSize: '24px', fontWeight: 700, color: '#1A1714', marginTop: '4px' }}>{r.v}</div>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#2D6A4F' }}>{r.p} of total</div>
                  </div>
                ))}
              </div>
              <button style={{ fontFamily: bg, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8E2D8', cursor: 'pointer', background: '#fff', color: '#1B3A2D', fontWeight: 600 }}>↓ Export CSV</button>
            </div>
          )}

          {tab === 'claims' && (
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Insurance Claims</h2>
              <div style={{ padding: '40px', textAlign: 'center', color: '#C5BFB3' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛡️</div>
                <div style={{ fontFamily: bg, fontSize: '13px' }}>1 active claim</div>
                <div style={{ fontFamily: bg, fontSize: '11px', marginTop: '4px' }}>Claims management — track, route to insurer, update status</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
