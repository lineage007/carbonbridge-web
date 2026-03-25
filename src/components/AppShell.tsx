'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

/* ─── Navigation Items ─────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
      { href: '/marketplace', label: 'Marketplace', icon: '◎' },
      { href: '/compare', label: 'Compare', icon: '⇄' },
      { href: '/data', label: 'Data & Insights', icon: '◈' },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { href: '/carbon-management', label: 'Carbon Management', icon: '◉' },
      { href: '/checkout', label: 'Purchase', icon: '◇' },
    ],
  },
  {
    label: 'Seller',
    items: [
      { href: '/seller', label: 'Seller Portal', icon: '▤' },
    ],
  },
];

/* ─── Profile Dropdown Items ──────────────────────────── */
const PROFILE_ITEMS = [
  { label: 'My Profile', href: '/settings/profile', icon: '◯' },
  { label: 'Company Details', href: '/settings/company', icon: '◫' },
  { label: 'Billing & Plan', href: '/settings/billing', icon: '◈' },
  { label: 'API Keys', href: '/settings/api-keys', icon: '⊟' },
  { label: 'Notifications', href: '/settings/notifications', icon: '◎' },
  { label: 'Security', href: '/settings/security', icon: '◇' },
  { label: 'Team Members', href: '/settings/team', icon: '⊞' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF7' }}>
      {/* ─── Sidebar ─────────────────────────────────────── */}
      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90 }} />}
      
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: sidebarWidth, background: '#1B3A2D',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease, transform 0.2s ease',
        zIndex: 100, overflow: 'hidden',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }} className={`hidden md:flex ${mobileOpen ? '!flex !translate-x-0' : ''}`}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '16px 12px' : '16px 20px', borderBottom: '1px solid rgba(255,252,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '56px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: collapsed ? '22px' : '28px', width: 'auto', transition: 'height 0.2s' }} />
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: 'rgba(255,252,246,0.3)', cursor: 'pointer', fontSize: '16px', padding: '4px', display: collapsed ? 'none' : 'block' }}>
            ◀
          </button>
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: '16px' }}>
              {!collapsed && (
                <div style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: 'rgba(255,252,246,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 20px 8px', userSelect: 'none' }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: collapsed ? '10px 0' : '9px 20px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: active ? '#FFFCF6' : 'rgba(255,252,246,0.5)',
                    background: active ? 'rgba(201,169,110,0.12)' : 'transparent',
                    borderRight: active ? '3px solid #C9A96E' : '3px solid transparent',
                    fontFamily: bg, fontSize: '13px', fontWeight: active ? 600 : 400,
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,252,246,0.04)'; e.currentTarget.style.color = 'rgba(255,252,246,0.8)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,252,246,0.5)'; } }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span style={{ fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: collapse toggle when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ padding: '16px', background: 'none', border: 'none', color: 'rgba(255,252,246,0.3)', cursor: 'pointer', fontSize: '16px', borderTop: '1px solid rgba(255,252,246,0.08)' }}>▶</button>
        )}
      </aside>

      {/* ─── Main content area ─────────────────────────── */}
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.2s ease' }} className="md:ml-[var(--sidebar-width)] ml-0">
        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 80,
          background: 'rgba(250,250,247,0.95)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E8E2D8',
          padding: '0 24px', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1A1714', padding: '4px' }} className="md:hidden">
            ☰
          </button>

          {/* Breadcrumb / page title */}
          <div style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>
            {pathname === '/dashboard' ? 'Buyer Dashboard' :
             pathname === '/seller' ? 'Seller Portal' :
             pathname === '/marketplace' ? 'Marketplace' :
             pathname === '/compare' ? 'Compare Credits' :
             pathname === '/carbon-management' ? 'Carbon Management' :
             pathname === '/data' ? 'Data & Insights' :
             pathname === '/checkout' ? 'Checkout' :
             pathname.startsWith('/credits/') ? 'Credit Detail' :
             pathname.startsWith('/settings/') ? 'Settings' :
             'CarbonBridge'}
          </div>

          {/* Right side: notifications + profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notification bell */}
            <button style={{ background: 'none', border: 'none', color: '#8B8178', cursor: 'pointer', fontSize: '18px', padding: '6px', position: 'relative' }}>
              ◎
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', background: '#EF4444', borderRadius: '50%' }} />
            </button>

            {/* Profile dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: profileOpen ? 'rgba(201,169,110,0.08)' : 'transparent',
                  border: '1px solid', borderColor: profileOpen ? '#C9A96E' : 'transparent',
                  borderRadius: '8px', padding: '4px 10px 4px 4px', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3A2D, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#C9A96E' }}>E</span>
                </div>
                <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 500, color: '#1A1714' }}>Emirates Industrial</span>
                <span style={{ fontSize: '10px', color: '#8B8178', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: '240px',
                  background: '#fff', border: '1px solid #E8E2D8', borderRadius: '10px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 200,
                }}>
                  {/* User info header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE6', background: '#FAFAF7' }}>
                    <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>Emirates Industrial Group</div>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>Corporate · Premium Plan</div>
                  </div>
                  {/* Menu items */}
                  <div style={{ padding: '6px' }}>
                    {PROFILE_ITEMS.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '6px',
                        fontFamily: bg, fontSize: '13px', color: '#1A1714',
                        textDecoration: 'none', transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '14px', color: '#8B8178', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  {/* Logout */}
                  <div style={{ padding: '6px', borderTop: '1px solid #F0EDE6' }}>
                    <Link href="/login" style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 12px', borderRadius: '6px',
                      fontFamily: bg, fontSize: '13px', color: '#EF4444',
                      textDecoration: 'none',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>↩</span>
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content — rendered full-width, page handles its own padding */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
