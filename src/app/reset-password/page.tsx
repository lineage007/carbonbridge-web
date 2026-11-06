'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { MIN_PASSWORD_LENGTH, passwordProblem } from '@/lib/password';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

// The recovery email link goes through /auth/callback, which exchanges the code for a
// session and sends the user here. Without that session there is nothing to update.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'ready' | 'no-session' | 'saved'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser();
        setStatus(user ? 'ready' : 'no-session');
      } catch {
        setStatus('no-session');
      }
    })();
  }, []);

  const handleSave = async () => {
    const problem = passwordProblem(password, confirm);
    if (problem) { setError(problem); return; }
    setLoading(true); setError('');
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      setStatus('saved');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not update your password');
    } finally { setLoading(false); }
  };

  const inputStyle = { fontFamily: bg, fontSize: '14px', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(255,252,246,0.04)', color: '#F2ECE0', width: '100%', outline: 'none' };
  const labelStyle = { fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92', marginBottom: '6px', display: 'block' };
  const textStyle = { fontFamily: bg, fontSize: '14px', color: '#8AAA92', lineHeight: 1.7 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0C1C14 0%, #1B3A2D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '36px', marginBottom: '28px' }} /></Link>
          <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#F2ECE0', marginBottom: '8px' }}>Set a new password</h1>
        </div>

        <div style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '16px', padding: '32px' }}>
          {status === 'checking' && <p style={{ ...textStyle, textAlign: 'center' }}>Checking your reset link...</p>}

          {status === 'no-session' && (
            <div style={{ textAlign: 'center' }}>
              <p style={textStyle}>This reset link has expired or was already used. Request a new one from the sign in page.</p>
              <Link href="/login" style={{ fontFamily: bg, fontSize: '13px', color: '#C9A96E', display: 'inline-block', marginTop: '16px' }}>Go to sign in</Link>
            </div>
          )}

          {status === 'saved' && (
            <p role="status" style={{ ...textStyle, textAlign: 'center' }}>Your password has been updated. Taking you to your dashboard.</p>
          )}

          {status === 'ready' && (
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && <div role="alert" style={{ fontFamily: bg, fontSize: '13px', color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: '8px' }}>{error}</div>}
              <div>
                <label htmlFor="new-password" style={labelStyle}>New password</label>
                <input id="new-password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div>
                <label htmlFor="confirm-password" style={labelStyle}>Confirm new password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" required style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              <button type="submit" disabled={loading}
                style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, padding: '14px', borderRadius: '10px', border: 'none', background: '#C9A96E', color: '#0C1C14', cursor: loading ? 'wait' : 'pointer', width: '100%', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
