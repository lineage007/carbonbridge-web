'use client';

import { useState } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

type Period = '1m' | '3m' | '6m' | 'ytd' | 'all';

const MONTHLY_DATA = [
  { month: 'Oct 2025', gmv: 45000, revenue: 6750, cogs: 1200, insurance: 890, apiRev: 0, cbDirect: 2100, grossProfit: 8540, opex: 4200, netProfit: 4340 },
  { month: 'Nov 2025', gmv: 72000, revenue: 10800, cogs: 1800, insurance: 1420, apiRev: 120, cbDirect: 3400, grossProfit: 13940, opex: 4600, netProfit: 9340 },
  { month: 'Dec 2025', gmv: 58000, revenue: 8700, cogs: 1500, insurance: 1100, apiRev: 280, cbDirect: 2800, grossProfit: 11380, opex: 4400, netProfit: 6980 },
  { month: 'Jan 2026', gmv: 124000, revenue: 18600, cogs: 3100, insurance: 2480, apiRev: 540, cbDirect: 5200, grossProfit: 23720, opex: 5100, netProfit: 18620 },
  { month: 'Feb 2026', gmv: 198000, revenue: 29700, cogs: 4800, insurance: 3960, apiRev: 890, cbDirect: 8100, grossProfit: 37850, opex: 5800, netProfit: 32050 },
  { month: 'Mar 2026', gmv: 356500, revenue: 53475, cogs: 8200, insurance: 7130, apiRev: 1420, cbDirect: 14200, grossProfit: 68025, opex: 6800, netProfit: 61225 },
];

const REVENUE_STREAMS = [
  { name: 'Marketplace take rate', pct: 42, amount: 127425, color: '#2D6A4F' },
  { name: 'CarbonBridge Direct spread', pct: 28, amount: 35800, color: '#C9A96E' },
  { name: 'Insurance commissions', pct: 13, amount: 16980, color: '#3B82F6' },
  { name: 'API revenue', pct: 3, amount: 3250, color: '#8B5CF6' },
  { name: 'Managed procurement fees', pct: 10, amount: 12800, color: '#F59E0B' },
  { name: 'Data subscriptions', pct: 4, amount: 4800, color: '#6B8A74' },
];

