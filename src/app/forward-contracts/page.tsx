'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';

const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

function fmt(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

const CONTRACTS = [
  { id: 'FC-001', seller: 'Great Southern Carbon', credit: 'Forest Restoration (ARR)', volume: 10000, price: 24.50, delivery: '2026-09-30', insurance: true, status: 'awaiting' as const },
  { id: 'FC-002', seller: 'Queensland Carbon Projects', credit: 'Soil Carbon Initiative', volume: 5000, price: 16.80, delivery: '2026-12-15', insurance: false, status: 'in_progress' as const },
  { id: 'FC-003', seller: 'Abu Dhabi Mangroves Trust', credit: 'Blue Carbon Restoration', volume: 15000, price: 30.00, delivery: '2027-03-31', insurance: true, status: 'awaiting' as const },
];

const statusMap: Record<string, { label: string; bg: string; text: string }> = {
  awaiting: { label: 'Awaiting Delivery', bg: 'rgba(245,158,11,0.08)', text: '#F59E0B' },
  in_progress: { label: 'In Progress', bg: 'rgba(37,99,235,0.08)', text: '#2563EB' },
  delivered: { label: 'Delivered', bg: 'rgba(22,163,74,0.08)', text: '#16A34A' },
  defaulted: { label: 'Defaulted', bg: 'rgba(239,68,68,0.08)', text: '#EF4444' },
};

export default function ForwardContractsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const totalValue = CONTRACTS.reduce((s, c) => s + c.volume * c.price, 0);
  const totalVolume = CONTRACTS.reduce((s, c) => s + c.volume, 0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/forward-contracts');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <Navbar />
      <main>
        <div style={{ padding: '28px', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714' }}>Forward Contracts</h1>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '2px' }}>Secure future credit supply at agreed prices</p>
            </div>
            <button style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1B3A2D', color: '#FFFCF6' }}>+ New Forward Contract</button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Total Committed Value', value: fmt(totalValue), color: '#C9A96E' },
              { label: 'Total Volume', value: totalVolume.toLocaleString() + ' tCO₂e', color: '#1B3A2D' },
              { label: 'Active Contracts', value: String(CONTRACTS.length), color: '#2563EB' },
            ].map(m => (
              <div key={m.label} style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '10px', padding: '16px', borderLeft: '3px solid ' + m.color }}>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{m.label}</div>
                <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#1A1714', marginTop: '4px' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Contracts */}
          <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '12px' }}>
              <thead><tr style={{ background: '#FAFAF7' }}>
                {['Contract', 'Seller', 'Credit Type', 'Volume', 'Price/tCO₂e', 'Total Value', 'Delivery', 'Insurance', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{CONTRACTS.map(c => {
                const s = statusMap[c.status];
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F5F0E8' }}>
                    <td style={{ padding: '12px', fontFamily: mono, fontSize: '11px', fontWeight: 600, color: '#1A1714' }}>{c.id}</td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1A1714' }}>{c.seller}</td>
                    <td style={{ padding: '12px' }}><span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(27,58,45,0.06)', borderRadius: '4px', color: '#1B3A2D', fontWeight: 600 }}>{c.credit}</span></td>
                    <td style={{ padding: '12px', fontFamily: mono }}>{c.volume.toLocaleString()}</td>
                    <td style={{ padding: '12px', fontFamily: mono }}>{fmt(c.price)}</td>
                    <td style={{ padding: '12px', fontFamily: mono, fontWeight: 600 }}>{fmt(c.volume * c.price)}</td>
                    <td style={{ padding: '12px', color: '#8B8178' }}>{c.delivery}</td>
                    <td style={{ padding: '12px' }}>{c.insurance ? <span style={{ color: '#2D6A4F', fontWeight: 600 }}>✓ Covered</span> : <span style={{ color: '#C5BFB3' }}>—</span>}</td>
                    <td style={{ padding: '12px' }}><span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: s.bg, color: s.text }}>{s.label}</span></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
