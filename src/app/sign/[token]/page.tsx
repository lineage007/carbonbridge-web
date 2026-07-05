'use client';

import Link from 'next/link';

/*
 * E-Signature page — SERVICE NOT YET LIVE
 *
 * The full e-signature UI (drawn/typed signature, audit trail) was built but
 * used a hardcoded mock agreement object. Tokens were never validated against
 * the database, and signatures were never persisted — making any "signed" state
 * legally meaningless under ADGM Electronic Transactions Regulations.
 *
 * This page returns an honest 503-equivalent state until the real backend is
 * implemented:
 *   1. Create an `agreements` table with token → order mapping.
 *   2. Build GET /api/agreements/[token] to fetch the real agreement.
 *   3. Build POST /api/agreements/[token]/sign to persist: signatureData,
 *      signatureMethod, typedName, userAgent, IP, timestamp.
 *   4. Re-enable this page once the above is in place.
 *
 * DEPLOY-NOTES-2026-07-03.md entry: "esign-service-not-live" — needs Gary
 * approval before re-enabling to ensure legal review is complete.
 */

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export default function SignPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F5EF', fontFamily: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: '#1B3A2D', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '32px' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          {/* Status icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(74,139,100,0.12)', border: '1px solid rgba(74,139,100,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A8B64" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1B3A2D', marginBottom: '12px' }}>
            Signature Service Not Yet Live
          </h1>

          <p style={{ fontSize: '15px', color: '#6B6259', lineHeight: 1.65, marginBottom: '32px' }}>
            Electronic signature functionality is under development. This service will be available once our ADGM-compliant e-signature backend is in place. Please contact our team to complete your agreement by alternative means.
          </p>

          <div style={{
            background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px',
            padding: '20px', marginBottom: '28px', textAlign: 'left',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A8279', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              What to do next
            </div>
            <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '14px', color: '#5A5248', lineHeight: 1.7 }}>
              <li>Email <a href="mailto:info@carbonbridge.ae" style={{ color: '#1B3A2D', fontWeight: 600 }}>info@carbonbridge.ae</a> with your agreement reference.</li>
              <li>Our team will send a PDF agreement for signature via DocuSign or wet ink.</li>
              <li>Processing resumes once the signed agreement is received.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:info@carbonbridge.ae"
              style={{
                fontFamily: bg, fontSize: '14px', fontWeight: 600,
                color: '#F2ECE0', background: '#1B3A2D',
                padding: '13px 28px', borderRadius: '9px',
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              Contact our team
            </a>
            <Link
              href="/dashboard"
              style={{
                fontFamily: bg, fontSize: '14px', fontWeight: 500,
                color: '#1B3A2D', background: 'transparent',
                padding: '13px 28px', borderRadius: '9px',
                border: '1px solid #E5DED3',
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              Back to Dashboard
            </Link>
          </div>

          <p style={{ marginTop: '28px', fontSize: '11px', color: '#8A8279' }}>
            HTTP 503 — Service temporarily unavailable
          </p>
        </div>
      </div>
    </div>
  );
}
