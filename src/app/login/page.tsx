'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      
      // Check role for redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          router.push('/admin');
        } else {
          const params = new URLSearchParams(window.location.search);
          router.push(params.get('redirect') || '/dashboard');
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    setLoading(true); setError('');
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally { setLoading(false); }
  };

  const inputStyle = { fontFamily: bg, fontSize: '14px', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(255,252,246,0.04)', color: '#F2ECE0', width: '100%', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0C1C14 0%, #1B3A2D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '36px', marginBottom: '28px' }} /></Link>
          <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#F2ECE0', marginBottom: '8px' }}>
            {resetMode ? 'Reset password' : 'Welcome back'}
          </h1>
          <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92' }}>
            {resetMode ? 'Enter your email to receive a reset link' : 'Sign in to your CarbonBridge account'}
          </p>
        </div>

        <div style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '16px', padding: '32px' }}>
          {error && <div style={{ fontFamily: bg, fontSize: '13px', color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
          
          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>✉️</div>
              <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', lineHeight: 1.7 }}>
                Reset link sent to <strong style={{ color: '#C9A96E' }}>{email}</strong>
              </p>
              <button onClick={() => { setResetMode(false); setResetSent(false); }} style={{ fontFamily: bg, fontSize: '13px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', marginTop: '16px' }}>← Back to sign in</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92', marginBottom: '6px', display: 'block' }}>Email</label>
                <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e => e.key === 'Enter' && (resetMode ? handleReset() : handleLogin())} />
              </div>
              {!resetMode && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92' }}>Password</label>
                    <button onClick={() => setResetMode(true)} style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
                  </div>
                  <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
              )}
              <button onClick={resetMode ? handleReset : handleLogin} disabled={loading}
                style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, padding: '14px', borderRadius: '10px', border: 'none', background: '#C9A96E', color: '#0C1C14', cursor: loading ? 'wait' : 'pointer', width: '100%', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                {loading ? (resetMode ? 'Sending...' : 'Signing in...') : (resetMode ? 'Send reset link' : 'Sign in')}
              </button>
              {resetMode && (
                <button onClick={() => setResetMode(false)} style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to sign in</button>
              )}
            </div>
          )}
        </div>

        {!resetMode && (
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', textAlign: 'center', marginTop: '20px' }}>
            Don&apos;t have an account? <Link href="/register" style={{ color: '#C9A96E' }}>Create one free</Link>
          </p>
        )}
      </div>
    </div>
  );
}
