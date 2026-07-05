'use client';

/**
 * /retire — Retirement Flow (Phase 2)
 *
 * Triggered after escrow is held. Calls retireCredits() (escrow held → released)
 * and shows a retirement certificate view.
 *
 * DEMONSTRATION FLOW: No real registry retirement is executed.
 * Registry writes (Verra, Gold Standard, ACR) are manual until ADGM FSP
 * authorisation + registry partner agreements are in place.
 *
 * Certificate is marked "DEMONSTRATION CERTIFICATE" when stub mode.
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { MarketplaceDisclosure } from '@/components/MarketplaceDisclosure';
import { getOrder, retireCredits } from '@/lib/demo-session';
import type { OrderSession } from '@/lib/demo-session';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

function RetireInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') ?? '';

  const [session, setSession] = useState<OrderSession | null>(null);
  const [beneficiary, setBeneficiary] = useState('');
  const [retirePending, setRetirePending] = useState(false);
  const [retireError, setRetireError] = useState('');
  const [certified, setCertified] = useState(false);
  const [certRef, setCertRef] = useState('');

  useEffect(() => {
    if (orderId) {
      const s = getOrder(orderId);
      if (s) {
        setSession(s);
        setBeneficiary(s.buyerCompany ?? '');
        // If already retired, show certificate
        if (s.retirementStatus === 'demonstration_complete' && s.retirementRef) {
          setCertRef(s.retirementRef);
          setCertified(true);
        }
      }
    }
  }, [orderId]);

  if (!session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '24px', color: '#1A1714' }}>No order found</h2>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178' }}>
          Start a purchase first to get an escrow order ID.
        </p>
        <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', color: '#4A8B64', fontWeight: 600 }}>
          Browse marketplace →
        </Link>
      </div>
    );
  }

  if (session.escrowState !== 'held' && !certified) {
    const msg = session.escrowState === 'released'
      ? 'Credits already retired for this order.'
      : session.escrowState === 'frozen'
        ? 'Escrow is frozen due to an open dispute. Resolve the dispute first.'
        : `Escrow is ${session.escrowState ?? 'not held'}. Credits can only be retired once escrow is held.`;

    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: fr, fontSize: '24px', color: '#1A1714', marginBottom: '12px' }}>Cannot retire</h2>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '20px' }}>{msg}</p>
        <Link href={`/purchase?credit=${session.creditId}&qty=${session.quantity}`} style={{ fontFamily: bg, fontSize: '14px', color: '#4A8B64', fontWeight: 600 }}>
          Start a new purchase →
        </Link>
      </div>
    );
  }

  async function handleRetire() {
    if (!session) return;
    setRetirePending(true);
    setRetireError('');
    await new Promise(r => setTimeout(r, 1100));
    const result = retireCredits(session.orderId, beneficiary);
    setRetirePending(false);
    if (!result.ok) {
      setRetireError(result.error ?? 'Retirement failed');
      return;
    }
    // Refresh session
    const updated = getOrder(session.orderId);
    if (updated) setSession({ ...updated });
    setCertRef(result.certRef ?? '');
    setCertified(true);
  }

  if (certified) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Certificate */}
        <div style={{ background: 'white', border: '2px solid #4A8B64', borderRadius: '20px', padding: '40px 40px 32px', position: 'relative', overflow: 'hidden', marginBottom: '28px' }}>
          {/* Watermark */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontFamily: fr, fontSize: '64px', fontWeight: 700, color: 'rgba(239,68,68,0.06)',
            whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
          }}>
            DEMONSTRATION
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <p style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                CarbonBridge — Retirement Certificate
              </p>
              <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1A1714', lineHeight: 1.1 }}>
                Carbon Credit Retirement
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 14px' }}>
                <p style={{ fontFamily: bg, fontSize: '9px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Demonstration Certificate
                </p>
                <p style={{ fontFamily: mono, fontSize: '11px', color: '#991B1B' }}>Stub mode — not registry-confirmed</p>
              </div>
            </div>
          </div>

          {/* Certificate details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Certificate Reference', value: certRef, mono: true },
              { label: 'Order ID', value: session.orderId, mono: true },
              { label: 'Credit Project', value: session.creditName },
              { label: 'Quantity Retired', value: `${session.quantity.toLocaleString()} tCO₂e`, mono: true },
              { label: 'Beneficiary', value: beneficiary || session.buyerCompany },
              { label: 'Retirement Date', value: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Escrow Status', value: 'Released', color: '#2D6A4F' },
              { label: 'Mode', value: 'STUB — not a valid compliance document', color: '#991B1B', mono: true },
            ].map(row => (
              <div key={row.label} style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  {row.label}
                </div>
                <div style={{ fontFamily: row.mono ? mono : bg, fontSize: '13px', fontWeight: 600, color: row.color ?? '#1A1714' }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* Disclosure for retiring phase */}
          <MarketplaceDisclosure phase="retiring" />

          {/* What happens in live */}
          <div style={{ marginTop: '20px', background: '#F5F0E8', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#7B5B3A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              What happens when live
            </p>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#5B4B3A', lineHeight: 1.7 }}>
              CarbonBridge staff execute retirement on the relevant registry (Verra VCS, Gold Standard, or ACR) within 1–3 business days. Once confirmed, a verified certificate with registry serial numbers is issued. This demonstration certificate has no compliance value.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/dashboard/purchases" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#4A8B64', padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}>
            View purchases →
          </Link>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#8B8178', background: 'white', border: '1px solid #E8E2D6', padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}>
            Browse more credits
          </Link>
        </div>
      </div>
    );
  }

  // Pre-retirement form
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', textDecoration: 'none' }}>Marketplace</Link>
        <span style={{ color: '#B0A99A' }}>›</span>
        <span style={{ fontFamily: bg, fontSize: '12px', color: '#1A1714' }}>Retire credits</span>
      </div>

      <h1 style={{ fontFamily: fr, fontSize: '30px', fontWeight: 700, color: '#1A1714', marginBottom: '6px' }}>Retire your credits</h1>
      <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.7, marginBottom: '24px' }}>
        Retiring credits permanently removes them from circulation and generates a retirement certificate for compliance reporting.
      </p>

      {/* Disclosure */}
      <div style={{ marginBottom: '24px' }}>
        <MarketplaceDisclosure phase="retiring" />
      </div>

      {/* Order summary */}
      <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Order details
        </h3>
        {[
          { label: 'Order ID', value: session.orderId, mono: true },
          { label: 'Credit', value: session.creditName },
          { label: 'Quantity', value: `${session.quantity.toLocaleString()} tCO₂e`, mono: true },
          { label: 'Escrow status', value: 'Held', color: '#4A8B64' },
          { label: 'Mode', value: 'STUB — demonstration only', color: '#991B1B' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
            <span style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{row.label}</span>
            <span style={{ fontFamily: row.mono ? mono : bg, fontSize: '13px', fontWeight: 600, color: row.color ?? '#1A1714' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Beneficiary */}
      <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
        <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '6px' }}>
          Beneficiary name (on certificate)
        </label>
        <input
          type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)}
          placeholder="Company or individual name"
          style={{ fontFamily: bg, fontSize: '14px', width: '100%', padding: '11px 14px', border: '1px solid #E8E2D6', borderRadius: '10px', background: '#FDFBF7', color: '#1A1714', outline: 'none', boxSizing: 'border-box' }}
        />
        <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '6px' }}>
          This name appears on your retirement certificate. Usually your company&apos;s registered name.
        </p>
      </div>

      {/* Stub notice */}
      <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '3px solid rgba(239,68,68,0.5)', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
        <p style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
          Demonstration mode
        </p>
        <p style={{ fontFamily: bg, fontSize: '12px', color: '#6B5B5B', lineHeight: 1.6 }}>
          No registry retirement will be executed. Clicking "Retire credits" transitions the in-memory escrow from held to released and generates a demonstration certificate. This is not a valid compliance document.
        </p>
      </div>

      {retireError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#991B1B' }}>Error: {retireError}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href={`/purchase?credit=${session.creditId}`} style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#8B8178', background: 'white', border: '1px solid #E8E2D6', padding: '13px 24px', borderRadius: '10px', textDecoration: 'none' }}>
          Back
        </Link>
        <button
          onClick={handleRetire} disabled={retirePending || !beneficiary}
          style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#4A8B64', padding: '13px 28px', borderRadius: '10px', border: 'none', cursor: retirePending || !beneficiary ? 'not-allowed' : 'pointer', opacity: retirePending || !beneficiary ? 0.6 : 1, flex: 1 }}
        >
          {retirePending ? 'Processing retirement...' : 'Retire credits (demonstration)'}
        </button>
      </div>
    </div>
  );
}

export default function RetirePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar />
      <main>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: bg, color: '#8B8178' }}>
            Loading...
          </div>
        }>
          <RetireInner />
        </Suspense>
      </main>
    </div>
  );
}
