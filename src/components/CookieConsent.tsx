'use client';

import { useState, useEffect } from 'react';

const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cb_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cb_cookie_consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('cb_cookie_consent', 'essential_only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '24px', right: '24px',
      maxWidth: '520px',
      background: '#1A1714',
      border: '1px solid rgba(201,169,110,0.2)',
      borderRadius: '16px',
      padding: '20px 24px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      zIndex: 9999,
      fontFamily: bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>🍪</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFCF6', marginBottom: '4px' }}>We use cookies</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,252,246,0.6)', lineHeight: 1.5 }}>
            We use essential cookies to make the platform work. With your consent, we also use analytics cookies to improve your experience.
            {' '}<button onClick={() => setShowDetails(!showDetails)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: bg, fontSize: '12px', color: '#C9A96E', padding: 0, textDecoration: 'underline' }}>
              {showDetails ? 'Hide details' : 'Learn more'}
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '11px', color: 'rgba(255,252,246,0.5)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,252,246,0.8)' }}>Essential cookies</strong> — Always active. Required for authentication, session management, and security. Cannot be disabled.</div>
          <div><strong style={{ color: 'rgba(255,252,246,0.8)' }}>Analytics cookies</strong> — Optional. Help us understand how the platform is used so we can improve it. No personal data is sold.</div>
          <div style={{ marginTop: '6px', color: 'rgba(255,252,246,0.3)' }}>Required under ADGM Data Protection Regulations and UAE Federal Decree-Law No. 45 of 2021.</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={accept}
          style={{ flex: 1, fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Accept all
        </button>
        <button
          onClick={reject}
          style={{ fontFamily: bg, fontSize: '13px', fontWeight: 500, color: 'rgba(255,252,246,0.7)', background: 'transparent', border: '1px solid rgba(255,252,246,0.15)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
