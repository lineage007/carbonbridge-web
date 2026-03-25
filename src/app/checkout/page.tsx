'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LISTINGS, CREDIT_TYPE_COLORS } from '@/data/credits';
import { Suspense } from 'react';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

function CheckoutInner() {
  const searchParams = useSearchParams();
  const creditId = searchParams.get('credit');
  const initialQty = parseInt(searchParams.get('qty') || '0');
  
  const credit = LISTINGS.find(c => c.id === creditId);
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(initialQty || 100);
  const [addInsurance, setAddInsurance] = useState(false);
  const [insuranceType, setInsuranceType] = useState<string[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const refNumber = useMemo(() => `CB-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`, []);

  if (!credit) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center">
          <h1 style={{ fontFamily: fr, fontSize: '24px', color: '#1A1714', marginBottom: '12px' }}>No credit selected</h1>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', color: '#C9A96E', fontWeight: 600 }}>← Browse marketplace</Link>
        </div>
      </div>
    );
  }

  const unitPrice = credit.price;
  const subtotal = qty * unitPrice;
  const insuranceRate = 0.04;
  const insuranceCost = addInsurance ? subtotal * insuranceRate : 0;
  const total = subtotal + insuranceCost;
  const isLargeVolume = qty >= 10000;

  if (submitted) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center max-w-lg px-6">
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(45,106,79,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontFamily: fr, fontSize: '32px', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>Purchase request submitted</h1>
          <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '24px' }}>
            Our team will confirm availability and send you settlement instructions within 24 hours.
          </p>
          <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <div className="grid grid-cols-2 gap-3" style={{ fontFamily: bg, fontSize: '13px' }}>
              <div><span style={{ color: '#B0A99A' }}>Reference:</span></div>
              <div style={{ fontFamily: mono, fontWeight: 600, color: '#1A1714' }}>{refNumber}</div>
              <div><span style={{ color: '#B0A99A' }}>Credit:</span></div>
              <div style={{ color: '#1A1714', fontWeight: 600 }}>{credit.projectName}</div>
              <div><span style={{ color: '#B0A99A' }}>Quantity:</span></div>
              <div style={{ fontFamily: mono, color: '#1A1714' }}>{qty.toLocaleString()} tCO₂e</div>
              <div><span style={{ color: '#B0A99A' }}>Total value:</span></div>
              <div style={{ fontFamily: mono, fontWeight: 700, color: '#1B3A2D' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              {addInsurance && <>
                <div><span style={{ color: '#B0A99A' }}>Insurance:</span></div>
                <div style={{ fontFamily: mono, color: '#C9A96E' }}>+${insuranceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </>}
            </div>
          </div>
          <p style={{ fontFamily: bg, fontSize: '12px', color: '#B0A99A', marginBottom: '20px' }}>
            A confirmation email has been sent to {contactEmail || 'your email address'}.
          </p>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px', display: 'inline-block' }}>
            Continue browsing →
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Quantity' },
    { num: 2, label: 'Insurance' },
    { num: 3, label: 'Review' },
    { num: 4, label: 'Details' },
    { num: 5, label: 'Confirm' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
      {/* Progress */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center" style={{ flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div className="flex flex-col items-center">
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s.num ? '#1B3A2D' : '#F0EBE3',
                color: step >= s.num ? '#FFFCF6' : '#B0A99A',
                fontFamily: bg, fontSize: '12px', fontWeight: 700, transition: 'all 0.3s',
              }}>{step > s.num ? '✓' : s.num}</div>
              <span style={{ fontFamily: bg, fontSize: '10px', color: step >= s.num ? '#1A1714' : '#B0A99A', marginTop: '4px', fontWeight: 600 }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: '2px', background: step > s.num ? '#1B3A2D' : '#E8E2D6', margin: '0 8px', marginBottom: '18px', transition: 'background 0.3s' }} />}
          </div>
        ))}
      </div>

      {/* Credit summary bar */}
      <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: 'white', background: CREDIT_TYPE_COLORS[credit.creditType], padding: '3px 8px', borderRadius: '4px' }}>{credit.creditType}</span>
          <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>{credit.projectName}</span>
        </div>
        <span style={{ fontFamily: fr, fontSize: '18px', fontWeight: 700, color: '#1A1714' }}>${unitPrice.toFixed(2)}<span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', fontWeight: 400 }}>/tCO₂e</span></span>
      </div>

      {/* Step content */}
      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>How many credits?</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>Minimum order: 100 tCO₂e. Available: {credit.volumeAvailable.toLocaleString()} tCO₂e.</p>
          
          <input type="number" value={qty} onChange={e => setQty(Math.max(100, parseInt(e.target.value) || 0))} min={100} max={credit.volumeAvailable}
            style={{ fontFamily: mono, fontSize: '24px', fontWeight: 700, width: '100%', padding: '16px 20px', border: '2px solid #E8E2D6', borderRadius: '12px', textAlign: 'center', color: '#1A1714', outline: 'none' }} />
          <div className="flex justify-between mt-2" style={{ fontFamily: bg, fontSize: '12px', color: '#B0A99A' }}>
            <span>Min: 100</span>
            <span>Max: {credit.volumeAvailable.toLocaleString()}</span>
          </div>

          {/* Quick select */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[100, 500, 1000, 5000, 10000, 50000].filter(v => v <= credit.volumeAvailable).map(v => (
              <button key={v} onClick={() => setQty(v)} style={{
                fontFamily: mono, fontSize: '12px', fontWeight: qty === v ? 700 : 500,
                color: qty === v ? '#1B3A2D' : '#8B8178',
                background: qty === v ? 'rgba(27,58,45,0.08)' : 'white',
                border: `1px solid ${qty === v ? '#1B3A2D' : '#E8E2D6'}`,
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              }}>{v.toLocaleString()}</button>
            ))}
          </div>

          <div style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '16px', marginTop: '20px' }}>
            <div className="flex justify-between" style={{ fontFamily: bg, fontSize: '14px', color: '#1A1714' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: mono, fontWeight: 700 }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {isLargeVolume && (
            <div style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6 }}>
                <strong style={{ color: '#C9A96E' }}>Large volume order.</strong> For purchases over 10,000 tCO₂e, preferred pricing may be available. You can proceed here or <Link href={`/contact?subject=RFQ: ${credit.projectName}`} style={{ color: '#C9A96E', fontWeight: 600 }}>request a custom quote</Link>.
              </p>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Would you like insurance?</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>Protect your purchase against delivery failure, credit invalidation, and political risk. Coverage is entirely optional.</p>

          <div className="space-y-3">
            <label className="flex items-start gap-4 cursor-pointer" style={{ background: addInsurance ? 'rgba(27,58,45,0.04)' : 'white', border: `1px solid ${addInsurance ? '#1B3A2D' : '#E8E2D6'}`, borderRadius: '12px', padding: '18px', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={addInsurance} onChange={() => setAddInsurance(!addInsurance)} style={{ accentColor: '#1B3A2D', marginTop: '3px' }} />
              <div>
                <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714', marginBottom: '4px' }}>Add credit guarantee</div>
                <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6 }}>
                  Comprehensive protection: non-delivery, invalidation, and political risk. Premium: ~4% of purchase value.
                </p>
                {addInsurance && (
                  <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 600, color: '#C9A96E', marginTop: '8px' }}>
                    +${insuranceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer" style={{ background: !addInsurance ? 'rgba(27,58,45,0.04)' : 'white', border: `1px solid ${!addInsurance ? '#1B3A2D' : '#E8E2D6'}`, borderRadius: '12px', padding: '18px', transition: 'all 0.2s' }}>
              <input type="radio" checked={!addInsurance} onChange={() => setAddInsurance(false)} style={{ accentColor: '#1B3A2D', marginTop: '3px' }} />
              <div>
                <div style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>No insurance</div>
                <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>Proceed without credit guarantee coverage.</p>
              </div>
            </label>
          </div>

          <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '16px', fontStyle: 'italic' }}>
            Insurance facilitated through Kita and Lloyd&apos;s of London syndicates. Full terms provided before confirmation.
          </p>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Review your order</h2>
          <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '24px' }}>
            <div className="space-y-3" style={{ fontFamily: bg, fontSize: '14px' }}>
              {[
                { label: 'Credit', value: credit.projectName },
                { label: 'Type', value: credit.creditType },
                { label: 'Quality', value: credit.qualityRating },
                { label: 'Quantity', value: `${qty.toLocaleString()} tCO₂e`, mono: true },
                { label: 'Unit price', value: `$${unitPrice.toFixed(2)} /tCO₂e`, mono: true },
                { label: 'Subtotal', value: `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, mono: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #F0EBE3' }}>
                  <span style={{ color: '#8B8178' }}>{row.label}</span>
                  <span style={{ fontFamily: row.mono ? mono : bg, fontWeight: 600, color: '#1A1714' }}>{row.value}</span>
                </div>
              ))}
              {addInsurance && (
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #F0EBE3' }}>
                  <span style={{ color: '#8B8178' }}>Credit guarantee (~4%)</span>
                  <span style={{ fontFamily: mono, fontWeight: 600, color: '#C9A96E' }}>+${insuranceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span style={{ fontWeight: 700, color: '#1A1714', fontSize: '16px' }}>Total</span>
                <span style={{ fontFamily: mono, fontWeight: 700, color: '#1B3A2D', fontSize: '18px' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div style={{ background: '#F5F0E8', borderRadius: '10px', padding: '14px', marginTop: '16px' }}>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6 }}>
                <strong style={{ color: '#1A1714' }}>Settlement:</strong> Stripe escrow for transactions under $100K. Institutional DvP via ACX/Carbonplace for $100K+. Our team will confirm the settlement method after submission.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Your details</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>We&apos;ll use this to send your confirmation and settlement instructions.</p>
          <div className="space-y-4">
            <InputField label="Company name" value={companyName} onChange={setCompanyName} required />
            <InputField label="Contact name" value={contactName} onChange={setContactName} required />
            <InputField label="Email address" value={contactEmail} onChange={setContactEmail} type="email" required />
            <div>
              <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any special requirements, preferred settlement dates, etc."
                style={{ fontFamily: bg, fontSize: '14px', width: '100%', padding: '12px 14px', border: '1px solid #E8E2D6', borderRadius: '10px', background: 'white', color: '#1A1714', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="text-center">
          <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Confirm your purchase request</h2>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>
            By clicking confirm, you&apos;re submitting a binding purchase request. Our team will contact you within 24 hours with settlement instructions.
          </p>
          <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left', maxWidth: '400px', margin: '0 auto 24px' }}>
            <div style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714', lineHeight: 2 }}>
              <strong>{credit.projectName}</strong><br />
              {qty.toLocaleString()} tCO₂e @ ${unitPrice.toFixed(2)}<br />
              {addInsurance && <>Insurance: +${insuranceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br /></>}
              <span style={{ fontFamily: mono, fontSize: '18px', fontWeight: 700, color: '#1B3A2D' }}>Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-6" style={{ borderTop: '1px solid #E8E2D6' }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : null} style={{
          fontFamily: bg, fontSize: '14px', fontWeight: 600, color: step > 1 ? '#1A1714' : '#E8E2D6',
          background: 'transparent', border: '1px solid #E8E2D6', padding: '12px 24px', borderRadius: '10px',
          cursor: step > 1 ? 'pointer' : 'default', opacity: step > 1 ? 1 : 0.4,
        }}>← Back</button>
        
        {step < 5 ? (
          <button onClick={() => {
            if (step === 4 && (!contactName || !contactEmail || !companyName)) return;
            setStep(step + 1);
          }} style={{
            fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E',
            padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', border: 'none',
          }} className="hover:brightness-110 transition-all">
            Continue →
          </button>
        ) : (
          <button onClick={() => setSubmitted(true)} style={{
            fontFamily: bg, fontSize: '14px', fontWeight: 700, color: 'white', background: '#1B3A2D',
            padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', border: 'none',
          }} className="hover:brightness-110 transition-all">
            Confirm purchase request
          </button>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '12px', fontWeight: 600, color: '#1A1714', display: 'block', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#C9A96E' }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '14px', width: '100%', padding: '12px 14px', border: '1px solid #E8E2D6', borderRadius: '10px', background: 'white', color: '#1A1714', outline: 'none' }} />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(12,28,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: "40px", width: "auto" }} />
            
          </Link>
          <Link href="/marketplace" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '13px', color: 'rgba(255,252,246,0.5)' }}>← Back to marketplace</Link>
        </div>
      </nav>
      <div className="pt-16">
        <Suspense fallback={<div className="flex items-center justify-center py-20" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: '#8B8178' }}>Loading...</div>}>
          <CheckoutInner />
        </Suspense>
      </div>
    </main>
  );
}
