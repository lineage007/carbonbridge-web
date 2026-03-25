'use client';
import Link from 'next/link';
const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

const CREDITS = [
  { id: 1, project: 'Abu Dhabi Blue Carbon Mangroves', type: 'Blue Carbon', registry: 'Verra', regId: 'VCS-3102', vintage: 2025, qty: 5000, cost: 29.00, current: 32.50, rating: 'AA', status: 'Held' },
  { id: 2, project: 'Great Southern Forest Restoration', type: 'ARR', registry: 'Verra', regId: 'VCS-2847', vintage: 2024, qty: 2500, cost: 23.20, current: 26.40, rating: 'AAA', status: 'Held' },
  { id: 3, project: 'Queensland Soil Carbon Initiative', type: 'Soil Carbon', registry: 'Gold Standard', regId: 'GS-9841', vintage: 2025, qty: 8000, cost: 16.50, current: 18.20, rating: 'A', status: 'Held' },
  { id: 4, project: 'Kalimantan Peatland Conservation', type: 'REDD+', registry: 'Verra', regId: 'VCS-1822', vintage: 2024, qty: 10000, cost: 11.50, current: 12.80, rating: 'BBB', status: 'Retired' },
];

export default function PortfolioPage() {
  const held = CREDITS.filter(c => c.status === 'Held');
  const totalValue = held.reduce((s, c) => s + c.qty * c.current, 0);
  const totalCost = held.reduce((s, c) => s + c.qty * c.cost, 0);
  const totalTonnes = held.reduce((s, c) => s + c.qty, 0);
  const pnl = totalValue - totalCost;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Portfolio</h1>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259' }}>Your carbon credit holdings and performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Value', val: fmt(totalValue), color: '#1B3A2D' },
          { label: 'Total Cost', val: fmt(totalCost), color: '#5A5248' },
          { label: 'Unrealised P&L', val: `${pnl >= 0 ? '+' : ''}${fmt(pnl)}`, color: pnl >= 0 ? '#16A34A' : '#EF4444' },
          { label: 'Credits Held', val: `${totalTonnes.toLocaleString()} tCO₂e`, color: '#2D6A4F' },
        ].map(k => (
          <div key={k.label} style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>{k.label}</div>
            <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F5F0E8' }}>
              {['Project', 'Type', 'Registry', 'Vintage', 'Qty (tCO₂e)', 'Avg Cost', 'Market Price', 'Value', 'P&L', 'Rating', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B6259', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CREDITS.map(c => {
              const val = c.qty * c.current;
              const pl = c.qty * (c.current - c.cost);
              return (
                <tr key={c.id} onClick={() => window.location.href = `/credits/${c.id}`} style={{ borderBottom: '1px solid #F0EBE0', cursor: 'pointer', transition: 'background 120ms' }} className="hover:bg-[#F5F0E8]">
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1B3A2D', textDecoration: 'underline', textDecorationColor: '#E5DED3' }}>{c.project}</td>
                  <td style={{ padding: '12px 14px' }}>{c.type}</td>
                  <td style={{ padding: '12px 14px', fontSize: '11px' }}>{c.regId}</td>
                  <td style={{ padding: '12px 14px', fontFamily: mono }}>{c.vintage}</td>
                  <td style={{ padding: '12px 14px', fontFamily: mono, fontWeight: 600 }}>{c.qty.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', fontFamily: mono }}>{fmt(c.cost)}</td>
                  <td style={{ padding: '12px 14px', fontFamily: mono }}>{fmt(c.current)}</td>
                  <td style={{ padding: '12px 14px', fontFamily: mono, fontWeight: 600 }}>{fmt(val)}</td>
                  <td style={{ padding: '12px 14px', fontFamily: mono, fontWeight: 600, color: pl >= 0 ? '#16A34A' : '#EF4444' }}>{pl >= 0 ? '+' : ''}{fmt(pl)}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ background: '#F5F0E8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{c.rating}</span></td>
                  <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '11px', fontWeight: 600, color: c.status === 'Held' ? '#1B3A2D' : '#8A7E70' }}>{c.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
