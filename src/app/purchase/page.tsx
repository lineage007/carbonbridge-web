'use client';

/**
 * /purchase — Buyer Purchase Flow (Phase 2)
 *
 * Multi-step: browse → select → review (with disclosure) → place in escrow
 *
 * DEMONSTRATION FLOW: All payment is stubbed. No real money moves.
 * No Stripe charge, no bank transfer, no crypto transaction.
 * The escrow state machine (lib/escrow.ts) runs in-memory only.
 *
 * What makes it real: ADGM FSP authorisation + Stripe Connect agreements
 * + Supabase persistence (replace demo-session.ts).
 */

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { MarketplaceDisclosure } from '@/components/MarketplaceDisclosure';
import { LISTINGS, CREDIT_TYPE_COLORS } from '@/data/credits';
import { createOrder, placeInEscrow } from '@/lib/demo-session';
import type { OrderSession } from '@/lib/demo-session';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

const STEPS = [
  { num: 1, label: 'Select' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'Escrow' },
  { num: 4, label: 'Confirm' },
];

type Step = 1 | 2 | 3 | 4;

function PurchaseInner() {
  const searchParams = useSearchParams();
  const creditId = searchParams.get('credit') ?? '';
  const initialQty = parseInt(searchParams.get('qty') ?? '0') || 100;

  const credit = LISTINGS.find(c => c.id === creditId);

  const [step, setStep] = useState<Step>(1);
  const [qty, setQty] = useState(initialQty);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [session, setSession] = useState<OrderSession | null>(null);
  const [escrowPending, setEscrowPending] = useState(false);
  const [escrowError, setEscrowError] = useState('');

  if (!credit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '24px', color: '#1A1714' }}>No credit selected</h2>
        <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', color: '#C9A96E', fontWeight: 600 }}>
          Browse marketplace →
        </Link>
      </div>
    );
  }

  const totalUsd = qty * credit.price;
  const ratingColor = credit.qualityRating.startsWith('A') ? '#2D6A4F' : '#7B5B3A';

  function handleCreateOrder() {
    const s = createOrder({
      creditId: credit!.id,
      creditName: credit!.projectName,
      quantity: qty,
      pricePerTonne: credit!.price,
      totalUsd,
      buyerName,
      buyerEmail,
      buyerCompany,
    });
    setSession(s);
    setStep(3);
  }

  async function handlePlaceInEscrow() {
    if (!session) return;
    setEscrowPending(true);
    setEscrowError('');
    // Simulate brief network delay for realism
    await new Promise(r => setTimeout(r, 900));
    const result = placeInEscrow(session.orderId);
    setEscrowPending(false);
    if (!result.ok) {
      setEscrowError(result.error ?? 'Escrow failed');
      return;
    }
    // Refresh session state
    const { getOrder } = await import('@/lib/demo-session');
    const updated = getOrder(session.orderId);
    if (updated) setSession({ ...updated });
    setStep(4);
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px' }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        {STEPS.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: step >= s.num ? '#1B3A2D' : '#F0EBE3',
                color: step >= s.num ? '#FFFCF6' : '#B0A99A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: bg, fontSize: '13px', fontWeight: 700,
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontFamily: bg, fontSize: '10px', color: step >= s.num ? '#1A1714' : '#B0A99A', marginTop: '4px', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: step > s.num ? '#1B3A2D' : '#E8E2D6', margin: '0 8px', marginBottom: '18px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Credit summary bar */}
      <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '14px 18px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: 'white', background: CREDIT_TYPE_COLORS[credit.creditType], padding: '3px 8px', borderRadius: '4px' }}>
            {credit.creditType}
          </span>
          <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>{credit.projectName}</span>
        </div>
        <span style={{ fontFamily: fr, fontSize: '16px', fontWeight: 700, color: '#1A1714' }}>
          ${credit.price.toFixed(2)}<span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', fontWeight: 400 }}>/tCO₂e</span>
        </span>
      </div>

      {/* ── Step 1: Select quantity ── */}
      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1A1714', marginBottom: '6px' }}>How many credits?</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>
            Minimum order: 100 tCO₂e. Available: {credit.volumeAvailable.toLocaleString()} tCO₂e.
          </p>

          <input
            type="number" value={qty}
            onChange={e => setQty(Math.max(100, Math.min(credit.volumeAvailable, parseInt(e.target.value) || 100)))}
            min={100} max={credit.volumeAvailable}
            style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, width: '100%', padding: '14px 18px', border: '2px solid #E8E2D6', borderRadius: '12px', textAlign: 'center', color: '#1A1714', outline: 'none', background: 'white' }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {[100, 500, 1000, 5000, 10000].filter(v => v <= credit.volumeAvailable).map(v => (
              <button key={v} onClick={() => setQty(v)}
                style={{ fontFamily: mono, fontSize: '12px', fontWeight: qty === v ? 700 : 500, color: qty === v ? '#1B3A2D' : '#8B8178', background: qty === v ? 'rgba(27,58,45,0.08)' : 'white', border: `1px solid ${qty === v ? '#1B3A2D' : '#E8E2D6'}`, padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                {v.toLocaleString()}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '18px', marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: bg, fontSize: '14px', color: '#1A1714' }}>Subtotal</span>
            <span style={{ fontFamily: mono, fontSize: '18px', fontWeight: 700, color: '#1B3A2D' }}>
              ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Quality summary */}
          <div style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '16px', marginTop: '14px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quality</div>
              <div style={{ fontFamily: fr, fontSize: '22px', fontWeight: 700, color: ratingColor }}>{credit.qualityRating}</div>
            </div>
            <div>
              <div style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vintage</div>
              <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 600, color: '#1A1714' }}>{credit.vintage}</div>
            </div>
            <div>
              <div style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registry</div>
              <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 600, color: '#1A1714' }}>{credit.registry}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Review + disclosure ── */}
      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Review & confirm details</h2>

          {/* Disclosure — shown at point of transacting */}
          <div style={{ marginBottom: '24px' }}>
            <MarketplaceDisclosure phase="transacting" />
          </div>

          {/* Order summary */}
          <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Order summary</h3>
            {[
              { label: 'Credit', value: credit.projectName },
              { label: 'Type', value: credit.creditType },
              { label: 'Quality', value: credit.qualityRating, color: ratingColor },
              { label: 'Quantity', value: `${qty.toLocaleString()} tCO₂e`, mono: true },
              { label: 'Unit price', value: `$${credit.price.toFixed(2)} /tCO₂e`, mono: true },
              { label: 'Total', value: `$${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, mono: true, bold: true },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F0EBE3' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{row.label}</span>
                <span style={{ fontFamily: row.mono ? mono : bg, fontSize: '13px', fontWeight: row.bold ? 700 : 600, color: row.color ?? '#1A1714' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Buyer details */}
          <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Your details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Company', value: buyerCompany, setter: setBuyerCompany, placeholder: 'Emirates Industrial Group' },
                { label: 'Contact name', value: buyerName, setter: setBuyerName, placeholder: 'Your full name' },
                { label: 'Email', value: buyerEmail, setter: setBuyerEmail, placeholder: 'you@company.com', type: 'email' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '5px' }}>
                    {f.label} <span style={{ color: '#C9A96E' }}>*</span>
                  </label>
                  <input
                    type={f.type ?? 'text'} value={f.value} placeholder={f.placeholder}
                    onChange={e => f.setter(e.target.value)}
                    style={{ fontFamily: bg, fontSize: '14px', width: '100%', padding: '11px 14px', border: '1px solid #E8E2D6', borderRadius: '10px', background: '#FDFBF7', color: '#1A1714', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment stub warning */}
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '3px solid rgba(239,68,68,0.5)', borderRadius: '8px', padding: '14px 16px', marginBottom: '4px' }}>
            <p style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Demonstration only — no payment taken
            </p>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#6B5B5B', lineHeight: 1.6 }}>
              Payment integration is pending ADGM FSP authorisation. Clicking "Place in Escrow" does not charge any payment method. This is a demonstration of the escrow flow only.
            </p>
          </div>
        </div>
      )}

      {/* ── Step 3: Place in escrow ── */}
      {step === 3 && session && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Place funds in escrow</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.7, marginBottom: '24px' }}>
            In the live system, your payment is held in a CarbonBridge escrow account — released to the seller only after your credits are confirmed retired on the registry. Credits are not transferred until escrow is released.
          </p>

          {/* Escrow info card */}
          <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Escrow details</h3>
            {[
              { label: 'Order ID', value: session.orderId, mono: true },
              { label: 'Amount to hold', value: `$${session.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, mono: true },
              { label: 'Credit', value: session.creditName },
              { label: 'Quantity', value: `${session.quantity.toLocaleString()} tCO₂e`, mono: true },
              { label: 'Buyer', value: session.buyerCompany },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{row.label}</span>
                <span style={{ fontFamily: row.mono ? mono : bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* How escrow works */}
          <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
            <p style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#7B5B3A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>How it works</p>
            {[
              '1. Your payment is held — seller cannot access it yet.',
              '2. Seller delivers credits to your registry account.',
              '3. You confirm retirement — funds release to seller.',
              '4. If delivery fails, you can raise a dispute and funds are refunded.',
            ].map(s => (
              <p key={s} style={{ fontFamily: bg, fontSize: '12px', color: '#5B4B3A', lineHeight: 1.7, marginBottom: '4px' }}>{s}</p>
            ))}
          </div>

          {/* Stub warning */}
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '3px solid rgba(239,68,68,0.5)', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' }}>
            <p style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Demonstration mode — escrow state machine only
            </p>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#6B5B5B', lineHeight: 1.6 }}>
              No real payment will be captured. The escrow state transitions (idle → held → released/refunded/frozen) run in the browser's in-memory store to demonstrate the flow.
            </p>
          </div>

          {escrowError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#991B1B' }}>Error: {escrowError}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Confirmed ── */}
      {step === 4 && session && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(27,58,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>Funds held in escrow</h2>
          <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '28px' }}>
            Your payment is securely held. The seller will now arrange credit delivery to your registry account. You will receive confirmation when credits are ready to retire.
          </p>

          {/* Escrow status card */}
          <div style={{ background: 'white', border: '2px solid rgba(27,58,45,0.15)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0 }} />
              <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Escrow Status: HELD (demonstration)
              </span>
            </div>
            {[
              { label: 'Escrow ID', value: session.escrowId ?? '—', mono: true },
              { label: 'Order ID', value: session.orderId, mono: true },
              { label: 'Amount held', value: `$${session.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, mono: true },
              { label: 'Credit', value: session.creditName },
              { label: 'Quantity', value: `${session.quantity.toLocaleString()} tCO₂e`, mono: true },
              { label: 'Mode', value: 'STUB — demonstration only', color: '#991B1B' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{row.label}</span>
                <span style={{ fontFamily: row.mono ? mono : bg, fontSize: '13px', fontWeight: 600, color: row.color ?? '#1A1714' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Next step CTA */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/retire?order=${session.orderId}`}
              style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}
            >
              Retire credits →
            </Link>
            <Link
              href={`/dispute?order=${session.orderId}`}
              style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#8B8178', background: 'white', border: '1px solid #E8E2D6', padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}
            >
              Raise a dispute
            </Link>
          </div>

          <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '20px', fontStyle: 'italic' }}>
            Demonstration mode — escrow state is held in browser memory only.
          </p>
        </div>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #E8E2D6' }}>
          <button
            onClick={() => step > 1 ? setStep((step - 1) as Step) : null}
            style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: step > 1 ? '#1A1714' : '#E8E2D6', background: 'transparent', border: '1px solid #E8E2D6', padding: '12px 24px', borderRadius: '10px', cursor: step > 1 ? 'pointer' : 'default', opacity: step > 1 ? 1 : 0.4 }}
          >
            Back
          </button>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
            >
              Continue to review →
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => { if (buyerName && buyerEmail && buyerCompany) handleCreateOrder(); }}
              disabled={!buyerName || !buyerEmail || !buyerCompany}
              style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', opacity: (!buyerName || !buyerEmail || !buyerCompany) ? 0.4 : 1 }}
            >
              Proceed to escrow →
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handlePlaceInEscrow}
              disabled={escrowPending}
              style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: 'white', background: '#1B3A2D', padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: escrowPending ? 'not-allowed' : 'pointer', opacity: escrowPending ? 0.7 : 1 }}
            >
              {escrowPending ? 'Placing in escrow...' : 'Place in escrow (demonstration)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function PurchasePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar />
      <main>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: bg, color: '#8B8178' }}>
            Loading...
          </div>
        }>
          <PurchaseInner />
        </Suspense>
      </main>
    </div>
  );
}
