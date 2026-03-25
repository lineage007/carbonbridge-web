'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";

type AccountType = 'buyer' | 'seller';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AccountType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Seller-specific
  const [registryAccounts, setRegistryAccounts] = useState('');
  const [projectCount, setProjectCount] = useState('');

  // Buyer-specific
  const [complianceNeeds, setComplianceNeeds] = useState<string[]>([]);
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setError(''); setLoading(true);
    const result = await signUp(email, password, { company_name: company, role: type, first_name: firstName, last_name: lastName });
    if (result.error) { setError(result.error); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  const Inp = ({ label, value, onChange, type: t = 'text', placeholder = '', required = true }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8B8178', display: 'block', marginBottom: '6px' }}>{label}</label>
      <input type={t} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
        style={{ width: '100%', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', color: '#1A1714', outline: 'none', background: '#fff' }} />
    </div>
  );

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFCF6', padding: '40px' }}>
      <div style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <span style={{ fontSize: '28px' }}>✓</span>
        </div>
        <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '12px' }}>Check your email</h1>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '24px' }}>
          We&apos;ve sent a verification link to <strong style={{ color: '#1A1714' }}>{email}</strong>. Click the link to activate your account.
          {type === 'seller' && <><br/><br/>Once verified, your seller account will be reviewed by our team within 48 hours. We&apos;ll email you when you&apos;re approved to list credits.</>}
        </p>
        <Link href="/login" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#C9A96E', textDecoration: 'none' }}>← Go to sign in</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left brand panel */}
      <div style={{ width: '45%', background: 'linear-gradient(175deg, #0C1C14, #1B3A2D)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }} className="hidden lg:flex">
        <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '40px', width: 'auto', marginBottom: '48px' }} /></Link>
        <h1 style={{ fontFamily: fr, fontSize: '34px', fontWeight: 600, color: '#FFFCF6', lineHeight: 1.2, marginBottom: '16px' }}>
          {type === 'seller' ? 'List your credits.\nReach institutional buyers.' : type === 'buyer' ? 'Access verified credits.\nWith integrated insurance.' : 'Join the marketplace.'}
        </h1>
        <p style={{ fontFamily: bg, fontSize: '15px', color: '#8AAA92', lineHeight: 1.7, maxWidth: '400px' }}>
          {type === 'seller' ? 'CarbonBridge connects project developers with corporate buyers, airlines, and governments across MENA.' : 'Browse credits from Verra, Gold Standard, and ACR. Compare quality ratings. Purchase with insurance at checkout.'}
        </p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFCF6', padding: '40px', overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <Link href="/" className="lg:hidden" style={{ display: 'block', marginBottom: '24px' }}><img src="/logo-green.png" alt="CarbonBridge" style={{ height: '36px' }} /></Link>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#1B3A2D' : '#E8E2D8', transition: 'background 0.3s' }} />)}
          </div>

          {step === 1 && (
            <>
              <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Create your account</h2>
              <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', marginBottom: '28px' }}>How will you use CarbonBridge?</p>

              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {[
                  { t: 'buyer' as const, title: 'I want to buy credits', desc: 'Browse the marketplace, purchase credits, manage your carbon portfolio, and access compliance tools.' },
                  { t: 'seller' as const, title: 'I want to sell credits', desc: 'List your verified carbon credits, reach institutional buyers, and get paid through our platform.' },
                ].map(opt => (
                  <button key={opt.t} onClick={() => { setType(opt.t); setStep(2); }}
                    style={{ padding: '20px', border: `2px solid ${type === opt.t ? '#1B3A2D' : '#E8E2D8'}`, borderRadius: '12px', background: type === opt.t ? 'rgba(27,58,45,0.03)' : '#fff', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>{opt.title}</div>
                    <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.5 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>

              <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', textAlign: 'center' }}>
                Already have an account? <Link href="/login" style={{ color: '#C9A96E', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Your details</h2>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>{type === 'seller' ? 'Tell us about your organisation and projects.' : 'Tell us about your company and needs.'}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <Inp label="First Name" value={firstName} onChange={setFirstName} placeholder="Khalid" />
                <Inp label="Last Name" value={lastName} onChange={setLastName} placeholder="Al Mansouri" />
              </div>
              <Inp label="Company Name" value={company} onChange={setCompany} placeholder="Emirates Industrial Group" />
              {type === 'buyer' && (
                <>
                  <Inp label="Your Role" value={role} onChange={setRole} placeholder="Head of Sustainability" required={false} />
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8B8178', display: 'block', marginBottom: '8px' }}>Compliance requirements (select all that apply)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['NRCC', 'CBAM', 'CORSIA', 'SBTi', 'Voluntary', 'None specific'].map(c => (
                        <button key={c} type="button" onClick={() => setComplianceNeeds(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                          style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${complianceNeeds.includes(c) ? '#1B3A2D' : '#E8E2D8'}`, background: complianceNeeds.includes(c) ? 'rgba(27,58,45,0.06)' : '#fff', fontFamily: bg, fontSize: '12px', fontWeight: 600, color: complianceNeeds.includes(c) ? '#1B3A2D' : '#8B8178', cursor: 'pointer' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {type === 'seller' && (
                <>
                  <Inp label="Registry accounts (Verra, Gold Standard, ACR)" value={registryAccounts} onChange={setRegistryAccounts} placeholder="Verra #12345, Gold Standard #67890" />
                  <Inp label="How many projects do you have?" value={projectCount} onChange={setProjectCount} placeholder="5" required={false} />
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', border: '1px solid #E8E2D8', borderRadius: '10px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#8B8178', background: '#fff', cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setStep(3)} disabled={!company || !firstName} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '10px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#FFFCF6', background: (!company || !firstName) ? '#C5BFB3' : '#1B3A2D', cursor: 'pointer' }}>Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Set up your login</h2>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '24px' }}>You&apos;ll use these credentials to access your {type} dashboard.</p>

              {error && <div style={{ fontFamily: bg, fontSize: '13px', color: '#DC2626', background: 'rgba(220,38,38,0.06)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

              <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="k.almansouri@company.ae" />
              <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="Minimum 8 characters" />

              <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginBottom: '24px', lineHeight: 1.6 }}>
                By creating an account, you agree to our <Link href="/legal/terms" style={{ color: '#C9A96E' }}>Terms of Service</Link> and <Link href="/legal/privacy" style={{ color: '#C9A96E' }}>Privacy Policy</Link>.
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', border: '1px solid #E8E2D8', borderRadius: '10px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#8B8178', background: '#fff', cursor: 'pointer' }}>← Back</button>
                <button type="submit" disabled={loading || !email || password.length < 8} style={{ flex: 2, padding: '14px', border: 'none', borderRadius: '10px', fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#FFFCF6', background: loading ? '#8AAA92' : '#1B3A2D', cursor: 'pointer' }}>
                  {loading ? 'Creating account...' : type === 'seller' ? 'Create seller account' : 'Create buyer account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
