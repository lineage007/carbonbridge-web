'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

// Shown when a page throws while rendering. No Navbar here: if the error came from the
// shared chrome, rendering it again would fail the same way.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <div className="max-w-[640px] mx-auto text-center" style={{ padding: '120px 16px 96px' }}>
        <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Something went wrong</span>
        <h1 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1A1714', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '16px' }}>
          This page could not be loaded
        </h1>
        <p style={{ fontFamily: bg, fontSize: '15px', color: '#8B8178', lineHeight: 1.7, marginBottom: '32px' }}>
          Please try again. If it keeps happening, email info@carbonbridge.ae{error.digest ? ` and quote reference ${error.digest}` : ''}.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={reset} style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
            Try again
          </button>
          <Link href="/" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1B3A2D', border: '1px solid #E8E2D8', padding: '13px 28px', borderRadius: '10px', display: 'inline-block' }}>
            Home page
          </Link>
        </div>
      </div>
    </main>
  );
}
