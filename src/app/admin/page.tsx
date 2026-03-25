'use client';

import { useState } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

// Demo data
const METRICS = [
  { label: 'Gross Volume', value: '$2.4M', sub: '$340K this month', trend: '+18%', color: '#1B3A2D', sparkData: [30, 42, 38, 55, 48, 68] },
  { label: 'Net Revenue', value: '$186K', sub: '$28K this month', trend: '+12%', color: '#16A34A', sparkData: [12, 18, 15, 22, 20, 28] },
  { label: 'Pending Settlements', value: '3', sub: '$94K at risk', trend: '', color: '#F59E0B', urgent: true, sparkData: [] },
  { label: 'Active Users', value: '47', sub: '124 total registered', trend: '+8%', color: '#4A6A7A', sparkData: [18, 22, 28, 31, 38, 47] },
  { label: 'Credits Traded', value: '142K tCO₂e', sub: '18K this month', trend: '+22%', color: '#2D6A4F', sparkData: [8, 12, 14, 16, 15, 18] },
  { label: 'CB Direct Margin', value: '24.3%', sub: '$12.4K this month', trend: '', color: '#1B3A2D', healthy: true, sparkData: [22, 25, 21, 28, 23, 24] },
];

type Alert = { id: string; priority: 'red' | 'amber' | 'blue'; type: string; title: string; time: string; actionUrl: string };

const ALERTS: Alert[] = [
  { id: '1', priority: 'red', type: 'Settlement overdue', title: 'CB-2026-00142 — transfer not initiated (52h)', time: '52 hours', actionUrl: '/admin/orders' },
  { id: '2', priority: 'red', type: 'Agreement expiring', title: 'PA-2026-00089 — bank transfer due in 8h', time: '8 hours', actionUrl: '/admin/orders' },
  { id: '3', priority: 'amber', type: 'New orders', title: '2 orders awaiting processing', time: '3 hours', actionUrl: '/admin/orders' },
  { id: '4', priority: 'amber', type: 'Seller pending', title: 'GreenField Carbon — application 3 days old', time: '3 days', actionUrl: '/admin/users' },
  { id: '5', priority: 'amber', type: 'Listing pending', title: 'Borneo Peatland REDD+ — awaiting review', time: '1 day', actionUrl: '/admin/listings' },
  { id: '6', priority: 'amber', type: 'Inventory low', title: 'Blue Carbon — only 2,400 tCO₂e remaining', time: '', actionUrl: '/admin/inventory' },
  { id: '7', priority: 'blue', type: 'New registration', title: 'Emirates Steel Industries signed up', time: '2 hours', actionUrl: '/admin/users' },
  { id: '8', priority: 'blue', type: 'Completed', title: 'CB-2026-00138 settled — $128K, 10K tCO₂e', time: '6 hours', actionUrl: '/admin/orders' },
  { id: '9', priority: 'blue', type: 'Milestone', title: '🎉 Platform crossed $2M total volume', time: '1 day', actionUrl: '/admin/analytics' },
];

const PRIORITY_STYLES = {
  red: { bg: 'rgba(239,68,68,0.06)', border: '#EF4444', label: '#EF4444', labelBg: 'rgba(239,68,68,0.1)' },
  amber: { bg: 'rgba(201,169,110,0.04)', border: '#C9A96E', label: '#C9A96E', labelBg: 'rgba(201,169,110,0.1)' },
  blue: { bg: 'rgba(74,106,122,0.04)', border: '#4A6A7A', label: '#4A6A7A', labelBg: 'rgba(74,106,122,0.1)' },
};

// Simple sparkline SVG
function Sparkline({ data, color, w = 60, h = 24 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminCommandCentre() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [tab, setTab] = useState<'all' | 'red' | 'amber' | 'blue'>('all');

  const dismiss = (id: string) => setAlerts(a => a.filter(x => x.id !== id));
  const filtered = tab === 'all' ? alerts : alerts.filter(a => a.priority === tab);
  const redCount = alerts.filter(a => a.priority === 'red').length;

  return (
    <div>
      {/* Gradient accent */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #1B3A2D, #C9A96E, #4A6A7A)', borderRadius: '2px', marginBottom: '28px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Command Centre</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>Platform overview · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        {redCount > 0 && (
          <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '6px 14px', borderRadius: '8px', animation: 'pulse 2s infinite' }}>
            {redCount} action{redCount > 1 ? 's' : ''} needed
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {METRICS.map(m => (
          <div key={m.label} style={{
            background: m.urgent ? 'rgba(245,158,11,0.04)' : 'rgba(255,252,246,0.02)',
            border: `1px solid ${m.urgent ? 'rgba(245,158,11,0.15)' : 'rgba(201,169,110,0.06)'}`,
            borderRadius: '12px', padding: '18px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              {m.sparkData.length > 0 && <Sparkline data={m.sparkData} color={m.color} />}
            </div>
            <div style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>{m.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74' }}>{m.sub}</span>
              {m.trend && <span style={{ fontFamily: mono, fontSize: '11px', color: '#16A34A' }}>{m.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#F2ECE0' }}>Alerts &amp; Actions</h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'red', 'amber', 'blue'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily: bg, fontSize: '11px', fontWeight: tab === t ? 700 : 400,
                padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: tab === t ? 'rgba(201,169,110,0.1)' : 'transparent',
                color: tab === t ? '#C9A96E' : '#6B8A74',
              }}>
                {t === 'all' ? `All (${alerts.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${alerts.filter(a => a.priority === t).length})`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(alert => {
            const s = PRIORITY_STYLES[alert.priority];
            return (
              <Link key={alert.id} href={alert.actionUrl} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '10px',
                background: s.bg, borderLeft: `3px solid ${s.border}`,
                textDecoration: 'none', transition: 'all 150ms',
              }} className="hover:brightness-110">
                <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: s.label, background: s.labelBg, padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  {alert.type}
                </span>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', flex: 1 }}>{alert.title}</span>
                {alert.time && <span style={{ fontFamily: mono, fontSize: '11px', color: '#6B8A74', whiteSpace: 'nowrap' }}>{alert.time}</span>}
                <button onClick={(e) => { e.preventDefault(); dismiss(alert.id); }} style={{ background: 'none', border: 'none', color: '#6B8A74', cursor: 'pointer', fontSize: '14px' }}>✕</button>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ fontFamily: bg, fontSize: '14px', color: '#6B8A74', textAlign: 'center', padding: '40px 0' }}>All clear — no pending alerts ✓</div>
          )}
        </div>
      </div>

      {/* Transaction Pipeline Preview */}
      <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#F2ECE0' }}>Transaction Pipeline</h2>
          <Link href="/admin/orders" style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {[
            { stage: 'Order Placed', count: 2, value: '$94K', color: '#4A6A7A' },
            { stage: 'Payment Received', count: 1, value: '$66K', color: '#C9A96E' },
            { stage: 'Transfer In Progress', count: 1, value: '$128K', color: '#2D6A4F' },
            { stage: 'Credits Delivered', count: 0, value: '$0', color: '#16A34A' },
            { stage: 'Completed', count: 14, value: '$1.8M', color: '#1B3A2D' },
          ].map(s => (
            <div key={s.stage} style={{ background: 'rgba(255,252,246,0.02)', borderRadius: '10px', padding: '16px 14px', borderTop: `2px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#F2ECE0' }}>{s.count}</div>
              <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', marginTop: '4px' }}>{s.stage}</div>
              <div style={{ fontFamily: mono, fontSize: '11px', color: '#8A7E70', marginTop: '2px' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
