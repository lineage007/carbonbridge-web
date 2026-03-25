'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

const bg = "'Bricolage Grotesque', system-ui, sans-serif";

const NAV = [
  { label: 'Command Centre', href: '/admin', icon: '◎' },
  { label: 'Orders', href: '/admin/orders', icon: '▤', badge: true },
  { label: 'Listings', href: '/admin/listings', icon: '▣' },
  { label: 'Users', href: '/admin/users', icon: '◇' },
  { label: 'Financials', href: '/admin/financials', icon: '◈', superOnly: true },
  { label: 'Analytics', href: '/admin/analytics', icon: '◉' },
  { label: 'Inventory', href: '/admin/inventory', icon: '▦' },
  { label: 'Claims', href: '/admin/claims', icon: '⚑' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0F0D' }}>
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-40 transition-transform duration-200`}
        style={{ width: '240px', background: '#060A08', borderRight: '1px solid rgba(201,169,110,0.06)', flexShrink: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px 28px' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo-white.png" alt="" style={{ height: '22px' }} />
            <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ADMIN</span>
          </Link>
        </div>
        <nav style={{ padding: '0 8px' }}>
          {NAV.map(item => {
            const active = path === item.href || (item.href !== '/admin' && path.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 12px', borderRadius: '6px', marginBottom: '1px',
                  fontFamily: bg, fontSize: '13px', fontWeight: active ? 600 : 400,
                  color: active ? '#C9A96E' : '#4A6A55',
                  background: active ? 'rgba(201,169,110,0.06)' : 'transparent',
                  textDecoration: 'none',
                }}>
                <span style={{ fontSize: '12px', opacity: 0.6, width: '18px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setSidebarOpen(false)} />}

      <main style={{ flex: 1, minWidth: 0 }}>
        <div className="lg:hidden" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#8AAA92' }}>☰</button>
          <span style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', fontWeight: 700 }}>ADMIN</span>
        </div>
        <div style={{ padding: '28px 24px', maxWidth: '1400px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