export default function AdminFinancialsPage() {
  const [period, setPeriod] = useState<Period>('all');
  const [tab, setTab] = useState<'pnl' | 'revenue' | 'cashflow'>('pnl');

  const data = period === '1m' ? MONTHLY_DATA.slice(-1)
    : period === '3m' ? MONTHLY_DATA.slice(-3)
    : period === '6m' ? MONTHLY_DATA.slice(-6)
    : MONTHLY_DATA;

  const totals = data.reduce((acc, d) => ({
    gmv: acc.gmv + d.gmv,
    revenue: acc.revenue + d.revenue,
    cogs: acc.cogs + d.cogs,
    insurance: acc.insurance + d.insurance,
    apiRev: acc.apiRev + d.apiRev,
    cbDirect: acc.cbDirect + d.cbDirect,
    grossProfit: acc.grossProfit + d.grossProfit,
    opex: acc.opex + d.opex,
    netProfit: acc.netProfit + d.netProfit,
  }), { gmv: 0, revenue: 0, cogs: 0, insurance: 0, apiRev: 0, cbDirect: 0, grossProfit: 0, opex: 0, netProfit: 0 });

  const grossMargin = totals.gmv > 0 ? (totals.grossProfit / totals.gmv * 100) : 0;
  const netMargin = totals.gmv > 0 ? (totals.netProfit / totals.gmv * 100) : 0;
  const maxGMV = Math.max(...data.map(d => d.gmv));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Financials</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>P&L, revenue breakdown, cash flow — super-admin only</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,252,246,0.02)', borderRadius: '8px', padding: '3px' }}>
          {(['1m', '3m', '6m', 'ytd', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              fontFamily: bg, fontSize: '11px', fontWeight: period === p ? 600 : 400,
              padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: period === p ? 'rgba(201,169,110,0.15)' : 'transparent',
              color: period === p ? '#C9A96E' : '#6B8A74', textTransform: 'uppercase',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Gross Volume', value: fmt(totals.gmv), sub: 'Total GMV', color: '#F2ECE0' },
          { label: 'Net Revenue', value: fmt(totals.grossProfit), sub: fmtPct(grossMargin) + ' margin', color: '#16A34A' },
          { label: 'Operating Costs', value: fmt(totals.opex), sub: `${data.length} months`, color: '#F59E0B' },
          { label: 'Net Profit', value: fmt(totals.netProfit), sub: fmtPct(netMargin) + ' net margin', color: totals.netProfit >= 0 ? '#16A34A' : '#EF4444' },
        ].map(k => (
          <div key={k.label} style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '12px', padding: '18px' }}>
            <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k.label}</div>
            <div style={{ fontFamily: mono, fontSize: '24px', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', marginTop: '2px' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {[{ k: 'pnl', l: 'P&L Statement' }, { k: 'revenue', l: 'Revenue Breakdown' }, { k: 'cashflow', l: 'Cash Flow' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} style={{
            fontFamily: bg, fontSize: '12px', fontWeight: tab === t.k ? 600 : 400,
            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === t.k ? 'rgba(201,169,110,0.1)' : 'transparent',
            color: tab === t.k ? '#C9A96E' : '#6B8A74',
          }}>{t.l}</button>
        ))}
      </div>

      {tab === 'pnl' && (
        <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* GMV bar chart */}
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
            <div style={{ fontFamily: bg, fontSize: '12px', color: '#6B8A74', marginBottom: '12px' }}>Monthly GMV</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
              {data.map(d => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontFamily: mono, fontSize: '9px', color: '#8AAA92' }}>{fmt(d.gmv)}</div>
                  <div style={{ width: '100%', height: `${(d.gmv / maxGMV) * 60}px`, background: 'linear-gradient(180deg, #2D6A4F, #1B3A2D)', borderRadius: '4px 4px 0 0' }} />
                  <div style={{ fontFamily: bg, fontSize: '9px', color: '#6B8A74' }}>{d.month.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* P&L table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                <th style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textAlign: 'left', padding: '10px 16px', textTransform: 'uppercase' }}>Line Item</th>
                {data.map(d => <th key={d.month} style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textAlign: 'right', padding: '10px 12px' }}>{d.month.split(' ')[0]}</th>)}
                <th style={{ fontFamily: bg, fontSize: '10px', color: '#C9A96E', textAlign: 'right', padding: '10px 16px', fontWeight: 700 }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Gross Merchandise Volume', key: 'gmv', bold: true, color: '#F2ECE0' },
                { label: 'Take rate revenue', key: 'revenue', bold: false, color: '#8AAA92' },
                { label: 'Insurance commissions', key: 'insurance', bold: false, color: '#8AAA92' },
                { label: 'API revenue', key: 'apiRev', bold: false, color: '#8AAA92' },
                { label: 'CB Direct spread', key: 'cbDirect', bold: false, color: '#8AAA92' },
                { label: 'Gross Profit', key: 'grossProfit', bold: true, color: '#16A34A' },
                { label: 'Operating expenses', key: 'opex', bold: false, color: '#F59E0B', neg: true },
                { label: 'Net Profit', key: 'netProfit', bold: true, color: '#16A34A' },
              ].map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                  <td style={{ fontFamily: bg, fontSize: '12px', color: row.color, padding: '8px 16px', fontWeight: row.bold ? 600 : 400 }}>{row.label}</td>
                  {data.map(d => {
                    const val = (d as unknown as Record<string, number>)[row.key];
                    return <td key={d.month} style={{ fontFamily: mono, fontSize: '11px', color: row.color, textAlign: 'right', padding: '8px 12px', fontWeight: row.bold ? 600 : 400 }}>{row.neg ? `(${fmt(val)})` : fmt(val)}</td>;
                  })}
                  <td style={{ fontFamily: mono, fontSize: '12px', color: row.color, textAlign: 'right', padding: '8px 16px', fontWeight: 700 }}>
                    {row.neg ? `(${fmt((totals as unknown as Record<string, number>)[row.key])})` : fmt((totals as unknown as Record<string, number>)[row.key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'revenue' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '20px' }}>Revenue by Stream</div>
            {REVENUE_STREAMS.map(s => (
              <div key={s.name} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: bg, fontSize: '12px', color: '#F2ECE0' }}>{s.name}</span>
                  <span style={{ fontFamily: mono, fontSize: '12px', color: '#8AAA92' }}>{fmt(s.amount)} ({s.pct}%)</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,252,246,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct * 2}%`, height: '100%', background: s.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '20px' }}>Unit Economics</div>
            {[
              { label: 'Average order value', value: '$48,250' },
              { label: 'Average take rate', value: '15.0%' },
              { label: 'Insurance attach rate', value: '62%' },
              { label: 'Average premium rate', value: '3.5%' },
              { label: 'CB Direct margin', value: '18.2%' },
              { label: 'API calls (this month)', value: '14,200' },
              { label: 'API avg revenue/call', value: '$0.10' },
              { label: 'Blended rev per tCO₂e', value: '$2.84' },
            ].map(u => (
              <div key={u.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                <span style={{ fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>{u.label}</span>
                <span style={{ fontFamily: mono, fontSize: '12px', color: '#F2ECE0', fontWeight: 600 }}>{u.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'cashflow' && (
        <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', marginBottom: '20px' }}>Cash Flow Summary</div>
          {[
            { label: 'Opening balance (Oct 2025)', value: fmt(50000), color: '#F2ECE0', bold: true },
            { label: '+ Total revenue collected', value: fmt(totals.grossProfit), color: '#16A34A' },
            { label: '+ Insurance premiums held', value: fmt(16980), color: '#3B82F6' },
            { label: '- Operating expenses', value: `(${fmt(totals.opex)})`, color: '#F59E0B' },
            { label: '- Insurance payouts to underwriter', value: `(${fmt(14200)})`, color: '#EF4444' },
            { label: '- Credit purchases (CB Direct inventory)', value: `(${fmt(35800)})`, color: '#EF4444' },
            { label: '= Closing balance', value: fmt(50000 + totals.grossProfit + 16980 - totals.opex - 14200 - 35800), color: '#16A34A', bold: true },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: row.bold ? '2px solid rgba(201,169,110,0.1)' : '1px solid rgba(201,169,110,0.04)' }}>
              <span style={{ fontFamily: bg, fontSize: '13px', color: row.color, fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
              <span style={{ fontFamily: mono, fontSize: '14px', color: row.color, fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
