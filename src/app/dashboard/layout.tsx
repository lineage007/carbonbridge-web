'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: '◎' },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: '◇' },
  { label: 'Purchases', href: '/dashboard/purchases', icon: '◈' },
  { label: 'Marketplace', href: '/marketplace', icon: '◆' },
  { label: 'My Listings', href: '/dashboard/listings', icon: '▣', sellerOnly: true },
  { label: 'Orders Received', href: '/dashboard/orders', icon: '▤', sellerOnly: true },
  { label: 'Carbon Management', href: '/dashboard/carbon', icon: '◉' },
  { label: 'Forward Contracts', href: '/dashboard/forwards', icon: '▸' },
  { label: 'API', href: '/dashboard/api', icon: '⟨/⟩', apiOnly: true },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
  { label: 'Admin Centre', href: '/admin', icon: '⛊', adminOnly: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFCF6' }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-40 transition-transform duration-200`}
        style={{ width: '260px', background: '#0C1C14', borderRight: '1px solid rgba(201,169,110,0.06)', flexShrink: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 32px' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px' }} /></Link>
        </div>
        <nav style={{ padding: '0 12px' }}>
          {NAV.map(item => {
            const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '2px',
                  fontFamily: bg, fontSize: '13.5px', fontWeight: active ? 600 : 400,
                  color: active ? '#C9A96E' : '#6B8A74',
                  background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 150ms',
                }}>
                <span style={{ fontSize: '14px', opacity: 0.7, width: '20px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
                {item.sellerOnly && <span style={{ fontSize: '9px', background: 'rgba(201,169,110,0.1)', color: '#C9A96E', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>SELLER</span>}
                {(item as any).adminOnly && <span style={{ fontSize: '9px', background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>ADMIN</span>}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '20px', marginTop: 'auto', borderTop: '1px solid rgba(201,169,110,0.06)' }}>
          <form action="/auth/signout" method="POST">
            <button type="submit" style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>Sign out</button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile header */}
        <div className="lg:hidden" style={{ padding: '14px 16px', borderBottom: '1px solid #E5DED3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFCF6' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1A1714' }}>☰</button>
          <img src="/logo-green.png" alt="CarbonBridge" style={{ height: '24px' }} />
          <div style={{ width: '20px' }} />
        </div>
        <div style={{ padding: '32px 28px', maxWidth: '1200px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
