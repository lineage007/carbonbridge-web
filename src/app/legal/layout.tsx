import Link from 'next/link';
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF6' }}>
      <nav style={{ background: '#1B3A2D', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '30px' }} /></Link>
        <div style={{ display: 'flex', gap: '16px', fontFamily: bg, fontSize: '13px' }}>
          <Link href="/marketplace" style={{ color: 'rgba(255,252,246,0.6)', textDecoration: 'none' }}>Marketplace</Link>
          <Link href="/login" style={{ color: '#C9A96E', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </nav>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>{children}</div>
    </div>
  );
}
