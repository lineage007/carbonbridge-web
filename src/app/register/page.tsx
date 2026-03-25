'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

const COMPANY_TYPES = [
  { value: 'corporate', label: 'Corporate / Industrial' },
  { value: 'airline', label: 'Airline' },
  { value: 'government', label: 'Government / Sovereign' },
  { value: 'financial', label: 'Financial Institution' },
  { value: 'developer', label: 'Project Developer' },
  { value: 'broker', label: 'Broker / Trader' },
  { value: 'other', label: 'Other' },
];

const COMPLIANCE = ['NRCC', 'CBAM', 'CORSIA', 'Voluntary', 'SBTi'];
const VOLUMES = [
  { value: 'under_1k', label: 'Under 1,000 tCO₂e' },
  { value: '1k_10k', label: '1,000 – 10,000 tCO₂e' },
  { value: '10k_100k', label: '10,000 – 100,000 tCO₂e' },
  { value: '100k_plus', label: '100,000+ tCO₂e' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    companyName: '', contactName: '', country: 'AE',
    companyType: 'corporate',
    plansTo: [] as string[],
    compliance: [] as string[],
    volume: '',
    registries: [] as string[],
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: 'plansTo' | 'compliance' | 'registries', v: string) =>
    setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            company_name: form.companyName,
            contact_name: form.contactName,
            country: form.country,
            company_type: form.companyType,
            plans_to: form.plansTo,
            compliance_needs: form.compliance,
            estimated_volume: form.volume,
            registry_accounts: form.registries,
          },
        },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0C1C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>✉️</div>
          <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#F2ECE0', marginBottom: '12px' }}>Check your email</h1>
          <p style={{ fontFamily: bg, fontSize: '15px', color: '#8AAA92', lineHeight: 1.7 }}>
            We&apos;ve sent a verification link to <strong style={{ color: '#C9A96E' }}>{form.email}</strong>. Click the link to activate your account.
          </p>
          <Link href="/login" style={{ fontFamily: bg, fontSize: '14px', color: '#C9A96E', marginTop: '24px', display: 'inline-block' }}>← Back to sign in</Link>
        </div>
      </div>
    );
  }

  const inputStyle = { fontFamily: bg, fontSize: '14px', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(255,252,246,0.04)', color: '#F2ECE0', width: '100%', outline: 'none' };
  const labelStyle = { fontFamily: bg, fontSize: '12px', fontWeight: 600 as const, color: '#8AAA92', marginBottom: '6px', display: 'block' as const };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0C1C14 0%, #1B3A2D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '36px', marginBottom: '24px' }} /></Link>
          <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#F2ECE0', marginBottom: '8px' }}>Create your account</h1>
          <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92' }}>One account for buying, selling, and managing carbon credits</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= s ? '#C9A96E' : 'rgba(201,169,110,0.15)' }} />
          ))}
        </div>

        <div style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '16px', padding: '32px' }}>
          {error && <div style={{ fontFamily: bg, fontSize: '13px', color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>Contact name *</label><input style={inputStyle} value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Your full name" /></div>
                <div><label style={labelStyle}>Company name *</label><input style={inputStyle} value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Company Ltd" /></div>
              </div>
              <div><label style={labelStyle}>Email *</label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>Password *</label><input type="password" style={inputStyle} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" /></div>
                <div><label style={labelStyle}>Confirm password *</label><input type="password" style={inputStyle} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Country *</label>
                  <select style={{ ...inputStyle, appearance: 'none' as const }} value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="AE">United Arab Emirates</option><option value="SA">Saudi Arabia</option><option value="QA">Qatar</option><option value="KW">Kuwait</option><option value="BH">Bahrain</option><option value="OM">Oman</option><option value="AU">Australia</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="SG">Singapore</option><option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Company type *</label>
                  <select style={{ ...inputStyle, appearance: 'none' as const }} value={form.companyType} onChange={e => set('companyType', e.target.value)}>
                    {COMPANY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { if (!form.email || !form.password || !form.companyName || !form.contactName) { setError('Please fill all required fields'); return; } setError(''); setStep(2); }}
                style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, padding: '14px', borderRadius: '10px', border: 'none', background: '#C9A96E', color: '#0C1C14', cursor: 'pointer', width: '100%', marginTop: '8px' }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>I plan to... *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Buy credits', 'Sell credits', 'Both', 'Not sure yet'].map(opt => {
                    const val = opt.toLowerCase().replace(/ /g, '_');
                    const active = form.plansTo.includes(val);
                    return <button key={opt} onClick={() => toggleArr('plansTo', val)} style={{ fontFamily: bg, fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${active ? '#C9A96E' : 'rgba(201,169,110,0.15)'}`, background: active ? 'rgba(201,169,110,0.1)' : 'transparent', color: active ? '#C9A96E' : '#8AAA92', cursor: 'pointer' }}>{opt}</button>;
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Compliance needs (optional)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COMPLIANCE.map(c => {
                    const active = form.compliance.includes(c.toLowerCase());
                    return <button key={c} onClick={() => toggleArr('compliance', c.toLowerCase())} style={{ fontFamily: bg, fontSize: '12px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${active ? '#C9A96E' : 'rgba(201,169,110,0.12)'}`, background: active ? 'rgba(201,169,110,0.08)' : 'transparent', color: active ? '#C9A96E' : '#6B8A74', cursor: 'pointer' }}>{c}</button>;
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Estimated annual volume (optional)</label>
                <select style={{ ...inputStyle, appearance: 'none' as const }} value={form.volume} onChange={e => set('volume', e.target.value)}>
                  <option value="">Select...</option>
                  {VOLUMES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Registry accounts held (optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Verra', 'Gold Standard', 'ACR'].map(r => {
                    const val = r.toLowerCase().replace(/ /g, '_');
                    const active = form.registries.includes(val);
                    return <button key={r} onClick={() => toggleArr('registries', val)} style={{ fontFamily: bg, fontSize: '12px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${active ? '#C9A96E' : 'rgba(201,169,110,0.12)'}`, background: active ? 'rgba(201,169,110,0.08)' : 'transparent', color: active ? '#C9A96E' : '#6B8A74', cursor: 'pointer' }}>{r}</button>;
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setStep(1)} style={{ fontFamily: bg, fontSize: '14px', padding: '14px', borderRadius: '10px', border: '1px solid rgba(201,169,110,0.15)', background: 'transparent', color: '#8AAA92', cursor: 'pointer', flex: 1 }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, padding: '14px', borderRadius: '10px', border: 'none', background: '#C9A96E', color: '#0C1C14', cursor: loading ? 'wait' : 'pointer', flex: 2, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link href="/login" style={{ color: '#C9A96E' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
