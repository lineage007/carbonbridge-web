'use client';

import { useState, useEffect } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

type CbOrderStatus =
  | 'pending_kyc'
  | 'pending_payment'
  | 'payment_processing'
  | 'settled'
  | 'retired'
  | 'cancelled'
  | 'disputed';

const STATUS_CONFIG: Record<CbOrderStatus, { label: string; bg: string; text: string; priority: number }> = {
  pending_kyc:        { label: 'Pending KYC',        bg: 'rgba(251,146,60,0.12)', text: '#EA580C', priority: 0 },
  pending_payment:    { label: 'Pending Payment',     bg: 'rgba(245,158,11,0.1)',  text: '#F59E0B', priority: 1 },
  payment_processing: { label: 'Payment Processing',  bg: 'rgba(59,130,246,0.1)',  text: '#3B82F6', priority: 2 },
  settled:            { label: 'Settled — Transfer',  bg: 'rgba(139,92,246,0.1)',  text: '#8B5CF6', priority: 3 },
  retired:            { label: 'Retired',             bg: 'rgba(22,163,74,0.1)',   text: '#16A34A', priority: 4 },
  cancelled:          { label: 'Cancelled',           bg: 'rgba(239,68,68,0.06)',  text: '#EF4444', priority: 6 },
  disputed:           { label: 'Disputed',            bg: 'rgba(239,68,68,0.15)',  text: '#DC2626', priority: 0 },
};

interface KycEntry {
  id: string;
  order_id: string;
  buyer_id: string;
  business_name: string;
  business_country: string;
  intended_use: string | null;
  status: string;
  created_at: string;
}

interface CbOrder {
  id: string;
  status: CbOrderStatus;
  project_name: string;
  credit_type: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  kyc_business_name: string;
  kyc_business_country: string;
  created_at: string;
  buyer?: { company_name: string; email: string } | null;
  kyc_queue?: KycEntry[] | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | CbOrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<CbOrder | null>(null);
  const [kycNote, setKycNote] = useState('');
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // graceful — shows empty state
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const kycPending = orders.filter(o => o.status === 'pending_kyc').length;
  const settledPending = orders.filter(o => o.status === 'settled').length;
  const actionRequired = kycPending + settledPending;

