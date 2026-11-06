'use client';

import { useEffect } from 'react';

// Last-resort screen when the root layout itself fails. It replaces the layout, so it
// brings its own <html> and <body> and uses no shared components or fonts.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>CarbonBridge</title>
      </head>
      <body style={{ margin: 0, background: '#FDFBF7', fontFamily: 'system-ui, sans-serif', color: '#1A1714' }}>
        <main style={{ maxWidth: '560px', margin: '0 auto', padding: '120px 16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>CarbonBridge is having trouble loading</h1>
          <p style={{ fontSize: '15px', color: '#8B8178', lineHeight: 1.7, marginBottom: '32px' }}>
            Please try again in a moment. If it keeps happening, email <a href="mailto:info@carbonbridge.ae" style={{ color: '#1B3A2D' }}>info@carbonbridge.ae</a>{error.digest ? ` and quote reference ${error.digest}` : ''}.
          </p>
          <button type="button" onClick={reset} style={{ fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
