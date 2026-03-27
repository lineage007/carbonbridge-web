'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

const PUBLIC_NAV = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Compare', href: '/compare' },
  { label: 'Data & Insights', href: '/data' },
  { label: 'About', href: '/about' },
];

const AUTH_DROPDOWN = [
  { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: '◎' },
  { label: 'My Listings', href: '/dashboard/listings', icon: '▤' },
  { sep: true },
  { label: 'Carbon Management', href: '/carbon-management', icon: '◉' },
  { label: 'Forward Contracts', href: '/forward-contracts', icon: '⤳' },
  { label: 'RFQ', href: '/rfq', icon: '✉' },
  { sep: true },
  { label: 'Settings', href: '/settings/profile', icon: '⚙' },
];

interface NavbarProps {
  dark?: boolean; // dark background variant (for homepage hero etc)
}

export default function Navbar({ dark = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on nav
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Style variants
  const navBg = dark
    ? 'rgba(12,28,20,0.97)'
    : 'rgba(250,250,247,0.97)';
  const borderColor = dark
    ? 'rgba(201,169,110,0.08)'
    : '#E8E2D8';
  const linkColor = dark ? 'rgba(255,252,246,0.6)' : '#5A5248';
  const activeLinkColor = dark ? '#FFFCF6' : '#1A1714';
  const logoSrc = dark ? '/logo-white.png' : '/logo-white.png';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${borderColor}`,
        height: '60px',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '24px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src={logoSrc} alt="CarbonBridge" style={{ height: '36px', width: 'auto' }} />
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
            {PUBLIC_NAV.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: bg, fontSize: '13px', fontWeight: active ? 600 : 400,
                    color: active ? activeLinkColor : linkColor,
                    padding: '6px 14px', borderRadius: '8px',
                    textDecoration: 'none',
                    background: active ? (dark ? 'rgba(255,252,246,0.08)' : 'rgba(0,0,0,0.04)') : 'transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = dark ? 'rgba(255,252,246,0.05)' : 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {user ? (
              /* Authenticated — company name dropdown */
              <div ref={dropdownRef} style={{ position: 'relative' }} className="hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: dropdownOpen ? 'rgba(201,169,110,0.10)' : 'transparent',
                    border: `1px solid ${dropdownOpen ? '#C9A96E' : (dark ? 'rgba(201,169,110,0.25)' : '#E8E2D8')}`,
                    borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: bg, fontSize: '13px', fontWeight: 500,
                    color: dark ? '#FFFCF6' : '#1A1714',
                  }}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3A2D, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#C9A96E', fontFamily: bg }}>
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    My Account
                  </span>
                  <span style={{ fontSize: '10px', color: dark ? 'rgba(255,252,246,0.4)' : '#8B8178', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px',
                    background: '#fff', border: '1px solid #E8E2D8',
                    borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden', zIndex: 200,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE6', background: '#FAFAF7' }}>
                      <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{ padding: '6px' }}>
                      {AUTH_DROPDOWN.map((item, i) => {
                        if ('sep' in item && item.sep) {
                          return <div key={i} style={{ height: '1px', background: '#F0EDE6', margin: '4px 0' }} />;
                        }
                        return (
                          <Link
                            key={item.href}
                            href={item.href!}
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '9px 12px', borderRadius: '6px',
                              fontFamily: bg, fontSize: '13px', color: '#1A1714',
                              textDecoration: 'none', transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F5F0E8'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: '13px', color: '#8B8178', width: '16px', textAlign: 'center' }}>{item.icon}</span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div style={{ padding: '6px', borderTop: '1px solid #F0EDE6' }}>
                      <button
                        onClick={handleSignOut}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                          padding: '9px 12px', borderRadius: '6px',
                          fontFamily: bg, fontSize: '13px', color: '#EF4444',
                          background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.1s',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '13px', width: '16px', textAlign: 'center' }}>↩</span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public — sign in + get started */
              <>
                <Link
                  href="/login"
                  style={{
                    fontFamily: bg, fontSize: '13px', fontWeight: 500,
                    color: dark ? 'rgba(255,252,246,0.7)' : '#5A5248',
                    textDecoration: 'none', padding: '6px 14px', borderRadius: '8px',
                    transition: 'color 0.15s',
                  }}
                  className="hidden md:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  style={{
                    fontFamily: bg, fontSize: '13px', fontWeight: 600,
                    color: '#0C1C14',
                    background: '#C9A96E',
                    padding: '8px 18px', borderRadius: '8px',
                    textDecoration: 'none', transition: 'opacity 0.15s',
                  }}
                  className="hidden md:inline-block"
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Get started
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: dark ? '#FFFCF6' : '#1A1714', padding: '4px' }}
              className="md:hidden"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
          background: dark ? '#0C1C14' : '#FAFAF7',
          zIndex: 99, overflowY: 'auto',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }} className="md:hidden">
          {PUBLIC_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: bg, fontSize: '16px', fontWeight: 500,
                color: dark ? '#FFFCF6' : '#1A1714',
                padding: '14px 0', textDecoration: 'none',
                borderBottom: `1px solid ${dark ? 'rgba(255,252,246,0.06)' : '#E8E2D8'}`,
                display: 'block',
              }}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{ fontFamily: bg, fontSize: '14px', color: dark ? '#C9A96E' : '#1B3A2D', textDecoration: 'none' }}>→ Dashboard</Link>
                <button onClick={handleSignOut} style={{ fontFamily: bg, fontSize: '14px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontFamily: bg, fontSize: '15px', color: dark ? 'rgba(255,252,246,0.7)' : '#5A5248', textDecoration: 'none' }}>Sign in</Link>
                <Link href="/register" style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '12px 20px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div style={{ height: '60px' }} />
    </>
  );
}
