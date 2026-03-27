import Link from 'next/link';
import type { ReactNode } from 'react';

const bg = "'Bricolage Grotesque', system-ui, sans-serif";

const PAGES = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Insurance Disclaimer', href: '/legal/insurance' },
  { label: 'API Terms', href: '/legal/api-terms' },
  { label: 'Marketplace Rules', href: '/legal/marketplace-rules' },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF6' }}>
      <header style={{ background: '#1B3A2D', padding: '20px 0' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px' }} /></Link>
          <Link href="/" style={{ fontFamily: bg, fontSize: '13px', color: '#C9A96E', textDecoration: 'none' }}>Back to platform →</Link>
        </div>
      </header>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '40px' }}>
        <nav className="hidden md:block" style={{ width: '200px', flexShrink: 0 }}>
          {PAGES.map(p => (
            <Link key={p.href} href={p.href} style={{ display: 'block', fontFamily: bg, fontSize: '13px', color: '#6B6259', padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid #F5F0E8' }}>{p.label}</Link>
          ))}
        </nav>
        <main style={{ flex: 1, fontFamily: bg, fontSize: '15px', color: '#333', lineHeight: 1.8 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
