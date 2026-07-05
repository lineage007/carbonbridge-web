'use client';

/**
 * /seller-demo — Seller/Developer Dashboard (Phase 2)
 *
 * Shows listed credits, escrow states across listings, pending disputes.
 * Reads from the state machines (demo-session.ts in-memory store).
 *
 * STUB STATUS: Data is a mix of static demo listings (matching seller/page.tsx)
 * and live in-memory demo-session orders created during the purchase flow.
 * No database. Seller identity is hardcoded demo data.
 *
 * What makes it real: auth middleware, seller_id scoping, Supabase rows,
 * Stripe Connect payout status.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { listAllOrders } from '@/lib/demo-session';
import type { OrderSession } from '@/lib/demo-session';
import type { EscrowState } from '@/lib/escrow';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Static demo listings (same as seller/page.tsx)
const DEMO_LISTINGS = [
  { id: 'cb-au-arr-001', name: 'Great Southern Forest Restoration', type: 'ARR', vintage: 2025, rating: 'AA', price: 26.40, available: 45000, total: 80000, sold: 35000, status: 'Active' as const },
  { id: 'cb-au-bio-001', name: 'Queensland Biochar Sequestration', type: 'Biochar', vintage: 2026, rating: 'AA+', price: 142.00, available: 8200, total: 12000, sold: 3800, status: 'Active' as const },
  { id: 'cb-au-soil-001', name: 'Queensland Soil Carbon Initiative', type: 'Soil Carbon', vintage: 2025, rating: 'AA', price: 18.20, available: 32000, total: 50000, sold: 18000, status: 'Active' as const },
  { id: 'cb-ae-blue-001', name: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', vintage: 2025, rating: 'AAA', price: 32.50, available: 28000, total: 40000, sold: 12000, status: 'Active' as const },
];

const ESCROW_STATE_COLORS: Record<EscrowState | 'idle', { bg: string; text: string; label: string }> = {
  idle: { bg: 'rgba(176,169,154,0.1)', text: '#B0A99A', label: 'Not started' },
  held: { bg: 'rgba(74,139,100,0.1)', text: '#4A8B64', label: 'Held — awaiting retirement' },
  released: { bg: 'rgba(22,163,74,0.08)', text: '#16A34A', label: 'Released' },
  refunded: { bg: 'rgba(239,68,68,0.08)', text: '#DC2626', label: 'Refunded' },
  frozen: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', label: 'Frozen — dispute open' },
};

type Tab = 'overview' | 'listings' | 'orders' | 'disputes';

export default function SellerDemoPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [demoOrders, setDemoOrders] = useState<OrderSession[]>([]);

  useEffect(() => {
    setDemoOrders(listAllOrders());
  }, [tab]);

  const heldCount = demoOrders.filter(o => o.escrowState === 'held').length;
  const frozenCount = demoOrders.filter(o => o.escrowState === 'frozen').length;
  const releasedCount = demoOrders.filter(o => o.escrowState === 'released').length;
  const totalHeldValue = demoOrders.filter(o => o.escrowState === 'held').reduce((s, o) => s + o.totalUsd, 0);

  const disputedOrders = demoOrders.filter(o => o.disputeId);

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar />
      <main>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>

          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 700, color: '#1A1714' }}>
                    Seller Dashboard
                  </h1>
                  <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#991B1B', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Demonstration
                  </span>
                </div>
                <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>
                  Pacific Carbon Developments — STUB data + live demo-session escrow states
                </p>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '10px', padding: '10px 16px' }}>
                <p style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                  Stub status
                </p>
                <p style={{ fontFamily: bg, fontSize: '11px', color: '#6B5B5B' }}>
                  Payouts pending Stripe Connect.<br />
                  Seller identity pending ADGM FSP authorisation.
                </p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {[
              { label: 'Held in escrow', value: heldCount > 0 ? fmt(totalHeldValue) : '$0.00', sub: `${heldCount} order${heldCount !== 1 ? 's' : ''} pending retirement`, accent: '#4A8B64' },
              { label: 'Released', value: String(releasedCount), sub: 'escrow released this session', accent: '#16A34A' },
              { label: 'Frozen (disputes)', value: String(frozenCount), sub: frozenCount > 0 ? 'action required' : 'no active disputes', accent: frozenCount > 0 ? '#D97706' : '#B0A99A' },
              { label: 'Active listings', value: String(DEMO_LISTINGS.filter(l => l.status === 'Active').length), sub: 'of ' + DEMO_LISTINGS.length + ' total', accent: '#1B3A2D' },
            ].map(k => (
              <div key={k.label} style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '18px', borderLeft: `4px solid ${k.accent}` }}>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k.label}</div>
                <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#1A1714', marginBottom: '2px' }}>{k.value}</div>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #E8E2D6', marginBottom: '24px' }}>
            {(['overview', 'listings', 'orders', 'disputes'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ fontFamily: bg, fontSize: '13px', fontWeight: tab === t ? 700 : 500, color: tab === t ? '#1B3A2D' : '#8B8178', background: 'transparent', border: 'none', padding: '12px 20px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #1B3A2D' : '2px solid transparent', textTransform: 'capitalize' }}>
                {t}{t === 'disputes' && frozenCount > 0 && (
                  <span style={{ marginLeft: '6px', background: '#D97706', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>{frozenCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Escrow state summary */}
              <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px' }}>
                <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>
                  Escrow states — demo orders
                </h3>
                {demoOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '12px' }}>
                      No demo orders yet.
                    </p>
                    <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', color: '#4A8B64', fontWeight: 600 }}>
                      Start a purchase flow →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {demoOrders.map(o => {
                      const stateInfo = ESCROW_STATE_COLORS[o.escrowState ?? 'idle'];
                      return (
                        <div key={o.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#FDFBF7', borderRadius: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <p style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714', marginBottom: '2px' }}>{o.creditName}</p>
                            <p style={{ fontFamily: mono, fontSize: '11px', color: '#8B8178' }}>{o.orderId} · {o.quantity.toLocaleString()} tCO₂e</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: stateInfo.bg, color: stateInfo.text, display: 'block', marginBottom: '3px' }}>
                              {stateInfo.label}
                            </span>
                            <span style={{ fontFamily: mono, fontSize: '11px', color: '#8B8178' }}>{fmt(o.totalUsd)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Listing performance (static) */}
              <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px' }}>
                <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Listing performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {DEMO_LISTINGS.filter(l => l.status === 'Active').map(l => {
                    const pct = (l.sold / l.total) * 100;
                    return (
                      <div key={l.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{l.name}</span>
                          <span style={{ fontFamily: mono, fontSize: '11px', color: '#2D6A4F' }}>{pct.toFixed(0)}% sold</span>
                        </div>
                        <div style={{ height: '6px', background: '#F0EBE3', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #1B3A2D, #2D6A4F)', borderRadius: '3px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A' }}>{l.sold.toLocaleString()} / {l.total.toLocaleString()} tCO₂e</span>
                          <span style={{ fontFamily: mono, fontSize: '10px', color: '#8B8178' }}>${l.price.toFixed(2)}/t</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick links */}
              <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', gridColumn: '1 / -1' }}>
                <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>Test the flows</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Browse marketplace', href: '/marketplace', desc: 'Select a credit to start' },
                    { label: 'Purchase flow', href: '/purchase?credit=cb-au-arr-001&qty=500', desc: 'Buyer purchase + escrow' },
                    { label: 'Retire credits', href: '/retire', desc: 'Escrow held → released' },
                    { label: 'Raise dispute', href: '/dispute', desc: 'Escrow held → frozen → resolved' },
                    { label: 'Full seller view', href: '/seller', desc: 'Existing seller dashboard' },
                  ].map(a => (
                    <Link key={a.href} href={a.href}
                      style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.04)', border: '1px solid rgba(27,58,45,0.1)', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {a.label}
                      <span style={{ fontSize: '11px', fontWeight: 400, color: '#8B8178' }}>{a.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Listings ── */}
          {tab === 'listings' && (
            <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8E2D6' }}>
                    {['Project', 'Type', 'Vintage', 'Rating', 'Price', 'Available', 'Sold %', 'Status'].map(h => (
                      <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 16px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_LISTINGS.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #F0EBE3' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/credits/${l.id}`} style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1B3A2D', textDecoration: 'none' }}>
                          {l.name}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{l.type}</td>
                      <td style={{ padding: '14px 16px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{l.vintage}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: mono, fontSize: '12px', fontWeight: 700, color: '#4A8B64', background: 'rgba(74,139,100,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{l.rating}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>${l.price.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{l.available.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', fontFamily: mono, fontSize: '12px', color: '#2D6A4F' }}>{((l.sold / l.total) * 100).toFixed(0)}%</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '14px 16px', background: '#FDFBF7', borderTop: '1px solid #F0EBE3' }}>
                <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', fontStyle: 'italic' }}>
                  Static demonstration data. Live system reads from Supabase listings table scoped to authenticated seller_id.
                </p>
              </div>
            </div>
          )}

          {/* ── Orders (demo sessions) ── */}
          {tab === 'orders' && (
            <div>
              {demoOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ fontFamily: fr, fontSize: '20px', color: '#1A1714', marginBottom: '10px' }}>No demo orders yet</h3>
                  <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', marginBottom: '20px' }}>
                    Complete a purchase flow to see escrow states here.
                  </p>
                  <Link href="/purchase?credit=cb-au-arr-001&qty=500" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#4A8B64', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none' }}>
                    Start demo purchase →
                  </Link>
                </div>
              ) : (
                <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8E2D6' }}>
                        {['Order ID', 'Credit', 'Buyer', 'Qty (tCO₂e)', 'Value', 'Escrow state', 'Retirement', 'Actions'].map(h => (
                          <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 14px', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {demoOrders.map(o => {
                        const stateInfo = ESCROW_STATE_COLORS[o.escrowState ?? 'idle'];
                        return (
                          <tr key={o.orderId} style={{ borderBottom: '1px solid #F0EBE3' }}>
                            <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '11px', color: '#4A8B64', fontWeight: 600 }}>{o.orderId}</td>
                            <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', maxWidth: '180px' }}>{o.creditName}</td>
                            <td style={{ padding: '12px 14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{o.buyerCompany}</td>
                            <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{o.quantity.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#2D6A4F' }}>{fmt(o.totalUsd)}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '5px', background: stateInfo.bg, color: stateInfo.text, whiteSpace: 'nowrap' }}>
                                {stateInfo.label}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {o.retirementStatus === 'demonstration_complete' ? (
                                <span style={{ fontFamily: bg, fontSize: '10px', color: '#16A34A', fontWeight: 700 }}>Demo cert issued</span>
                              ) : o.escrowState === 'held' ? (
                                <Link href={`/retire?order=${o.orderId}`} style={{ fontFamily: bg, fontSize: '11px', color: '#4A8B64', fontWeight: 600, textDecoration: 'none' }}>
                                  Retire →
                                </Link>
                              ) : (
                                <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {o.escrowState === 'held' && !o.disputeId && (
                                <Link href={`/dispute?order=${o.orderId}`} style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', textDecoration: 'underline' }}>
                                  Dispute
                                </Link>
                              )}
                              {o.disputeId && (
                                <Link href={`/dispute?order=${o.orderId}`} style={{ fontFamily: bg, fontSize: '11px', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>
                                  View dispute
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: '12px 14px', background: '#FDFBF7', borderTop: '1px solid #F0EBE3' }}>
                    <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', fontStyle: 'italic' }}>
                      Demo session orders — held in browser memory. Resets on page reload.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Disputes ── */}
          {tab === 'disputes' && (
            <div>
              {disputedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ fontFamily: fr, fontSize: '20px', color: '#1A1714', marginBottom: '10px' }}>No disputes</h3>
                  <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178' }}>
                    No orders have active disputes in this demo session.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {disputedOrders.map(o => {
                    const escrowInfo = ESCROW_STATE_COLORS[o.escrowState ?? 'idle'];
                    const isResolved = o.disputeState === 'resolved';
                    return (
                      <div key={o.disputeId} style={{ background: 'white', border: `1px solid ${isResolved ? '#E8E2D6' : 'rgba(245,158,11,0.3)'}`, borderRadius: '14px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: isResolved ? 'rgba(22,163,74,0.08)' : 'rgba(245,158,11,0.1)', color: isResolved ? '#16A34A' : '#D97706' }}>
                                {isResolved ? 'Resolved' : 'Active dispute'}
                              </span>
                            </div>
                            <h4 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714', marginBottom: '2px' }}>{o.creditName}</h4>
                            <p style={{ fontFamily: mono, fontSize: '11px', color: '#8B8178' }}>Dispute: {o.disputeId} · Order: {o.orderId}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '5px', background: escrowInfo.bg, color: escrowInfo.text, display: 'block', marginBottom: '4px' }}>
                              Escrow: {escrowInfo.label}
                            </span>
                            <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 700, color: '#1A1714' }}>{fmt(o.totalUsd)}</span>
                          </div>
                        </div>

                        {[
                          { label: 'Buyer', value: `${o.buyerName} — ${o.buyerCompany}` },
                          { label: 'Quantity', value: `${o.quantity.toLocaleString()} tCO₂e`, mono: true },
                          { label: 'Dispute state', value: o.disputeState ?? '—' },
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EBE3', fontSize: '12px' }}>
                            <span style={{ fontFamily: bg, color: '#8B8178' }}>{row.label}</span>
                            <span style={{ fontFamily: row.mono ? mono : bg, fontWeight: 600, color: '#1A1714' }}>{row.value}</span>
                          </div>
                        ))}

                        {!isResolved && (
                          <div style={{ marginTop: '14px' }}>
                            <Link href={`/dispute?order=${o.orderId}`}
                              style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#0C1C14', background: '#4A8B64', padding: '10px 22px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                              Review dispute →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bottom stub notice */}
          <div style={{ marginTop: '40px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              What Gary needs to make this real
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {[
                { item: 'ADGM FSP authorisation', desc: 'Enables live financial services' },
                { item: 'Stripe Connect', desc: 'Escrow + seller payouts' },
                { item: 'Verra / GS / ACR agreements', desc: 'Automated registry retirement' },
                { item: 'Supabase persistence', desc: 'Replaces demo-session.ts' },
              ].map(r => (
                <div key={r.item} style={{ fontFamily: bg }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B', marginBottom: '2px' }}>{r.item}</p>
                  <p style={{ fontSize: '11px', color: '#8B6B6B' }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
