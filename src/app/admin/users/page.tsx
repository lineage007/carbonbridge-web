'use client';

import { useState } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

type UserRole = 'buyer' | 'seller' | 'both' | 'api_client';
type SellerStatus = 'pending' | 'approved' | 'suspended' | null;

type User = {
  id: string; company: string; contact: string; email: string;
  role: UserRole; sellerStatus: SellerStatus; country: string;
  joined: string; lastActive: string; totalSpend: number; totalSales: number;
  ordersCount: number; compliance: string[];
};

const USERS: User[] = [
  { id: '1', company: 'Emirates Industrial Group', contact: 'Ahmed Al-Rashidi', email: 'ahmed@eig.ae', role: 'buyer', sellerStatus: null, country: 'AE', joined: '15 Feb 2026', lastActive: '2 hours ago', totalSpend: 374100, totalSales: 0, ordersCount: 3, compliance: ['NRCC', 'CBAM'] },
  { id: '2', company: 'Abu Dhabi Airports', contact: 'Fatima Al-Ketbi', email: 'f.alketbi@adairports.ae', role: 'buyer', sellerStatus: null, country: 'AE', joined: '20 Feb 2026', lastActive: '5 hours ago', totalSpend: 192000, totalSales: 0, ordersCount: 1, compliance: ['CORSIA'] },
  { id: '3', company: 'GreenField Carbon Pty Ltd', contact: 'Marcus Reid', email: 'marcus@greenfieldcarbon.com.au', role: 'seller', sellerStatus: 'pending', country: 'AU', joined: '22 Mar 2026', lastActive: '3 days ago', totalSpend: 0, totalSales: 0, ordersCount: 0, compliance: [] },
  { id: '4', company: 'Masdar Clean Energy', contact: 'Omar Khoury', email: 'o.khoury@masdar.ae', role: 'both', sellerStatus: 'approved', country: 'AE', joined: '10 Jan 2026', lastActive: '1 hour ago', totalSpend: 260000, totalSales: 45000, ordersCount: 4, compliance: ['NRCC'] },
  { id: '5', company: 'ADNOC', contact: 'Khalid Al-Suwaidi', email: 'k.suwaidi@adnoc.ae', role: 'buyer', sellerStatus: null, country: 'AE', joined: '5 Mar 2026', lastActive: '1 day ago', totalSpend: 162500, totalSales: 0, ordersCount: 1, compliance: ['NRCC', 'CBAM'] },
  { id: '6', company: 'Emirates Steel Arkan', contact: 'Rashed Al-Nuaimi', email: 'r.nuaimi@emiratessteel.com', role: 'buyer', sellerStatus: null, country: 'AE', joined: '12 Mar 2026', lastActive: '6 hours ago', totalSpend: 128000, totalSales: 0, ordersCount: 1, compliance: ['CBAM'] },
  { id: '7', company: 'South Pole Group', contact: 'Lisa Chen', email: 'l.chen@southpole.com', role: 'seller', sellerStatus: 'approved', country: 'CH', joined: '1 Feb 2026', lastActive: '4 hours ago', totalSpend: 0, totalSales: 890000, ordersCount: 0, compliance: [] },
  { id: '8', company: 'TechFlow API', contact: 'Dev Team', email: 'dev@techflow.io', role: 'api_client', sellerStatus: null, country: 'SG', joined: '1 Mar 2026', lastActive: '10 min ago', totalSpend: 4200, totalSales: 0, ordersCount: 0, compliance: [] },
];

const ROLE_COLORS: Record<UserRole, { label: string; bg: string; text: string }> = {
  buyer: { label: 'Buyer', bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  seller: { label: 'Seller', bg: 'rgba(22,163,74,0.1)', text: '#16A34A' },
  both: { label: 'Buyer + Seller', bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6' },
  api_client: { label: 'API', bg: 'rgba(201,169,110,0.1)', text: '#C9A96E' },
};

const SELLER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  approved: { bg: 'rgba(22,163,74,0.1)', text: '#16A34A' },
  suspended: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
};

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<'all' | UserRole | 'pending'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = filter === 'all' ? USERS
    : filter === 'pending' ? USERS.filter(u => u.sellerStatus === 'pending')
    : USERS.filter(u => u.role === filter);

  const pendingCount = USERS.filter(u => u.sellerStatus === 'pending').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Users</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>{USERS.length} registered · {pendingCount} pending verification</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: `All (${USERS.length})` },
          { key: 'buyer', label: `Buyers (${USERS.filter(u => u.role === 'buyer').length})` },
          { key: 'seller', label: `Sellers (${USERS.filter(u => ['seller', 'both'].includes(u.role)).length})` },
          { key: 'api_client', label: `API (${USERS.filter(u => u.role === 'api_client').length})` },
          { key: 'pending', label: `Pending (${pendingCount})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key as typeof filter)}
            style={{
              fontFamily: bg, fontSize: '12px', fontWeight: filter === t.key ? 600 : 400,
              padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: filter === t.key ? 'rgba(201,169,110,0.1)' : 'transparent',
              color: filter === t.key ? '#C9A96E' : '#6B8A74',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(u => {
          const rc = ROLE_COLORS[u.role];
          return (
            <div key={u.id} onClick={() => setSelected(selected === u.id ? null : u.id)}
              style={{
                background: selected === u.id ? 'rgba(201,169,110,0.03)' : 'rgba(255,252,246,0.02)',
                border: `1px solid ${selected === u.id ? 'rgba(201,169,110,0.12)' : 'rgba(201,169,110,0.06)'}`,
                borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(201,169,110,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#C9A96E' }}>
                    {u.company.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0' }}>{u.company}</div>
                    <div style={{ fontFamily: bg, fontSize: '12px', color: '#6B8A74' }}>{u.contact} · {u.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: rc.bg, color: rc.text }}>{rc.label}</span>
                  {u.sellerStatus && (
                    <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', ...(SELLER_STATUS_COLORS[u.sellerStatus] || {}) }}>
                      {u.sellerStatus === 'pending' ? '⏳ Pending review' : u.sellerStatus}
                    </span>
                  )}
                  {u.totalSpend > 0 && <span style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92' }}>{fmt(u.totalSpend)}</span>}
                </div>
              </div>

              {/* Expanded detail */}
              {selected === u.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(201,169,110,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {[
                      { l: 'Country', v: u.country },
                      { l: 'Joined', v: u.joined },
                      { l: 'Last active', v: u.lastActive },
                      { l: 'Total spend', v: fmt(u.totalSpend) },
                      { l: 'Total sales', v: fmt(u.totalSales) },
                      { l: 'Orders', v: u.ordersCount.toString() },
                      { l: 'Compliance', v: u.compliance.length > 0 ? u.compliance.join(', ') : '—' },
                    ].map(d => (
                      <div key={d.l}>
                        <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.l}</div>
                        <div style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', marginTop: '2px' }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {u.sellerStatus === 'pending' && (
                      <>
                        <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#16A34A', color: 'white' }}>Approve seller</button>
                        <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', background: 'transparent', color: '#EF4444' }}>Reject</button>
                      </>
                    )}
                    <button style={{ fontFamily: bg, fontSize: '12px', padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(201,169,110,0.15)', cursor: 'pointer', background: 'transparent', color: '#C9A96E' }}>View activity</button>
                    <button style={{ fontFamily: bg, fontSize: '12px', padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(201,169,110,0.15)', cursor: 'pointer', background: 'transparent', color: '#C9A96E' }}>Contact</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
