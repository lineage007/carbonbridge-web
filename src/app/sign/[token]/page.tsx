'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════
   CarbonBridge — E-Signature Page
   Legally valid under ADGM Electronic Transactions Regulations
   Captures: typed name, drawn signature, IP, timestamp, user agent, consent
   ═══════════════════════════════════════════════════════════════ */

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

// Mock agreement data (in production, fetched from API via token)
const MOCK_AGREEMENT = {
  reference: 'PA-2026-00142',
  date: '25 March 2026',
  buyerCompany: 'Emirates Industrial Group PJSC',
  buyerContact: 'Ahmad Al-Mansouri',
  buyerEmail: 'procurement@eig.ae',
  sellerCompany: 'GreenField Carbon Pty Ltd',
  creditProject: 'Great Southern Forest Restoration',
  creditType: 'ARR',
  quantity: 5000,
  unitPrice: 26.40,
  totalCredits: 132000.00,
  insurancePremium: 4620.00,
  totalAmount: 136620.00,
  paymentMethod: 'Bank Transfer',
};

type SignatureMethod = 'draw' | 'type';

export default function SignPage() {
  const [step, setStep] = useState<'review' | 'sign' | 'complete'>('review');
  const [sigMethod, setSigMethod] = useState<SignatureMethod>('type');
  const [typedName, setTypedName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAuthority, setAgreedAuthority] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [signedIP, setSignedIP] = useState<string>('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const agreementRef = useRef<HTMLDivElement>(null);
  const a = MOCK_AGREEMENT;

  // Track scroll to bottom of agreement
  useEffect(() => {
    const el = agreementRef.current;
    if (!el) return;
    const handler = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      if (atBottom) setScrolledToBottom(true);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // Get IP on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setSignedIP(d.ip))
      .catch(() => setSignedIP('Unable to determine'));
  }, []);

  // Canvas drawing
  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x * 2, y * 2); // 2x for retina
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1B3A2D';
    ctx.lineTo(x * 2, y * 2);
    ctx.stroke();
  }, []);

  const endDraw = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFCF6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (sigMethod === 'draw') initCanvas();
  }, [sigMethod, initCanvas]);

  const canSign = agreedTerms && agreedAuthority && (
    sigMethod === 'type' ? typedName.trim().length >= 3 : true
  );

  const handleSign = async () => {
    if (!canSign) return;
    setSigning(true);

    let sigData: string;
    if (sigMethod === 'draw') {
      sigData = canvasRef.current?.toDataURL('image/png') || '';
    } else {
      sigData = `TYPED:${typedName.trim()}`;
    }

    const now = new Date().toISOString();

    // In production: POST to /api/agreements/[orderId]/sign
    // with: { signatureData, signatureMethod, typedName, userAgent, ip, timestamp }
    await new Promise(r => setTimeout(r, 1500)); // simulate API call

    setSignatureData(sigData);
    setSignedAt(now);
    setStep('complete');
    setSigning(false);
  };

  const fmtUSD = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  // ──────────────────────────────────────────────
  // STEP 1: Review Agreement
  // ──────────────────────────────────────────────
  if (step === 'review') return (
    <div style={{ minHeight: '100vh', background: '#F8F5EF', fontFamily: bg }}>
      {/* Top bar */}
      <div style={{ background: '#1B3A2D', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '32px' }} />
        <div style={{ fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>{a.reference}</div>
      </div>

      {/* Progress */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {['Review', 'Sign', 'Complete'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '3px', borderRadius: '2px', background: i === 0 ? '#1B3A2D' : '#E5DED3', marginBottom: '6px' }} />
              <span style={{ fontSize: '11px', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#1B3A2D' : '#8A8279' }}>{s}</span>
            </div>
          ))}
        </div>

        <h1 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1B3A2D', marginBottom: '4px' }}>
          Review Purchase Agreement
        </h1>
        <p style={{ color: '#6B6259', fontSize: '14px', marginBottom: '20px' }}>
          Please review the agreement below. You must scroll to the bottom before proceeding to sign.
        </p>

        {/* Key terms summary */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A8279', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Transaction Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
            <div><span style={{ color: '#8A8279' }}>Buyer:</span> <strong>{a.buyerCompany}</strong></div>
            <div><span style={{ color: '#8A8279' }}>Seller:</span> <strong>{a.sellerCompany}</strong></div>
            <div><span style={{ color: '#8A8279' }}>Project:</span> <strong>{a.creditProject}</strong></div>
            <div><span style={{ color: '#8A8279' }}>Type:</span> <strong>{a.creditType}</strong></div>
            <div><span style={{ color: '#8A8279' }}>Quantity:</span> <strong style={{ fontFamily: mono }}>{a.quantity.toLocaleString()} tCO₂e</strong></div>
            <div><span style={{ color: '#8A8279' }}>Unit Price:</span> <strong style={{ fontFamily: mono }}>{fmtUSD(a.unitPrice)}</strong></div>
            <div><span style={{ color: '#8A8279' }}>Credit Cost:</span> <strong style={{ fontFamily: mono }}>{fmtUSD(a.totalCredits)}</strong></div>
            <div><span style={{ color: '#8A8279' }}>Insurance:</span> <strong style={{ fontFamily: mono }}>{fmtUSD(a.insurancePremium)}</strong></div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5DED3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1B3A2D' }}>Total Amount Due</span>
            <span style={{ fontFamily: mono, fontSize: '20px', fontWeight: 700, color: '#1B3A2D' }}>{fmtUSD(a.totalAmount)}</span>
          </div>
        </div>

        {/* Full agreement (scrollable) */}
        <div
          ref={agreementRef}
          style={{ background: '#fff', border: '1px solid #E5DED3', borderRadius: '12px', padding: '28px', height: '400px', overflowY: 'auto', marginBottom: '16px', fontSize: '12px', lineHeight: 1.7, color: '#5A5248' }}
        >
          <h2 style={{ fontFamily: fr, fontSize: '16px', color: '#1B3A2D', marginBottom: '12px' }}>Purchase Agreement — {a.reference}</h2>
          <p><strong>Date:</strong> {a.date}</p>
          <p><strong>Buyer:</strong> {a.buyerCompany} ({a.buyerContact}, {a.buyerEmail})</p>
          <p><strong>Seller:</strong> {a.sellerCompany}</p>
          <br />
          <p><strong>1. Subject.</strong> The Seller agrees to sell and the Buyer agrees to purchase {a.quantity.toLocaleString()} Carbon Credits (tCO₂e) from the {a.creditProject} project, registered under {a.creditType} methodology on the Verra registry.</p>
          <p><strong>2. Price.</strong> Unit price: {fmtUSD(a.unitPrice)} per tCO₂e. Total credit cost: {fmtUSD(a.totalCredits)}. Insurance premium: {fmtUSD(a.insurancePremium)}. Total amount due: {fmtUSD(a.totalAmount)}.</p>
          <p><strong>3. Payment.</strong> Payment shall be made via {a.paymentMethod}. For bank transfers, funds must be received within 5 Business Days. Card payments are captured immediately at checkout.</p>
          <p><strong>4. Delivery.</strong> The Seller shall initiate the Registry transfer within 24 hours of payment confirmation. Transfer shall be completed within 72 hours, subject to Registry processing times.</p>
          <p><strong>5. Insurance.</strong> Non-delivery insurance (1.0% premium, underwritten by Kita Earth Ltd) and invalidation insurance (2.5% premium, underwritten by CFC Underwriting Ltd via Lloyd&apos;s) are included in this transaction.</p>
          <p><strong>6. Title.</strong> Title passes upon confirmed Delivery on the relevant Registry.</p>
          <p><strong>7. Representations.</strong> The Seller warrants that the Credits are validly issued, free from encumbrances, and have not been previously retired or transferred. The Buyer warrants it has authority to enter into this Agreement.</p>
          <p><strong>8. Limitation of Liability.</strong> CarbonBridge&apos;s total liability shall not exceed the Total Amount Due. Neither party shall be liable for indirect or consequential damages.</p>
          <p><strong>9. Dispute Resolution.</strong> Disputes shall be resolved by the courts of Abu Dhabi Global Market (ADGM), applying English common law.</p>
          <p><strong>10. Governing Law.</strong> This Agreement is governed by the laws of Abu Dhabi Global Market pursuant to the ADGM Application of English Law Regulations 2015.</p>
          <p><strong>11. Electronic Execution.</strong> This Agreement may be executed electronically. Electronic signatures have the same legal effect as handwritten signatures under the ADGM Electronic Transactions Regulations.</p>
          <br />
          <p style={{ color: '#8A8279', fontSize: '11px' }}>For the full 19-section agreement including all definitions, warranties, force majeure, confidentiality, and general provisions, refer to the complete Purchase Agreement document attached to this transaction.</p>
          <br />
          <p style={{ textAlign: 'center', color: '#C9A96E', fontWeight: 700, fontSize: '13px' }}>— End of Agreement Summary —</p>
          <p style={{ textAlign: 'center', color: '#8A8279', fontSize: '11px', marginTop: '8px' }}>Scroll complete. You may now proceed to sign.</p>
        </div>

        {!scrolledToBottom && (
          <div style={{ textAlign: 'center', color: '#C9A96E', fontSize: '12px', marginBottom: '12px' }}>
            ↓ Please scroll to the bottom of the agreement to continue
          </div>
        )}

        <button
          onClick={() => scrolledToBottom && setStep('sign')}
          disabled={!scrolledToBottom}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none', cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
            background: scrolledToBottom ? '#1B3A2D' : '#E5DED3', color: scrolledToBottom ? '#F2ECE0' : '#8A8279',
            fontFamily: bg, fontSize: '15px', fontWeight: 700, transition: 'all 0.2s',
          }}
        >
          {scrolledToBottom ? 'Continue to Sign →' : 'Scroll to bottom to continue'}
        </button>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // STEP 2: Sign
  // ──────────────────────────────────────────────
  if (step === 'sign') return (
    <div style={{ minHeight: '100vh', background: '#F8F5EF', fontFamily: bg }}>
      <div style={{ background: '#1B3A2D', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '32px' }} />
        <div style={{ fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>{a.reference}</div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {['Review', 'Sign', 'Complete'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '3px', borderRadius: '2px', background: i <= 1 ? '#1B3A2D' : '#E5DED3', marginBottom: '6px' }} />
              <span style={{ fontSize: '11px', fontWeight: i === 1 ? 700 : 400, color: i <= 1 ? '#1B3A2D' : '#8A8279' }}>{s}</span>
            </div>
          ))}
        </div>

        <h1 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1B3A2D', marginBottom: '4px' }}>
          Sign Agreement
        </h1>
        <p style={{ color: '#6B6259', fontSize: '14px', marginBottom: '24px' }}>
          Your electronic signature is legally binding under ADGM Electronic Transactions Regulations.
        </p>

        {/* Signature method toggle */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#E5DED3', borderRadius: '10px', padding: '3px' }}>
          {(['type', 'draw'] as const).map(m => (
            <button key={m} onClick={() => setSigMethod(m)} style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: sigMethod === m ? '#FFFCF6' : 'transparent',
              color: sigMethod === m ? '#1B3A2D' : '#8A8279',
              fontWeight: sigMethod === m ? 700 : 400, fontSize: '13px', fontFamily: bg,
              boxShadow: sigMethod === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
              {m === 'type' ? '⌨️ Type Name' : '✏️ Draw Signature'}
            </button>
          ))}
        </div>

        {/* Signature input */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A8279', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            {sigMethod === 'type' ? 'Type your full legal name' : 'Draw your signature'}
          </div>

          {sigMethod === 'type' ? (
            <>
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="e.g. Ahmad Al-Mansouri"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5DED3',
                  fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: '24px', color: '#1B3A2D',
                  background: '#fff', outline: 'none',
                }}
              />
              {typedName.trim().length >= 3 && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '10px', border: '1px dashed #E5DED3', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8A8279', marginBottom: '8px' }}>Signature Preview</div>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '32px', color: '#1B3A2D' }}>{typedName}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5DED3' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                  style={{ width: '100%', height: '150px', cursor: 'crosshair', touchAction: 'none', background: '#FFFCF6' }}
                />
                <button onClick={clearCanvas} style={{
                  position: 'absolute', top: '8px', right: '8px', padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid #E5DED3', background: '#fff', fontSize: '11px', color: '#8A8279', cursor: 'pointer',
                }}>Clear</button>
              </div>
              <p style={{ fontSize: '11px', color: '#8A8279', marginTop: '8px' }}>Use your mouse or finger to draw your signature above.</p>
            </>
          )}
        </div>

        {/* Legal checkboxes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#1B3A2D' }} />
            <span style={{ fontSize: '13px', color: '#5A5248', lineHeight: 1.5 }}>
              I have read and agree to the terms of Purchase Agreement <strong>{a.reference}</strong>, including the credit details,
              pricing, payment terms, delivery obligations, insurance conditions, and dispute resolution provisions.
            </span>
          </label>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedAuthority} onChange={e => setAgreedAuthority(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#1B3A2D' }} />
            <span style={{ fontSize: '13px', color: '#5A5248', lineHeight: 1.5 }}>
              I confirm that I am authorised to sign this agreement on behalf of <strong>{a.buyerCompany}</strong> and that
              my electronic signature constitutes a legally binding commitment under the ADGM Electronic Transactions Regulations.
            </span>
          </label>
        </div>

        {/* Audit trail preview */}
        <div style={{ background: '#fff', border: '1px solid #E5DED3', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '11px', fontFamily: mono, color: '#8A8279' }}>
          <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#8A8279', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Audit Trail</div>
          <div>IP: {signedIP || 'Detecting...'}</div>
          <div>Browser: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 60) + '...' : ''}</div>
          <div>Timestamp: {new Date().toISOString()}</div>
          <div>Method: {sigMethod === 'type' ? 'Typed Name' : 'Drawn Signature'}</div>
        </div>

        <button
          onClick={handleSign}
          disabled={!canSign || signing}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            cursor: canSign && !signing ? 'pointer' : 'not-allowed',
            background: canSign && !signing ? '#1B3A2D' : '#E5DED3',
            color: canSign && !signing ? '#F2ECE0' : '#8A8279',
            fontFamily: bg, fontSize: '15px', fontWeight: 700, transition: 'all 0.2s',
          }}
        >
          {signing ? 'Signing...' : `Sign Agreement — ${fmtUSD(a.totalAmount)}`}
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#8A8279', marginTop: '12px' }}>
          🔒 256-bit encrypted · ADGM-compliant · Audit trail recorded
        </p>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // STEP 3: Complete
  // ──────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F8F5EF', fontFamily: bg }}>
      <div style={{ background: '#1B3A2D', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '32px' }} />
        <div style={{ fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>{a.reference}</div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {['Review', 'Sign', 'Complete'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '3px', borderRadius: '2px', background: '#1B3A2D', marginBottom: '6px' }} />
              <span style={{ fontSize: '11px', fontWeight: i === 2 ? 700 : 400, color: '#1B3A2D' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Success */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '36px' }}>✓</div>
          <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1B3A2D', marginBottom: '8px' }}>
            Agreement Signed
          </h1>
          <p style={{ color: '#6B6259', fontSize: '14px' }}>
            Your purchase agreement has been executed electronically.
          </p>
        </div>

        {/* Signature certificate */}
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Electronic Signature Certificate
          </div>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '6px 0', color: '#8A8279', width: '140px' }}>Agreement</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{a.reference}</td></tr>
              <tr><td style={{ padding: '6px 0', color: '#8A8279' }}>Signer</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{a.buyerContact}</td></tr>
              <tr><td style={{ padding: '6px 0', color: '#8A8279' }}>Company</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{a.buyerCompany}</td></tr>
              <tr><td style={{ padding: '6px 0', color: '#8A8279' }}>Email</td><td style={{ padding: '6px 0' }}>{a.buyerEmail}</td></tr>
              <tr><td style={{ padding: '6px 0', color: '#8A8279' }}>Signed at</td><td style={{ padding: '6px 0', fontFamily: mono, fontSize: '12px' }}>{signedAt}</td></tr>
              <tr><td style={{ padding: '6px 0', color: '#8A8279' }}>IP Address</td><td style={{ padding: '6px 0', fontFamily: mono, fontSize: '12px' }}>{signedIP}</td></tr>
              <tr><td style={{ padding: '6px 0', color: '#8A8279' }}>Method</td><td style={{ padding: '6px 0' }}>{sigMethod === 'type' ? 'Typed Name' : 'Drawn Signature'}</td></tr>
              <tr>
                <td style={{ padding: '6px 0', color: '#8A8279' }}>Signature</td>
                <td style={{ padding: '6px 0' }}>
                  {signatureData?.startsWith('TYPED:') ? (
                    <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#1B3A2D' }}>
                      {signatureData.replace('TYPED:', '')}
                    </span>
                  ) : (
                    <img src={signatureData || ''} alt="Signature" style={{ height: '50px' }} />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E5DED3', fontSize: '11px', color: '#8A8279' }}>
            This electronic signature is legally valid under the ADGM Electronic Transactions Regulations.
            The audit trail above is cryptographically recorded and forms part of the transaction record.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <a href={`/sample-agreement.html`} target="_blank" style={{
            flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #E5DED3', background: '#FFFCF6',
            textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#1B3A2D', textDecoration: 'none',
          }}>
            📄 Download Agreement (PDF)
          </a>
          <Link href="/dashboard" style={{
            flex: 1, padding: '14px', borderRadius: '10px', border: 'none', background: '#1B3A2D',
            textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#F2ECE0', textDecoration: 'none',
          }}>
            Go to Dashboard →
          </Link>
        </div>

        {/* Next steps */}
        <div style={{ background: '#fff', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1B3A2D', marginBottom: '12px' }}>What happens next</div>
          <div style={{ fontSize: '13px', color: '#6B6259', lineHeight: 1.7 }}>
            {a.paymentMethod === 'Bank Transfer' ? (
              <>
                <p>1. Transfer <strong style={{ fontFamily: mono }}>{fmtUSD(a.totalAmount)}</strong> to the CarbonBridge escrow account using reference <strong>{a.reference}</strong>.</p>
                <p>2. Once funds are received and cleared (1-2 business days), the seller is notified to transfer credits.</p>
                <p>3. Credits will be transferred to your registry account within 24-72 hours of payment confirmation.</p>
                <p>4. You&apos;ll receive an email confirmation with serial numbers and your retirement certificate.</p>
              </>
            ) : (
              <>
                <p>1. Payment has been captured. The seller has been notified.</p>
                <p>2. Credits will be transferred to your registry account within 24-72 hours.</p>
                <p>3. You&apos;ll receive an email confirmation with serial numbers and your retirement certificate.</p>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#8A8279', marginTop: '20px' }}>
          A copy of the signed agreement and certificate has been emailed to {a.buyerEmail}.
        </p>
      </div>
    </div>
  );
}