  async function handleKycApprove(order: CbOrder) {
    const kycEntry = order.kyc_queue?.[0];
    if (!kycEntry) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_id: kycEntry.id, action: 'approve', notes: kycNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback('KYC approved — order moved to pending_payment.');
        setSelectedOrder(null);
        setKycNote('');
        fetchOrders();
      } else {
        setActionFeedback(`Error: ${data.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleKycReject(order: CbOrder) {
    const kycEntry = order.kyc_queue?.[0];
    if (!kycEntry || !kycRejectionReason) {
      setActionFeedback('Rejection reason is required.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_id: kycEntry.id, action: 'reject', reason: kycRejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback('KYC rejected — order cancelled and credits released.');
        setSelectedOrder(null);
        setKycRejectionReason('');
        fetchOrders();
      } else {
        setActionFeedback(`Error: ${data.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkRetired(orderId: string, registryRef: string) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/orders/retire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, registry_transaction_ref: registryRef }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback('Order marked as retired. Retirement instruction updated.');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        setActionFeedback(`Error: ${data.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Orders</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>
            {orders.length} total · {actionRequired} need action
            {kycPending > 0 && <span style={{ color: '#EA580C', marginLeft: '8px' }}>({kycPending} KYC pending)</span>}
            {settledPending > 0 && <span style={{ color: '#8B5CF6', marginLeft: '8px' }}>({settledPending} awaiting transfer)</span>}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{ fontFamily: bg, fontSize: '12px', color: '#8AAA92', background: 'rgba(138,170,146,0.08)', border: '1px solid rgba(138,170,146,0.15)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {actionFeedback && (
        <div style={{ background: 'rgba(45,106,79,0.12)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontFamily: bg, fontSize: '13px', color: '#8AAA92' }}>
          {actionFeedback}
          <button onClick={() => setActionFeedback(null)} style={{ marginLeft: '12px', color: '#6B8A74', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Dismiss</button>
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', 'pending_kyc', 'pending_payment', 'payment_processing', 'settled', 'retired', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              fontFamily: bg, fontSize: '12px', fontWeight: filter === s ? 600 : 400,
              padding: '5px 14px', borderRadius: '20px', cursor: 'pointer',
              background: filter === s ? 'rgba(201,169,110,0.15)' : 'transparent',
              border: filter === s ? '1px solid rgba(201,169,110,0.35)' : '1px solid rgba(138,170,146,0.15)',
              color: filter === s ? '#C9A96E' : '#6B8A74',
            }}
          >
            {s === 'all' ? `All (${orders.length})` : `${STATUS_CONFIG[s as CbOrderStatus]?.label || s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B8A74', fontFamily: bg, fontSize: '14px' }}>
          Loading orders from database...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B8A74', fontFamily: bg, fontSize: '14px' }}>
          No orders found for this filter.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                {['Order ID', 'Buyer', 'Project', 'Qty (tCO₂e)', 'Total (USD)', 'Payment', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '8px 12px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const sc = STATUS_CONFIG[order.status] || { label: order.status, bg: 'transparent', text: '#8AAA92', priority: 9 };
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '11px', color: '#8AAA92' }}>{order.id.slice(0, 8)}...</td>
                    <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '13px', color: '#D4C9BA' }}>
                      {order.buyer?.company_name || order.kyc_business_name}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#C4B8A8' }}>
                      <div>{order.project_name}</div>
                      <div style={{ color: '#6B8A74', fontSize: '11px' }}>{order.credit_type} · {order.quantity.toLocaleString()} t</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#D4C9BA' }}>{order.quantity.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#D4C9BA' }}>{fmt(order.total_amount)}</td>
                    <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>{order.payment_method}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {['pending_kyc', 'settled'].includes(order.status) && (
                        <button
                          onClick={() => { setSelectedOrder(order); setActionFeedback(null); }}
                          style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* KYC / Settlement Review Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#1A2C21', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '16px', padding: '32px', maxWidth: '540px', width: '100%' }}>
            <h2 style={{ fontFamily: fr, fontSize: '22px', color: '#F2ECE0', marginBottom: '4px' }}>
              {selectedOrder.status === 'pending_kyc' ? 'KYC Review' : 'Settlement & Transfer'}
            </h2>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#6B8A74', marginBottom: '24px' }}>
              Order {selectedOrder.id.slice(0, 8)}
            </p>

            <div style={{ background: 'rgba(255,252,246,0.03)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              {[
                ['Project', selectedOrder.project_name],
                ['Credit Type', selectedOrder.credit_type],
                ['Quantity', `${selectedOrder.quantity.toLocaleString()} tCO₂e`],
                ['Total', fmt(selectedOrder.total_amount)],
                ['Payment', selectedOrder.payment_method],
                ['KYC Business', selectedOrder.kyc_business_name],
                ['KYC Country', selectedOrder.kyc_business_country],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: bg, fontSize: '12px', color: '#6B8A74' }}>{label}</span>
                  <span style={{ fontFamily: bg, fontSize: '12px', color: '#D4C9BA', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            {selectedOrder.status === 'pending_kyc' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontFamily: bg, fontSize: '12px', color: '#8AAA92', marginBottom: '6px' }}>
                    Reviewer Notes (optional)
                  </label>
                  <textarea
                    value={kycNote}
                    onChange={e => setKycNote(e.target.value)}
                    placeholder="Internal notes about this KYC review..."
                    style={{ width: '100%', background: 'rgba(255,252,246,0.04)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '8px', padding: '10px', fontFamily: bg, fontSize: '13px', color: '#D4C9BA', resize: 'vertical', minHeight: '72px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button
                    onClick={() => handleKycApprove(selectedOrder)}
                    disabled={actionLoading}
                    style={{ flex: 1, fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#0C1C14', background: '#22C55E', border: 'none', borderRadius: '8px', padding: '10px', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
                  >
                    Approve KYC
                  </button>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <textarea
                    value={kycRejectionReason}
                    onChange={e => setKycRejectionReason(e.target.value)}
                    placeholder="Rejection reason (required to reject)..."
                    style={{ width: '100%', background: 'rgba(255,252,246,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px', fontFamily: bg, fontSize: '13px', color: '#D4C9BA', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }}
                  />
                  <button
                    onClick={() => handleKycReject(selectedOrder)}
                    disabled={actionLoading || !kycRejectionReason}
                    style={{ marginTop: '8px', width: '100%', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px', cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                  >
                    Reject KYC
                  </button>
                </div>
              </>
            )}

            {selectedOrder.status === 'settled' && (
              <SettlementPanel order={selectedOrder} onComplete={(ref) => handleMarkRetired(selectedOrder.id, ref)} loading={actionLoading} />
            )}

            <button
              onClick={() => { setSelectedOrder(null); setKycNote(''); setKycRejectionReason(''); }}
              style={{ width: '100%', fontFamily: bg, fontSize: '13px', color: '#6B8A74', background: 'transparent', border: '1px solid rgba(138,170,146,0.15)', borderRadius: '8px', padding: '10px', cursor: 'pointer', marginTop: '4px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettlementPanel({ order, onComplete, loading }: { order: CbOrder; onComplete: (ref: string) => void; loading: boolean }) {
  const [registryRef, setRegistryRef] = useState('');
  const fr = "'Fraunces', Georgia, serif";
  const bg = "'Bricolage Grotesque', system-ui, sans-serif";

  return (
    <div>
      <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
        <p style={{ fontFamily: bg, fontSize: '12px', color: '#A78BFA', marginBottom: '4px', fontWeight: 600 }}>Registry Transfer Required</p>
        <p style={{ fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>
          Payment has been captured. Log into the {order.credit_type} registry and transfer {order.quantity.toLocaleString()} tCO₂e to the buyer account. Paste the registry transaction reference below.
        </p>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontFamily: bg, fontSize: '12px', color: '#8AAA92', marginBottom: '6px' }}>
          Registry Transaction Reference *
        </label>
        <input
          value={registryRef}
          onChange={e => setRegistryRef(e.target.value)}
          placeholder="e.g. VCS-1234-SERIAL-2024-001-500"
          style={{ width: '100%', background: 'rgba(255,252,246,0.04)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '8px', padding: '10px', fontFamily: bg, fontSize: '13px', color: '#D4C9BA', boxSizing: 'border-box' }}
        />
      </div>
      <button
        onClick={() => registryRef && onComplete(registryRef)}
        disabled={loading || !registryRef}
        style={{ width: '100%', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#0C1C14', background: '#8B5CF6', border: 'none', borderRadius: '8px', padding: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !registryRef ? 0.7 : 1 }}
      >
        Mark as Retired
      </button>
    </div>
  );
}
