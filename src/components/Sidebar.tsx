'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: '◎' },
  { label: 'Marketplace', href: '/marketplace', icon: '◈' },
  { label: 'Compare', href: '/compare', icon: '⇄' },
  { label: 'Carbon Management', href: '/carbon-management', icon: '◉' },
  { label: 'Data & Insights', href: '/data', icon: '◇' },
  { sep: true },
  { label: 'Seller Portal', href: '/seller', icon: '▤' },
  { sep: true },
  { label: 'Settings', href: '/settings/profile', icon: '⚙' },
];

const PROFILE_MENU = [
  { label: 'My Profile', href: '/settings/profile' },
  { label: 'Company Details', href: '/settings/profile' },
  { label: 'Billing & Plan', href: '/settings/profile' },
  { label: 'API Keys', href: '/settings/profile' },
  { label: 'Notifications', href: '/settings/profile' },
  { label: 'Security', href: '/settings/profile' },
  { label: 'Team Members', href: '/settings/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside style={{ width: '260px', background: '#0C1C14', borderRight: '1px solid rgba(201,169,110,0.06)', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }} className="hidden lg:flex">
      {/* Logo */}
      <div style={{ padding: '20px', marginBottom: '8px' }}>
        <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '30px', width: 'auto' }} /></Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item, i) => {
          if ('sep' in item && item.sep) return <div key={i} style={{ height: '1px', background: 'rgba(201,169,110,0.06)', margin: '12px 12px' }} />;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.label} href={item.href!} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '2px',
              fontFamily: bg, fontSize: '13px', fontWeight: active ? 600 : 400,
              color: active ? '#FFFCF6' : '#8AAA92',
              background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
              borderRight: active ? '3px solid #C9A96E' : '3px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#FFFCF6'; e.currentTarget.style.background = 'rgba(255,252,246,0.03)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#8AAA92'; e.currentTarget.style.background = 'transparent'; }}}
            >
              <span style={{ fontSize: '14px', opacity: 0.6, width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile section at bottom */}
      <div ref={ref} style={{ padding: '12px', borderTop: '1px solid rgba(201,169,110,0.06)', position: 'relative' }}>
        <button onClick={() => setProfileOpen(!profileOpen)} style={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: profileOpen ? 'rgba(201,169,110,0.08)' : 'transparent',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = 'rgba(255,252,246,0.03)'; }}
          onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = profileOpen ? 'rgba(201,169,110,0.08)' : 'transparent'; }}
        >
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3A2D, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#C9A96E' }}>E</span>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#FFFCF6' }}>Emirates Industrial</div>
            <div style={{ fontFamily: bg, fontSize: '10px', color: '#8AAA92' }}>Corporate · Premium</div>
          </div>
          <span style={{ color: '#8AAA92', fontSize: '10px', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
        </button>

        {/* Profile dropdown — opens upward */}
        {profileOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', left: '12px', right: '12px', marginBottom: '4px',
            background: '#fff', border: '1px solid #E8E2D8', borderRadius: '10px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 200,
          }}>
            <div style={{ padding: '6px' }}>
              {PROFILE_MENU.map(item => (
                <Link key={item.label} href={item.href} onClick={() => setProfileOpen(false)} style={{
                  display: 'block', padding: '9px 12px', borderRadius: '6px',
                  fontFamily: bg, fontSize: '13px', color: '#1A1714',
                  textDecoration: 'none', transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div style={{ padding: '6px', borderTop: '1px solid #F0EDE6' }}>
              <Link href="/login" style={{ display: 'block', padding: '9px 12px', borderRadius: '6px', fontFamily: bg, fontSize: '13px', color: '#EF4444', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Sign Out</Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
