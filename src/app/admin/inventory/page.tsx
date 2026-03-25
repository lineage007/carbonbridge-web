'use client';

import { useState } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

type InventoryItem = {
  id: string; project: string; type: string; registry: string;
  totalTonnes: number; available: number; reserved: number; sold: number;
  costBasis: number; listPrice: number; margin: number;
  vintage: number; rating: string; cbDirect: boolean;
};

const INVENTORY: InventoryItem[] = [
  { id: '1', project: 'Great Southern Forest', type: 'ARR', registry: 'Verra', totalTonnes: 50000, available: 35000, reserved: 2500, sold: 12500, costBasis: 18.00, listPrice: 26.40, margin: 31.8, vintage: 2024, rating: 'AA', cbDirect: true },
  { id: '2', project: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', registry: 'Verra', totalTonnes: 25000, available: 12000, reserved: 0, sold: 13000, costBasis: 22.00, listPrice: 32.50, margin: 32.3, vintage: 2025, rating: 'AAA', cbDirect: true },
  { id: '3', project: 'Kalimantan Peatland', type: 'REDD+', registry: 'Verra', totalTonnes: 100000, available: 65000, reserved: 15000, sold: 20000, costBasis: 8.50, listPrice: 12.80, margin: 33.6, vintage: 2024, rating: 'A', cbDirect: false },
  { id: '4', project: 'Queensland Soil Carbon', type: 'Soil Carbon', registry: 'ACR', totalTonnes: 30000, available: 22000, reserved: 0, sold: 8000, costBasis: 12.00, listPrice: 18.20, margin: 34.1, vintage: 2025, rating: 'AA', cbDirect: true },
  { id: '5', project: 'Kenya Cookstove Programme', type: 'Cookstove', registry: 'Gold Standard', totalTonnes: 80000, available: 72000, reserved: 0, sold: 8000, costBasis: 5.50, listPrice: 9.00, margin: 38.9, vintage: 2024, rating: 'BBB', cbDirect: false },
  { id: '6', project: 'Swiss DAC Alpha', type: 'DAC', registry: 'Verra', totalTonnes: 5000, available: 4800, reserved: 200, sold: 0, costBasis: 280.00, listPrice: 420.00, margin: 33.3, vintage: 2025, rating: 'AAA', cbDirect: true },
];

export default function AdminInventoryPage() {
  const [filter, setFilter] = useState<'all' | 'cb_direct' | 'third_party'>('all');

  const filtered = filter === 'all' ? INVENTORY
    : filter === 'cb_direct' ? INVENTORY.filter(i => i.cbDirect)
    : INVENTORY.filter(i => !i.cbDirect);

  const totalValue = INVENTORY.reduce((s, i) => s + i.available * i.listPrice, 0);
  const totalCost = INVENTORY.reduce((s, i) => s + (i.cbDirect ? i.available * i.costBasis : 0), 0);
  const cbDirectItems = INVENTORY.filter(i => i.cbDirect);
  const avgMargin = cbDirectItems.length > 0 ? cbDirectItems.reduce((s, i) => s + i.margin, 0) / cbDirectItems.length : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Inventory</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>Credit supply, reservations, CB Direct holdings</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Available inventory', value: `${(INVENTORY.reduce((s, i) => s + i.available, 0) / 1000).toFixed(0)}K tCO₂e`, color: '#F2ECE0' },
          { label: 'Inventory value', value: fmt(totalValue), color: '#16A34A' },
          { label: 'CB Direct cost basis', value: fmt(totalCost), color: '#C9A96E' },
          { label: 'Reserved (locked)', value: `${(INVENTORY.reduce((s, i) => s + i.reserved, 0) / 1000).toFixed(1)}K tCO₂e`, color: '#F59E0B' },
          { label: 'Avg CB Direct margin', value: `${avgMargin.toFixed(1)}%`, color: '#16A34A' },
        ].map(k => (
          <div key={k.label} style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ fontFamily: mono, fontSize: '20px', fontWeight: 700, color: k.color, marginTop: '4px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {[{ k: 'all', l: 'All credits' }, { k: 'cb_direct', l: 'CB Direct only' }, { k: 'third_party', l: 'Third-party' }].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k as typeof filter)} style={{
            fontFamily: bg, fontSize: '12px', fontWeight: filter === t.k ? 600 : 400,
            padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: filter === t.k ? 'rgba(201,169,110,0.1)' : 'transparent',
            color: filter === t.k ? '#C9A96E' : '#6B8A74',
          }}>{t.l}</button>
        ))}
      </div>

      {/* Inventory table */}
      <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                {['Project', 'Type', 'Registry', 'Vintage', 'Rating', 'Available', 'Reserved', 'Sold', 'List Price', 'Margin', 'Source'].map(h => (
                  <th key={h} style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textAlign: 'left', padding: '10px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const sellThrough = item.totalTonnes > 0 ? (item.sold / item.totalTonnes * 100) : 0;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                    <td style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', padding: '14px 12px', fontWeight: 500 }}>{item.project}</td>
                    <td style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92', padding: '14px 12px' }}>{item.type}</td>
                    <td style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92', padding: '14px 12px' }}>{item.registry}</td>
                    <td style={{ fontFamily: mono, fontSize: '11px', color: '#8AAA92', padding: '14px 12px' }}>{item.vintage}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ fontFamily: mono, fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                        background: item.rating === 'AAA' ? 'rgba(22,163,74,0.1)' : item.rating === 'AA' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                        color: item.rating === 'AAA' ? '#16A34A' : item.rating === 'AA' ? '#3B82F6' : '#F59E0B',
                      }}>{item.rating}</span>
                    </td>
                    <td style={{ fontFamily: mono, fontSize: '12px', color: '#F2ECE0', padding: '14px 12px' }}>{item.available.toLocaleString()}</td>
                    <td style={{ fontFamily: mono, fontSize: '12px', color: item.reserved > 0 ? '#F59E0B' : '#6B8A74', padding: '14px 12px' }}>{item.reserved > 0 ? item.reserved.toLocaleString() : '—'}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,252,246,0.04)', borderRadius: '2px' }}>
                          <div style={{ width: `${sellThrough}%`, height: '100%', background: '#2D6A4F', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontFamily: mono, fontSize: '10px', color: '#8AAA92' }}>{sellThrough.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: mono, fontSize: '12px', color: '#F2ECE0', padding: '14px 12px' }}>${item.listPrice.toFixed(2)}</td>
                    <td style={{ fontFamily: mono, fontSize: '12px', color: item.margin > 30 ? '#16A34A' : '#F59E0B', padding: '14px 12px' }}>{item.margin.toFixed(1)}%</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                        background: item.cbDirect ? 'rgba(201,169,110,0.1)' : 'rgba(255,252,246,0.04)',
                        color: item.cbDirect ? '#C9A96E' : '#6B8A74',
                      }}>{item.cbDirect ? 'CB Direct' : '3rd party'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
