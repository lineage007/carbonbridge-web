'use client';

import { useState } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

type AccountType = 'buyer' | 'seller';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>('buyer');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
        <Nav />
        <div className="pt-16 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center max-w-md px-6">
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(27,58,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1A1714', marginBottom: '12px' }}>
              {accountType === 'buyer' ? 'Account created' : 'Application submitted'}
            </h1>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '24px' }}>
              {accountType === 'buyer'
                ? 'Your buyer account is active. You can now browse the marketplace, save credits to your watchlist, and submit purchase requests.'
                : 'Your seller application is under review. Our team will verify your registry credentials and approve your account within 48 hours. You\'ll receive a confirmation email.'}
            </p>
            <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '12px 28px', borderRadius: '10px', display: 'inline-block' }}>
              Browse marketplace →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <Nav />
      <div className="pt-16">
        {/* Header */}
        <div style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D)', padding: '48px 0 40px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
          <div className="max-w-lg mx-auto px-6 text-center">
            <h1 style={{ fontFamily: fr, fontSize: '32px', fontWeight: 700, color: '#FFFCF6', marginBottom: '8px' }}>Create your account</h1>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92' }}>
              Join the Gulf&apos;s first institutional carbon credit marketplace
            </p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-6 py-10">
          {/* Account type toggle */}
          <div className="flex gap-2 mb-8 p-1.5" style={{ background: '#F0EBE3', borderRadius: '12px' }}>
            {(['buyer', 'seller'] as const).map(t => (
              <button key={t} onClick={() => setAccountType(t)} style={{
                fontFamily: bg, fontSize: '14px', fontWeight: 600, flex: 1, padding: '12px',
                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                background: accountType === t ? 'white' : 'transparent',
                color: accountType === t ? '#1A1714' : '#8B8178',
                boxShadow: accountType === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {t === 'buyer' ? '🏢 Buyer' : '🌿 Seller / Developer'}
              </button>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
            {/* Common fields */}
            <Section title="Company details">
              <Field label="Company name" name="company" required />
              <Field label="Contact name" name="contact" required />
              <Field label="Email address" name="email" type="email" required />
              <Field label="Country" name="country" required />
              <Field label="Password" name="password" type="password" required />
            </Section>

            {accountType === 'buyer' ? (
              <>
                <Section title="Buyer profile">
                  <SelectField label="Company type" name="company_type" options={['Corporate', 'Airline', 'Government', 'Financial Institution', 'Other']} required />
                  
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '8px' }}>Compliance needs</span>
                    <div className="flex flex-wrap gap-2">
                      {['NRCC', 'CBAM', 'CORSIA', 'Voluntary', 'SBTi / BVCM', 'VCMI'].map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714', background: '#F5F0E8', border: '1px solid #E8E2D6', padding: '8px 14px', borderRadius: '8px' }}>
                          <input type="checkbox" name="compliance" value={c} style={{ accentColor: '#C9A96E' }} />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>

                  <SelectField label="Estimated annual credit volume" name="volume" options={['Under 1,000 tCO₂e', '1,000 – 10,000 tCO₂e', '10,000 – 100,000 tCO₂e', '100,000+ tCO₂e']} required />
                </Section>
              </>
            ) : (
              <>
                <Section title="Developer profile">
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '8px' }}>Registry accounts</span>
                    <div className="flex flex-wrap gap-2">
                      {['Verra VCS', 'Gold Standard', 'ACR'].map(r => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714', background: '#F5F0E8', border: '1px solid #E8E2D6', padding: '8px 14px', borderRadius: '8px' }}>
                          <input type="checkbox" name="registries" value={r} style={{ accentColor: '#C9A96E' }} />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Field label="Number of registered projects" name="projects" type="number" required />
                  <Field label="Estimated annual volume available (tCO₂e)" name="volume" type="number" required />
                  
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '8px' }}>Primary credit types</span>
                    <div className="flex flex-wrap gap-2">
                      {['ARR', 'REDD+', 'Blue Carbon', 'Soil Carbon', 'Biochar', 'Energy Efficiency', 'Other'].map(t => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714', background: '#F5F0E8', border: '1px solid #E8E2D6', padding: '8px 14px', borderRadius: '8px' }}>
                          <input type="checkbox" name="credit_types" value={t} style={{ accentColor: '#C9A96E' }} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                </Section>

                <div style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6 }}>
                    <strong style={{ color: '#1A1714' }}>Seller verification:</strong> All seller accounts require manual review before listings go live. We verify registry credentials and project ownership to protect marketplace integrity. Typical review time: 24-48 hours.
                  </p>
                </div>
              </>
            )}

            <button type="submit" style={{ fontFamily: bg, fontSize: '15px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', width: '100%', padding: '15px', borderRadius: '10px', cursor: 'pointer', border: 'none' }} className="hover:brightness-110 transition-all">
              {accountType === 'buyer' ? 'Create buyer account' : 'Submit seller application'}
            </button>

            <p style={{ fontFamily: bg, fontSize: '12px', color: '#B0A99A', textAlign: 'center', marginTop: '16px' }}>
              Already have an account? <Link href="/login" style={{ color: '#C9A96E', fontWeight: 600 }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(12,28,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo-white.png" alt="CarbonBridge" style={{ height: "40px", width: "auto" }} />
          
        </Link>
        <Link href="/marketplace" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '13px', color: 'rgba(255,252,246,0.5)' }} className="hover:text-white transition-colors">Marketplace</Link>
      </div>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '13px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #E8E2D6' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#C9A96E' }}>*</span>}
      </label>
      <input type={type} name={name} required={required} style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '14px', width: '100%', padding: '11px 14px', border: '1px solid #E8E2D6', borderRadius: '9px', background: 'white', color: '#1A1714', outline: 'none' }} />
    </div>
  );
}

function SelectField({ label, name, options, required = false }: { label: string; name: string; options: string[]; required?: boolean }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#C9A96E' }}>*</span>}
      </label>
      <select name={name} required={required} style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '14px', width: '100%', padding: '11px 14px', border: '1px solid #E8E2D6', borderRadius: '9px', background: 'white', color: '#1A1714' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
