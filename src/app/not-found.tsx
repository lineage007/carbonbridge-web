import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-[640px] mx-auto px-4 lg:px-8 text-center" style={{ padding: '120px 16px 96px' }}>
        <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Error 404</span>
        <h1 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1A1714', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '16px' }}>
          We could not find that page
        </h1>
        <p style={{ fontFamily: bg, fontSize: '15px', color: '#8B8178', lineHeight: 1.7, marginBottom: '32px' }}>
          The link may be out of date, or the page may have moved. You can browse the marketplace or go back to the home page.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px', display: 'inline-block' }}>
            Browse the marketplace
          </Link>
          <Link href="/" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1B3A2D', border: '1px solid #E8E2D8', padding: '13px 28px', borderRadius: '10px', display: 'inline-block' }}>
            Home page
          </Link>
        </div>
      </div>
    </main>
  );
}
