'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

type NavItem = { label: string; href: string; icon: string; badge?: string };
type NavGroup = { heading: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '◎' },
      { label: 'Marketplace', href: '/marketplace', icon: '◆' },
      { label: 'Data & Insights', href: '/data', icon: '◉' },
    ],
  },
  {
    heading: 'My Account',
    items: [
      { label: 'Portfolio', href: '/dashboard/portfolio', icon: '◇' },
      { label: 'Purchases', href: '/dashboard/purchases', icon: '◈' },
      { label: 'Carbon Management', href: '/dashboard/carbon', icon: '●' },
      { label: 'Forward Contracts', href: '/dashboard/forwards', icon: '▸' },
      { label: 'Compare Credits', href: '/compare', icon: '⇄' },
      { label: 'Request for Quote', href: '/rfq', icon: '✉' },
    ],
  },
  {
    heading: 'Seller',
    items: [
      { label: 'My Listings', href: '/dashboard/listings', icon: '▣' },
      { label: 'Orders Received', href: '/dashboard/orders', icon: '▤' },
    ],
  },
  {
    heading: 'Developer',
    items: [
      { label: 'API Access', href: '/dashboard/api', icon: '⟨⟩' },
      { label: 'API Docs', href: '/developers', icon: '⧉' },
    ],
  },
  {
    heading: 'Admin',
    items: [
      { label: 'Command Centre', href: '/dashboard/admin', icon: '⛊', badge: 'ADMIN' },
      { label: 'Orders', href: '/dashboard/admin/orders', icon: '▤' },
      { label: 'Listings', href: '/dashboard/admin/listings', icon: '▣' },
      { label: 'Users', href: '/dashboard/admin/users', icon: '◇' },
      { label: 'Financials', href: '/dashboard/admin/financials', icon: '◈' },
      { label: 'Analytics', href: '/dashboard/admin/analytics', icon: '◉' },
      { label: 'Inventory', href: '/dashboard/admin/inventory', icon: '▦' },
      { label: 'Claims', href: '/dashboard/admin/claims', icon: '⚑' },
    ],
  },
  {
    heading: '',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return path === '/dashboard';
    return path === href || path.startsWith(href + '/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFCF6' }}>
      {/* Fixed sidebar — always visible */}
      <aside style={{
        width: '260px', background: '#0C1C14',
        borderRight: '1px solid rgba(201,169,110,0.06)',
        flexShrink: 0, height: '100vh', overflowY: 'auto',
        position: 'sticky', top: 0,
      }}>
        <div style={{ padding: '24px 20px 20px' }}>
          <Link href="/dashboard">
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px' }} />
          </Link>
        </div>
        <nav style={{ padding: '0 10px' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.heading || 'bottom'} style={{ marginBottom: '8px' }}>
              {group.heading && (
                <div style={{
                  fontFamily: bg, fontSize: '10px', fontWeight: 700,
                  color: '#4A6A55', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '12px 14px 4px',
                }}>
                  {group.heading}
                </div>
              )}
              {group.items.map(item => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 14px', borderRadius: '8px', marginBottom: '1px',
                      fontFamily: bg, fontSize: '13px', fontWeight: active ? 600 : 400,
                      color: active ? '#C9A96E' : '#6B8A74',
                      background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
                      textDecoration: 'none', transition: 'all 120ms',
                    }}>
                    <span style={{ fontSize: '13px', opacity: 0.6, width: '20px', textAlign: 'center' }}>{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700, marginLeft: 'auto',
                        background: item.badge === 'ADMIN' ? 'rgba(220,38,38,0.12)' : 'rgba(201,169,110,0.1)',
                        color: item.badge === 'ADMIN' ? '#dc2626' : '#C9A96E',
                        padding: '1px 6px', borderRadius: '4px',
                      }}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(201,169,110,0.06)', marginTop: '8px' }}>
          <Link href="/" style={{ fontFamily: bg, fontSize: '12px', color: '#4A6A55', textDecoration: 'none' }}>
            ← Back to website
          </Link>
        </div>
      </aside>

      {/* Main content — no hamburger, no mobile header */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: '32px 28px', maxWidth: '1200px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
