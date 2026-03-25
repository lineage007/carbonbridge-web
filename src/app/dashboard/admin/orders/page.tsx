'use client';

import { useState } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

type OrderStatus = 'pending_payment' | 'payment_received' | 'transfer_in_progress' | 'credits_delivered' | 'completed' | 'cancelled' | 'expired' | 'disputed';

type Order = {
  ref: string; date: string; buyer: string; credit: string; type: string;
  qty: number; unitPrice: number; total: number; insurance: boolean;
  insurancePremium: number; status: OrderStatus; paymentMethod: string;
  agreementDeadline: string; transferInitiated: boolean; hoursElapsed: number;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; priority: number }> = {
  pending_payment:     { label: 'Pending Payment', bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', priority: 1 },
  payment_received:    { label: 'Payment Received', bg: 'rgba(59,130,246,0.1)', text: '#3B82F6', priority: 2 },
  transfer_in_progress:{ label: 'Transfer In Progress', bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6', priority: 3 },
  credits_delivered:   { label: 'Credits Delivered', bg: 'rgba(22,163,74,0.1)', text: '#16A34A', priority: 4 },
  completed:           { label: 'Completed', bg: 'rgba(27,58,45,0.06)', text: '#2D6A4F', priority: 5 },
  cancelled:           { label: 'Cancelled', bg: 'rgba(239,68,68,0.06)', text: '#EF4444', priority: 6 },
  expired:             { label: 'Expired', bg: 'rgba(107,98,89,0.1)', text: '#6B6259', priority: 7 },
  disputed:            { label: 'Disputed', bg: 'rgba(239,68,68,0.15)', text: '#DC2626', priority: 0 },
};

const ORDERS: Order[] = [
  { ref: 'CB-2026-00142', date: '22 Mar 2026', buyer: 'Emirates Industrial Group', credit: 'Great Southern Forest', type: 'ARR', qty: 2500, unitPrice: 26.40, total: 66000, insurance: true, insurancePremium: 2310, status: 'payment_received', paymentMethod: 'Bank Transfer', agreementDeadline: '25 Mar 2026 18:00', transferInitiated: false, hoursElapsed: 52 },
  { ref: 'CB-2026-00141', date: '21 Mar 2026', buyer: 'Abu Dhabi Airports', credit: 'Borneo Peatland REDD+', type: 'REDD+', qty: 15000, unitPrice: 12.80, total: 192000, insurance: true, insurancePremium: 6720, status: 'pending_payment', paymentMethod: 'Bank Transfer', agreementDeadline: '24 Mar 2026 12:00', transferInitiated: false, hoursElapsed: 8 },
  { ref: 'CB-2026-00140', date: '20 Mar 2026', buyer: 'Masdar', credit: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 8000, unitPrice: 32.50, total: 260000, insurance: false, insurancePremium: 0, status: 'transfer_in_progress', paymentMethod: 'Stripe', agreementDeadline: '—', transferInitiated: true, hoursElapsed: 0 },
  { ref: 'CB-2026-00138', date: '18 Mar 2026', buyer: 'Emirates Steel', credit: 'Kalimantan Peatland', type: 'REDD+', qty: 10000, unitPrice: 12.80, total: 128000, insurance: true, insurancePremium: 4480, status: 'completed', paymentMethod: 'Bank Transfer', agreementDeadline: '—', transferInitiated: true, hoursElapsed: 0 },
  { ref: 'CB-2026-00125', date: '10 Mar 2026', buyer: 'ADNOC', credit: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 5000, unitPrice: 32.50, total: 162500, insurance: false, insurancePremium: 0, status: 'completed', paymentMethod: 'Stripe', agreementDeadline: '—', transferInitiated: true, hoursElapsed: 0 },
  { ref: 'CB-2026-00098', date: '28 Feb 2026', buyer: 'Dubai Holding', credit: 'Queensland Soil Carbon', type: 'Soil Carbon', qty: 8000, unitPrice: 18.20, total: 145600, insurance: true, insurancePremium: 5096, status: 'completed', paymentMethod: 'Bank Transfer', agreementDeadline: '—', transferInitiated: true, hoursElapsed: 0 },
];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = filter === 'all' ? ORDERS : ORDERS.filter(o => o.status === filter);
  const actionRequired = ORDERS.filter(o => ['pending_payment', 'payment_received'].includes(o.status));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Orders</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>{ORDERS.length} total · {actionRequired.length} need action</p>
        </div>
      </div>

      {/* Pipeline summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '24px' }}>
        {Object.entries(STATUS_CONFIG).filter(([k]) => !['cancelled', 'expired', 'disputed'].includes(k)).map(([key, config]) => {
          const count = ORDERS.filter(o => o.status === key).length;
          const value = ORDERS.filter(o => o.status === key).reduce((s, o) => s + o.total, 0);
          return (
            <button key={key} onClick={() => setFilter(filter === key ? 'all' : key as OrderStatus)}
              style={{
                padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: filter === key ? config.bg : 'rgba(255,252,246,0.02)',
                borderTop: `2px solid ${config.text}`, textAlign: 'left',
              }}>
              <div style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#F2ECE0' }}>{count}</div>
              <div style={{ fontFamily: bg, fontSize: '11px', color: config.text, marginTop: '2px' }}>{config.label}</div>
              {value > 0 && <div style={{ fontFamily: mono, fontSize: '10px', color: '#6B8A74', marginTop: '2px' }}>{fmt(value)}</div>}
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div style={{ background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                {['Ref', 'Date', 'Buyer', 'Credit', 'Qty (tCO₂e)', 'Total', 'Insurance', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, color: '#6B8A74', textAlign: 'left', padding: '12px 14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const sc = STATUS_CONFIG[o.status];
                const isUrgent = o.status === 'payment_received' && o.hoursElapsed > 48;
                return (
                  <tr key={o.ref} onClick={() => setSelected(selected === o.ref ? null : o.ref)}
                    style={{ borderBottom: '1px solid rgba(201,169,110,0.04)', cursor: 'pointer', background: isUrgent ? 'rgba(239,68,68,0.03)' : selected === o.ref ? 'rgba(201,169,110,0.03)' : 'transparent' }}>
                    <td style={{ fontFamily: mono, fontSize: '12px', color: '#F2ECE0', padding: '14px', fontWeight: 600 }}>
                      {o.ref}
                      {isUrgent && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '3px', background: '#EF4444', marginLeft: '6px', animation: 'pulse 2s infinite' }} />}
                    </td>
                    <td style={{ fontFamily: bg, fontSize: '12px', color: '#8AAA92', padding: '14px' }}>{o.date}</td>
                    <td style={{ fontFamily: bg, fontSize: '13px', color: '#F2ECE0', padding: '14px', fontWeight: 500 }}>{o.buyer}</td>
                    <td>
                      <span style={{ fontFamily: bg, fontSize: '12px', color: '#F2ECE0' }}>{o.credit}</span>
                      <span style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', display: 'block' }}>{o.type}</span>
                    </td>
                    <td style={{ fontFamily: mono, fontSize: '12px', color: '#F2ECE0', padding: '14px' }}>{o.qty.toLocaleString()}</td>
                    <td style={{ fontFamily: mono, fontSize: '13px', color: '#F2ECE0', padding: '14px', fontWeight: 600 }}>{fmt(o.total)}</td>
                    <td style={{ padding: '14px' }}>
                      {o.insurance ? (
                        <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, color: '#16A34A', background: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                          Insured · {fmt(o.insurancePremium)}
                        </span>
                      ) : (
                        <span style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74' }}>No</span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {o.status === 'payment_received' && (
                        <button style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#C9A96E', color: '#0C1C14' }}>
                          Initiate transfer
                        </button>
                      )}
                      {o.status === 'pending_payment' && (
                        <span style={{ fontFamily: mono, fontSize: '10px', color: '#F59E0B' }}>
                          Due: {o.agreementDeadline}
                        </span>
                      )}
                      {o.status === 'transfer_in_progress' && (
                        <button style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(201,169,110,0.2)', cursor: 'pointer', background: 'transparent', color: '#C9A96E' }}>
                          Confirm delivery
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail panel */}
      {selected && (() => {
        const o = ORDERS.find(x => x.ref === selected);
        if (!o) return null;
        const sc = STATUS_CONFIG[o.status];
        return (
          <div style={{ marginTop: '20px', background: 'rgba(255,252,246,0.02)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#F2ECE0' }}>{o.ref}</h2>
                <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: sc.bg, color: sc.text }}>{sc.label}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6B8A74', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Buyer', value: o.buyer },
                { label: 'Credit', value: `${o.credit} (${o.type})` },
                { label: 'Quantity', value: `${o.qty.toLocaleString()} tCO₂e` },
                { label: 'Unit price', value: `$${o.unitPrice.toFixed(2)}/tCO₂e` },
                { label: 'Subtotal', value: fmt(o.total) },
                { label: 'Insurance', value: o.insurance ? `${fmt(o.insurancePremium)} (3.5%)` : 'Declined' },
                { label: 'Grand total', value: fmt(o.total + o.insurancePremium) },
                { label: 'Payment method', value: o.paymentMethod },
              ].map(d => (
                <div key={d.label}>
                  <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{d.label}</div>
                  <div style={{ fontFamily: bg, fontSize: '14px', color: '#F2ECE0', fontWeight: 500 }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Action buttons based on status */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(201,169,110,0.06)' }}>
              {o.status === 'payment_received' && (
                <>
                  <button style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#C9A96E', color: '#0C1C14' }}>
                    Initiate Verra transfer
                  </button>
                  <button style={{ fontFamily: bg, fontSize: '13px', padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(201,169,110,0.2)', cursor: 'pointer', background: 'transparent', color: '#C9A96E' }}>
                    Contact buyer
                  </button>
                </>
              )}
              {o.status === 'transfer_in_progress' && (
                <button style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#16A34A', color: 'white' }}>
                  Mark credits delivered
                </button>
              )}
              <button style={{ fontFamily: bg, fontSize: '13px', padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', background: 'transparent', color: '#EF4444' }}>
                Flag issue
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
