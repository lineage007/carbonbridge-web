'use client';

/**
 * /dispute — Dispute Flow (Phase 2)
 *
 * Exercises the dispute state machine: open → evidence_submitted → under_review → resolved.
 * Escrow transitions: held → frozen (on open), frozen → released/refunded (on resolve).
 *
 * Evidence upload is a stub — no files are stored anywhere.
 *
 * STUB STATUS: All dispute and escrow transitions are in-memory only.
 * No database, no file storage, no admin notification emails.
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  getOrder,
  openDisputeForOrder,
  submitDisputeEvidence,
  resolveDisputeForOrder,
} from '@/lib/demo-session';
import type { OrderSession } from '@/lib/demo-session';
import type { DisputeState } from '@/lib/dispute';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

const DISPUTE_STEPS: { state: DisputeState | 'idle'; label: string; desc: string }[] = [
  { state: 'idle', label: 'Raise', desc: 'Describe the problem' },
  { state: 'open', label: 'Open', desc: 'Dispute opened, escrow frozen' },
  { state: 'evidence_submitted', label: 'Evidence', desc: 'Evidence on record' },
  { state: 'under_review', label: 'Review', desc: 'Admin reviewing' },
  { state: 'resolved', label: 'Resolved', desc: 'Outcome determined' },
];

type UIStep = 'raise' | 'open' | 'evidence' | 'review' | 'resolved';

function DisputeInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') ?? '';

  const [session, setSession] = useState<OrderSession | null>(null);
  const [uiStep, setUiStep] = useState<UIStep>('raise');
  const [reason, setReason] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fakeFileName, setFakeFileName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [resolution, setResolution] = useState<'buyer_wins' | 'seller_wins' | null>(null);

  useEffect(() => {
    if (orderId) {
      const s = getOrder(orderId);
      if (s) {
        setSession(s);
        // Restore state if dispute already opened
        if (s.disputeState === 'open') setUiStep('open');
        else if (s.disputeState === 'evidence_submitted') setUiStep('evidence');
        else if (s.disputeState === 'under_review') setUiStep('review');
        else if (s.disputeState === 'resolved') setUiStep('resolved');
      }
    }
  }, [orderId]);

  function refreshSession() {
    if (orderId) {
      const s = getOrder(orderId);
      if (s) setSession({ ...s });
    }
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '24px', color: '#1A1714' }}>No order found</h2>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178' }}>
          A dispute can only be raised against an escrow-held order.
        </p>
        <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', color: '#4A8B64', fontWeight: 600 }}>
          Browse marketplace →
        </Link>
      </div>
    );
  }

  if (session.escrowState === 'released') {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: fr, fontSize: '24px', color: '#1A1714', marginBottom: '12px' }}>Cannot raise dispute</h2>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7 }}>
          Escrow has already been released — credits have been retired. Disputes can only be raised while escrow is held or frozen.
        </p>
      </div>
    );
  }

  async function handleOpenDispute() {
    if (!reason || reason.length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }
    setPending(true);
    setError('');
    await new Promise(r => setTimeout(r, 700));
    const result = openDisputeForOrder(session!.orderId, reason);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? 'Failed to open dispute');
      return;
    }
    refreshSession();
    setUiStep('open');
  }

  async function handleSubmitEvidence() {
    if (!evidenceDesc) {
      setError('Please describe your evidence.');
      return;
    }
    setPending(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const result = submitDisputeEvidence(session!.orderId, evidenceDesc, fileNames);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? 'Failed to submit evidence');
      return;
    }
    refreshSession();
    setUiStep('review');
  }

  async function handleResolve(outcome: 'buyer_wins' | 'seller_wins') {
    setPending(true);
    setError('');
    await new Promise(r => setTimeout(r, 800));
    const result = resolveDisputeForOrder(session!.orderId, outcome);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? 'Failed to resolve dispute');
      return;
    }
    setResolution(outcome);
    refreshSession();
    setUiStep('resolved');
  }

  const stepIndex = DISPUTE_STEPS.findIndex(s => s.state === (uiStep === 'raise' ? 'idle' : uiStep === 'evidence' ? 'evidence_submitted' : uiStep === 'review' ? 'under_review' : uiStep));

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', textDecoration: 'none' }}>Marketplace</Link>
        <span style={{ color: '#B0A99A' }}>›</span>
        <span style={{ fontFamily: bg, fontSize: '12px', color: '#1A1714' }}>Dispute</span>
      </div>

      <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1A1714', marginBottom: '6px' }}>Dispute centre</h1>
      <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.7, marginBottom: '28px' }}>
        If there is a problem with your order, raise a dispute. Escrow will be frozen until the issue is resolved.
      </p>

      {/* Status tracker */}
      <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Dispute status
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
          {DISPUTE_STEPS.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <div key={s.state} style={{ display: 'flex', alignItems: 'flex-start', flex: i < DISPUTE_STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: done ? '#1B3A2D' : active ? '#4A8B64' : '#F0EBE3',
                    color: (done || active) ? 'white' : '#B0A99A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: bg, fontSize: '11px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontFamily: bg, fontSize: '10px', color: active ? '#4A8B64' : done ? '#1B3A2D' : '#B0A99A', marginTop: '6px', fontWeight: active || done ? 700 : 400, textAlign: 'center' }}>
                    {s.label}
                  </span>
                  <span style={{ fontFamily: bg, fontSize: '9px', color: '#B0A99A', textAlign: 'center', marginTop: '2px' }}>
                    {s.desc}
                  </span>
                </div>
                {i < DISPUTE_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: done ? '#1B3A2D' : '#E8E2D6', margin: '14px 6px 0', minWidth: '20px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Escrow state */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F0EBE3', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: session.escrowState === 'frozen' ? '#F59E0B' : session.escrowState === 'held' ? '#4A8B64' : session.escrowState === 'refunded' ? '#2D6A4F' : '#B0A99A',
          }} />
          <span style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>
            Escrow: <strong style={{ color: '#1A1714', textTransform: 'uppercase' }}>{session.escrowState ?? 'idle'}</strong>
            {session.escrowId && <span style={{ fontFamily: mono, fontSize: '11px', color: '#B0A99A', marginLeft: '8px' }}>({session.escrowId})</span>}
          </span>
        </div>
      </div>

      {/* Order summary */}
      <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#1A1714' }}>{session.creditName}</p>
          <p style={{ fontFamily: mono, fontSize: '11px', color: '#8B8178' }}>{session.orderId} · {session.quantity.toLocaleString()} tCO₂e</p>
        </div>
        <p style={{ fontFamily: mono, fontSize: '13px', fontWeight: 700, color: '#1B3A2D' }}>
          ${session.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Stub warning */}
      <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '3px solid rgba(239,68,68,0.5)', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
        <p style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
          Demonstration mode
        </p>
        <p style={{ fontFamily: bg, fontSize: '11px', color: '#6B5B5B', lineHeight: 1.6 }}>
          Dispute and escrow state transitions run in-memory only. No admin notifications, no file storage, no real escrow freeze.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#991B1B' }}>{error}</p>
        </div>
      )}

      {/* ── Raise step ── */}
      {uiStep === 'raise' && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Describe the problem</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '16px', lineHeight: 1.7 }}>
            Tell us what went wrong. Be specific — include dates, expected vs. actual outcomes, and any communication with the seller.
          </p>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            rows={6} placeholder="e.g. The seller committed to delivering credits to my Verra account by 15 March 2026. As of today (29 May 2026), the credits have not been transferred and the seller has not responded to two emails..."
            style={{ fontFamily: bg, fontSize: '14px', width: '100%', padding: '14px', border: '1px solid #E8E2D6', borderRadius: '12px', background: 'white', color: '#1A1714', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', marginBottom: '20px' }}>
            <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>{reason.length} / 2000 characters (min 10)</span>
          </div>
          <button
            onClick={handleOpenDispute} disabled={pending || reason.length < 10}
            style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: 'white', background: '#B91C1C', padding: '13px 28px', borderRadius: '10px', border: 'none', cursor: pending || reason.length < 10 ? 'not-allowed' : 'pointer', opacity: pending || reason.length < 10 ? 0.5 : 1 }}
          >
            {pending ? 'Opening dispute...' : 'Open dispute & freeze escrow'}
          </button>
        </div>
      )}

      {/* ── Open — collect evidence ── */}
      {uiStep === 'open' && (
        <div>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#92400E', marginBottom: '4px' }}>Dispute opened — escrow frozen</p>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#78350F', lineHeight: 1.6 }}>
                Dispute ID: <span style={{ fontFamily: mono }}>{session.disputeId}</span><br />
                Funds are frozen and cannot be released or refunded until this dispute is resolved by a CarbonBridge admin.
              </p>
            </div>
          </div>

          <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Submit evidence</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '16px', lineHeight: 1.7 }}>
            Upload supporting documents — emails, screenshots, delivery confirmations, registry records. The more specific, the better.
          </p>

          <textarea
            value={evidenceDesc} onChange={e => setEvidenceDesc(e.target.value)}
            rows={5} placeholder="Describe your evidence: what it shows, when it was created, and how it supports your claim..."
            style={{ fontFamily: bg, fontSize: '14px', width: '100%', padding: '14px', border: '1px solid #E8E2D6', borderRadius: '12px', background: 'white', color: '#1A1714', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '12px' }}
          />

          {/* File attachment stub */}
          <div style={{ background: '#FDFBF7', border: '2px dashed #E8E2D6', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Attach files</p>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginBottom: '12px' }}>
              PDF, PNG, JPEG, XLSX — max 10 MB each
            </p>
            {/* Stub: text input simulates file name attachment */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <input
                type="text" value={fakeFileName} onChange={e => setFakeFileName(e.target.value)}
                placeholder="e.g. delivery_confirmation.pdf"
                style={{ fontFamily: mono, fontSize: '12px', padding: '8px 12px', border: '1px solid #E8E2D6', borderRadius: '8px', background: 'white', color: '#1A1714', outline: 'none', width: '220px' }}
              />
              <button
                onClick={() => { if (fakeFileName) { setFileNames(p => [...p, fakeFileName]); setFakeFileName(''); } }}
                style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.08)', border: '1px solid rgba(27,58,45,0.15)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
            <p style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', marginTop: '8px', fontStyle: 'italic' }}>
              File upload stub — no files are stored (demonstration only)
            </p>
            {fileNames.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {fileNames.map(f => (
                  <span key={f} style={{ fontFamily: mono, fontSize: '11px', background: 'rgba(27,58,45,0.06)', border: '1px solid rgba(27,58,45,0.12)', borderRadius: '4px', padding: '3px 10px', color: '#1B3A2D' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmitEvidence} disabled={pending || !evidenceDesc}
            style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#4A8B64', padding: '13px 28px', borderRadius: '10px', border: 'none', cursor: pending || !evidenceDesc ? 'not-allowed' : 'pointer', opacity: pending || !evidenceDesc ? 0.5 : 1 }}
          >
            {pending ? 'Submitting...' : 'Submit evidence'}
          </button>
        </div>
      )}

      {/* ── Evidence submitted / under review ── */}
      {(uiStep === 'evidence' || uiStep === 'review') && (
        <div>
          <div style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>◎</span>
            <div>
              <p style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#1E40AF', marginBottom: '4px' }}>Evidence received — under review</p>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#3B4D6B', lineHeight: 1.6 }}>
                Dispute ID: <span style={{ fontFamily: mono }}>{session.disputeId}</span><br />
                A CarbonBridge admin will review both parties&apos; evidence and communicate an outcome within 5 business days.
              </p>
            </div>
          </div>

          {/* Demo admin resolve panel */}
          <div style={{ background: 'white', border: '2px dashed #E8E2D6', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Demonstration: simulate admin resolution
            </p>
            <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.7, marginBottom: '16px' }}>
              In production, this action is performed by a CarbonBridge admin after reviewing both parties&apos; evidence. Simulating it here to complete the flow.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleResolve('buyer_wins')} disabled={pending}
                style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: 'white', background: '#1B3A2D', padding: '12px 22px', borderRadius: '10px', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', flex: 1, opacity: pending ? 0.6 : 1 }}
              >
                {pending ? '...' : 'Resolve: Buyer wins (refund)'}
              </button>
              <button
                onClick={() => handleResolve('seller_wins')} disabled={pending}
                style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', border: '1px solid rgba(27,58,45,0.15)', padding: '12px 22px', borderRadius: '10px', cursor: pending ? 'not-allowed' : 'pointer', flex: 1, opacity: pending ? 0.6 : 1 }}
              >
                {pending ? '...' : 'Resolve: Seller wins (release)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resolved ── */}
      {uiStep === 'resolved' && (
        <div>
          <div style={{ background: resolution === 'buyer_wins' ? 'rgba(22,163,74,0.04)' : 'rgba(74,139,100,0.04)', border: `1px solid ${resolution === 'buyer_wins' ? 'rgba(22,163,74,0.2)' : 'rgba(74,139,100,0.2)'}`, borderRadius: '14px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>
              {resolution === 'buyer_wins' ? '◈' : '◇'}
            </div>
            <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 700, color: '#1A1714', marginBottom: '6px' }}>
              {resolution === 'buyer_wins' ? 'Dispute resolved — refund issued' : 'Dispute resolved — funds released'}
            </h2>
            <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.7 }}>
              {resolution === 'buyer_wins'
                ? 'The dispute was resolved in your favour. The escrow has been refunded. No real funds have been moved — this is a demonstration.'
                : 'The dispute was resolved in the seller\'s favour. Escrow has been released. No real funds have been moved — this is a demonstration.'}
            </p>
          </div>

          {/* Final state summary */}
          <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            {[
              { label: 'Dispute ID', value: session.disputeId ?? '—', mono: true },
              { label: 'Escrow final state', value: (session.escrowState ?? '—').toUpperCase(), color: session.escrowState === 'refunded' ? '#2D6A4F' : '#4A8B64' },
              { label: 'Outcome', value: resolution === 'buyer_wins' ? 'Buyer wins' : 'Seller wins' },
              { label: 'Mode', value: 'STUB — no funds moved', color: '#991B1B' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F0EBE3' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{row.label}</span>
                <span style={{ fontFamily: row.mono ? mono : bg, fontSize: '13px', fontWeight: 600, color: row.color ?? '#1A1714' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#4A8B64', padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}>
              Back to marketplace
            </Link>
            <Link href="/seller-demo" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#8B8178', background: 'white', border: '1px solid #E8E2D6', padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}>
              View seller dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisputePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar />
      <main>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: bg, color: '#8B8178' }}>
            Loading...
          </div>
        }>
          <DisputeInner />
        </Suspense>
      </main>
    </div>
  );
}
