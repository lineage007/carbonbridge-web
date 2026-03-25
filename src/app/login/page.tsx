'use client';

import { useState } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Demo: simulate login
    setTimeout(() => {
      if (email === 'demo@carbonbridge.ae' && password === 'demo2026') {
        window.location.href = '/dashboard';
      } else if (email && password) {
        window.location.href = '/dashboard';
      } else {
        setError('Please enter your email and password.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <main style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D 50%, #0C1C14)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ padding: '20px 0', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex items-center justify-between">
          <Link href="/">
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '34px', width: 'auto' }} />
          </Link>
          <Link href="/register" style={{ fontFamily: bg, fontSize: '13px', color: '#C9A96E', fontWeight: 600 }}>Create account →</Link>
        </div>
      </nav>

      {/* Login Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#FFFCF6', marginBottom: '8px' }}>Welcome back</h1>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92' }}>Sign in to your CarbonBridge account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: '16px', padding: '32px' }}>
            {error && (
              <div style={{ fontFamily: bg, fontSize: '13px', color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92', display: 'block', marginBottom: '6px' }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,252,246,0.04)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '10px', color: '#FFFCF6', fontFamily: bg, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <label style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92' }}>Password</label>
                <button type="button" style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 14px', paddingRight: '44px', background: 'rgba(255,252,246,0.04)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '10px', color: '#FFFCF6', fontFamily: bg, fontSize: '14px', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8AAA92', fontSize: '12px', fontFamily: bg }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ margin: '16px 0 24px' }}>
              <input type="checkbox" id="remember" style={{ accentColor: '#C9A96E' }} />
              <label htmlFor="remember" style={{ fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>Keep me signed in</label>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'wait' : 'pointer',
              fontFamily: bg, fontSize: '14px', fontWeight: 700,
              background: loading ? '#8B7A55' : '#C9A96E', color: '#0C1C14',
              transition: 'background 0.2s',
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Demo credentials */}
            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92', marginBottom: '4px' }}>Demo credentials</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#C9A96E' }}>demo@carbonbridge.ae · demo2026</p>
            </div>
          </form>

          <p className="text-center" style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92', marginTop: '20px' }}>
            Don&apos;t have an account? <Link href="/register" style={{ color: '#C9A96E', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
