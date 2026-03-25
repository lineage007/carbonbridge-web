'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const result = await signIn(email, password);
    if (result.error) { setError(result.error); setLoading(false); return; }
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left — brand panel */}
      <div style={{ width: '45%', background: 'linear-gradient(175deg, #0C1C14, #1B3A2D)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }} className="hidden lg:flex">
        <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '40px', width: 'auto', marginBottom: '48px' }} /></Link>
        <h1 style={{ fontFamily: fr, fontSize: '38px', fontWeight: 600, color: '#FFFCF6', lineHeight: 1.2, marginBottom: '16px' }}>Where carbon credits<br/>meet institutional trust.</h1>
        <p style={{ fontFamily: bg, fontSize: '15px', color: '#8AAA92', lineHeight: 1.7, maxWidth: '420px' }}>Access the MENA region&apos;s most comprehensive carbon marketplace. Verified credits, integrated insurance, and real-time data.</p>
        <div style={{ display: 'flex', gap: '24px', marginTop: '40px' }}>
          {[{ n: '20+', l: 'Credit types' }, { n: '1.2M', l: 'tCO₂e listed' }, { n: 'AAA', l: 'Quality rated' }].map(s => (
            <div key={s.l}><div style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#C9A96E' }}>{s.n}</div><div style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92' }}>{s.l}</div></div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFCF6', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Link href="/" className="lg:hidden" style={{ display: 'block', marginBottom: '32px' }}><img src="/logo-green.png" alt="CarbonBridge" style={{ height: '36px' }} /></Link>

          {mode === 'login' ? (
            <>
              <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Sign in</h2>
              <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', marginBottom: '28px' }}>Enter your credentials to access your account.</p>

              <form onSubmit={handleLogin}>
                {error && <div style={{ fontFamily: bg, fontSize: '13px', color: '#DC2626', background: 'rgba(220,38,38,0.06)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

                <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8B8178', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', color: '#1A1714', marginBottom: '16px', outline: 'none', background: '#fff' }}
                  placeholder="you@company.com" />

                <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8B8178', display: 'block', marginBottom: '6px' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', color: '#1A1714', marginBottom: '8px', outline: 'none', background: '#fff' }}
                  placeholder="••••••••" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <label style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" style={{ accentColor: '#1B3A2D' }} /> Remember me
                  </label>
                  <button type="button" onClick={() => setMode('reset')} style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontFamily: bg, fontSize: '14px', fontWeight: 600,
                  background: loading ? '#8AAA92' : '#1B3A2D', color: '#FFFCF6',
                  transition: 'background 0.2s',
                }}>{loading ? 'Signing in...' : 'Sign in'}</button>
              </form>

              <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', textAlign: 'center', marginTop: '24px' }}>
                Don&apos;t have an account? <Link href="/register" style={{ color: '#C9A96E', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Reset password</h2>
              {resetSent ? (
                <div style={{ fontFamily: bg, fontSize: '14px', color: '#2D6A4F', background: 'rgba(45,106,79,0.06)', padding: '16px', borderRadius: '10px' }}>
                  <strong>Check your email.</strong> We&apos;ve sent a password reset link to {email}. It expires in 1 hour.
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setResetSent(true); }}>
                  <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', marginBottom: '20px' }}>Enter your email and we&apos;ll send you a reset link.</p>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', marginBottom: '16px', outline: 'none', background: '#fff' }}
                    placeholder="you@company.com" />
                  <button type="submit" style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: bg, fontSize: '14px', fontWeight: 600, background: '#1B3A2D', color: '#FFFCF6' }}>Send reset link</button>
                </form>
              )}
              <button onClick={() => { setMode('login'); setResetSent(false); }} style={{ fontFamily: bg, fontSize: '13px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', marginTop: '16px', display: 'block', width: '100%', textAlign: 'center' }}>← Back to sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
