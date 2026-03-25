'use client';
const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

const ORDERS = [
  { ref: 'CB-2026-00142', date: '22 Mar 2026', project: 'Great Southern Forest Restoration', type: 'ARR', qty: 2500, price: 26.40, total: 66000, insurance: true, insPremium: 2310, status: 'Confirmed', settlement: 'credits_transferred' },
  { ref: 'CB-2026-00138', date: '18 Mar 2026', project: 'Kalimantan Peatland Conservation', type: 'REDD+', qty: 10000, price: 12.80, total: 128000, insurance: true, insPremium: 4480, status: 'Completed', settlement: 'completed' },
  { ref: 'CB-2026-00125', date: '10 Mar 2026', project: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 5000, price: 32.50, total: 162500, insurance: false, insPremium: 0, status: 'Completed', settlement: 'completed' },
  { ref: 'CB-2026-00098', date: '28 Feb 2026', project: 'Queensland Soil Carbon Initiative', type: 'Soil Carbon', qty: 8000, price: 18.20, total: 145600, insurance: true, insPremium: 5096, status: 'Completed', settlement: 'completed' },
];

const SC: Record<string, { bg: string; text: string }> = {
  Confirmed: { bg: 'rgba(201,169,110,0.1)', text: '#C9A96E' },
  Completed: { bg: 'rgba(22,163,74,0.08)', text: '#16A34A' },
  Pending: { bg: 'rgba(59,130,246,0.08)', text: '#2563EB' },
};

export default function PurchasesPage() {
  const totalSpent = ORDERS.reduce((s, o) => s + o.total + o.insPremium, 0);
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Purchase History</h1>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259' }}>All carbon credit purchases made through CarbonBridge.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: '3px solid #1B3A2D' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>Total Spent</div>
          <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#1B3A2D' }}>{fmt(totalSpent)}</div>
        </div>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: '3px solid #2D6A4F' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>Total Orders</div>
          <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#2D6A4F' }}>{ORDERS.length}</div>
        </div>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: '3px solid #C9A96E' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>Insurance Purchased</div>
          <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#C9A96E' }}>{fmt(ORDERS.reduce((s, o) => s + o.insPremium, 0))}</div>
        </div>
      </div>

      <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', overflow: 'hidden' }}>
        {ORDERS.map(o => (
          <div key={o.ref} style={{ padding: '20px 24px', borderBottom: '1px solid #F0EBE0', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '2px' }}>{o.project}</div>
              <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70' }}>{o.type} · {o.date}</div>
            </div>
            <div style={{ fontFamily: mono, fontSize: '13px', color: '#5A5248' }}>{o.qty.toLocaleString()} tCO₂e</div>
            <div style={{ fontFamily: mono, fontSize: '13px', color: '#5A5248' }}>@ {fmt(o.price)}</div>
            <div style={{ fontFamily: mono, fontSize: '15px', fontWeight: 700, color: '#1A1714' }}>{fmt(o.total)}</div>
            {o.insurance && <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.08)', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>INSURED</span>}
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: SC[o.status]?.bg || '#f5f5f5', color: SC[o.status]?.text || '#666' }}>{o.status}</span>
            <span style={{ fontFamily: mono, fontSize: '11px', color: '#8A7E70' }}>{o.ref}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
