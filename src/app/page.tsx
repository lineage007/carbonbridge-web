"use client";

import Link from "next/link";
import { useEffect, useState, useRef, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════
   CarbonBridge — Homepage (design wave 2026-07-04)
   Motion: section-level FadeIn only; no scattered card animations.
   prefers-reduced-motion handled in globals.css.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Days until (for future deadlines only) ─────────────── */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00+04:00");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

/* ─── Section-level fade-in (one per section, not per card) ─ */
function FadeIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
      {children}
    </div>
  );
}

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Courier New', monospace";

// Consistent icon set — stroke-based, 1.5px weight
const icons = {
  arrow: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/></svg>,
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  globe: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  leaf: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  lock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  zap: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  database: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>,
  code: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  building: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  plane: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
};

/* ── Reusable section wrapper ────────────────────── */
function Section({ id, dark, children, className = '' }: { id?: string; dark?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} style={{ background: dark ? 'var(--forest)' : 'var(--slate)', padding: '96px 0', position: 'relative', overflow: 'hidden' }} className={className}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle, dark, center = true }: { eyebrow: string; title: React.ReactNode; subtitle?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={center ? 'text-center mb-14' : 'mb-10'}>
      <span style={{ fontFamily: mono, fontSize: '10px', fontWeight: 500, color: dark ? 'var(--gold)' : 'var(--sage)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{eyebrow}</span>
      <h2 style={{ fontFamily: fr, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 700, color: dark ? '#EEEEE8' : 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.025em', marginTop: '10px', maxWidth: center ? '580px' : undefined, marginLeft: center ? 'auto' : undefined, marginRight: center ? 'auto' : undefined }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontFamily: bg, fontSize: '15px', color: dark ? 'var(--sage)' : 'var(--ink-muted)', lineHeight: 1.7, maxWidth: '500px', margin: center ? '12px auto 0' : '12px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Compare', href: '/compare' },
    { label: 'Data & Insights', href: '/data' },
    { label: 'About', href: '/about' },
  ];

  return (
    <main>
      {/* ═══════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(12,28,20,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(74,139,100,0.08)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '48px', width: 'auto' }} />
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map(({ label, href }) => (
              <a key={label} href={href} style={{ fontFamily: bg, fontSize: '13.5px', fontWeight: 500, color: 'rgba(255,252,246,0.55)' }} className="hover:text-white transition-colors duration-300">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="/login" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 500, color: 'rgba(74,139,100,0.8)', padding: '7px 18px', border: '1px solid rgba(74,139,100,0.2)', borderRadius: '7px' }} className="hover:border-[rgba(74,139,100,0.5)] hover:text-[#4A8B64] transition-all duration-300">
              Sign in
            </a>
            <a href="/register" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: 'var(--forest-deep)', background: '#4A8B64', padding: '7px 20px', borderRadius: '7px' }} className="hover:brightness-110 transition-all duration-200">
              Get started
            </a>
          </div>

          <button
            className="lg:hidden text-white/60 hover:text-white"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden"
            style={{
              background: 'rgba(12,28,20,0.98)',
              borderTop: '1px solid rgba(74,139,100,0.08)',
              padding: '16px 24px 24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: bg, fontSize: '15px', fontWeight: 500,
                    color: 'rgba(255,252,246,0.7)',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(74,139,100,0.06)',
                    display: 'block',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="/login"
                style={{
                  fontFamily: bg, fontSize: '14px', fontWeight: 500,
                  color: 'rgba(74,139,100,0.9)',
                  padding: '12px 20px',
                  border: '1px solid rgba(74,139,100,0.2)', borderRadius: '8px',
                  textAlign: 'center', textDecoration: 'none',
                }}
              >
                Sign in
              </a>
              <a
                href="/register"
                style={{
                  fontFamily: bg, fontSize: '14px', fontWeight: 600,
                  color: '#0C1C14', background: '#4A8B64',
                  padding: '12px 20px', borderRadius: '8px',
                  textAlign: 'center', textDecoration: 'none',
                }}
              >
                Get started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(175deg, #0C1C14 0%, #142E22 50%, #1B3A2D 100%)', paddingTop: '140px', paddingBottom: '110px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(74,139,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,139,100,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {/* Decorative geometric circles — brand element */}
        <div style={{ position: 'absolute', right: '-120px', bottom: '-80px', opacity: 0.025, pointerEvents: 'none' }}>
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="245" stroke="#4A8B64" strokeWidth="1" />
            <circle cx="250" cy="250" r="180" stroke="#4A8B64" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="115" stroke="#4A8B64" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="50" stroke="#4A8B64" strokeWidth="0.5" />
          </svg>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <div className="flex items-center gap-3 mb-7">
                <span style={{ fontFamily: mono, fontSize: '10px', fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(60,122,85,0.1)', border: '1px solid rgba(60,122,85,0.2)', padding: '4px 12px', borderRadius: '3px' }}>
                  MENA Carbon Credit Marketplace
                </span>
              </div>

              <h1 style={{ fontFamily: fr, fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: '#EEEEE8', lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: '22px', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                The carbon credit marketplace built for the Gulf compliance wave.
              </h1>

              <p style={{ fontFamily: bg, fontSize: '16px', color: 'var(--sage)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
                Discover, compare, and purchase verified carbon credits with integrated insurance, quality ratings, and institutional-grade settlement — in one platform.
              </p>

              <div className="flex flex-wrap gap-3 mb-14">
                <a href="/register" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: 'var(--forest-deep)', background: '#4A8B64', padding: '13px 28px', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} className="hover:brightness-110 transition-all duration-200">
                  Create free account {icons.arrow}
                </a>
                <a href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: 'rgba(255,252,246,0.7)', padding: '13px 28px', borderRadius: '9px', border: '1px solid rgba(255,252,246,0.1)' }} className="hover:border-white/25 hover:text-white transition-all duration-300">
                  Explore the platform
                </a>
              </div>

              {/* Trust bar — Settlement partner logos */}
              <div style={{ borderTop: '1px solid rgba(60,122,85,0.12)', paddingTop: '22px' }}>
                <div style={{ fontFamily: mono, fontSize: '9px', color: 'rgba(99,122,106,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Settlement &amp; Registry Partners (target)</div>
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4" style={{ opacity: 0.45 }}>
                  {[
                    { src: '/partners/acx.svg', alt: 'ACX Abu Dhabi', w: 80 },
                    { src: '/partners/carbonplace.svg', alt: 'Carbonplace', w: 110 },
                    { src: '/partners/cix.svg', alt: 'CIX Singapore', w: 90 },
                    { src: '/partners/xpansiv.svg', alt: 'Xpansiv CBL', w: 80 },
                    { src: '/partners/verra.svg', alt: 'Verra', w: 70 },
                    { src: '/partners/goldstandard.svg', alt: 'Gold Standard', w: 100 },
                  ].map(p => (
                    <img key={p.alt} src={p.src} alt={p.alt} width={p.w} height={28} style={{ height: '20px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Market data dashboard */}
            <div style={{ background: 'rgba(12,28,20,0.6)', border: '1px solid rgba(74,139,100,0.08)', borderRadius: '18px', padding: '28px', position: 'relative' }}>
              <div className="flex items-center justify-between mb-6">
                <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92' }}>Market Overview</span>
                <span style={{ fontFamily: mono, fontSize: '10px', color: 'rgba(99,122,106,0.6)', background: 'rgba(99,122,106,0.08)', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.04em' }}>INDICATIVE BENCHMARKS</span>
              </div>

              {/* Price grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'High-Integrity VCUs', price: '$14.80', delta: '+18.4%', up: true },
                  { label: 'Blue Carbon', price: '$64.00', delta: '+28.7%', up: true },
                  { label: 'Biochar / CDR', price: '$142.00', delta: '+45.2%', up: true },
                  { label: 'Legacy Credits', price: '$3.50', delta: '-22.1%', up: false },
                ].map(p => (
                  <div key={p.label} style={{ background: 'rgba(255,255,248,0.03)', border: '1px solid rgba(60,122,85,0.08)', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.label}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span style={{ fontFamily: mono, fontSize: '18px', fontWeight: 600, color: '#EEEEE8', fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
                      <span style={{ fontFamily: mono, fontSize: '10px', fontWeight: 600, color: p.up ? '#6FAE78' : '#D97070' }}>{p.delta}</span>
                    </div>
                    <div style={{ fontFamily: mono, fontSize: '9px', color: 'rgba(99,122,106,0.45)', marginTop: '2px', letterSpacing: '0.04em' }}>per tCO₂e</div>
                  </div>
                ))}
              </div>

              {/* Volume bars */}
              <div style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Retirement volume by type (2024 · Ecosystem Marketplace)</div>
              <div className="space-y-2">
                {[
                  { label: 'Nature-Based', pct: 56, color: '#6FAE78' },
                  { label: 'Engineered', pct: 24, color: '#3C7A55' },
                  { label: 'Avoidance', pct: 14, color: '#7A9E8A' },
                  { label: 'Other', pct: 6, color: '#4A6355' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span style={{ fontFamily: mono, fontSize: '10px', color: 'var(--sage)', width: '90px', flexShrink: 0 }}>{b.label}</span>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,248,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontFamily: mono, fontSize: '10px', color: 'rgba(99,122,106,0.6)', width: '28px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{b.pct}%</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(60,122,85,0.06)', marginTop: '18px', paddingTop: '12px', fontFamily: mono, fontSize: '9px', color: 'rgba(99,122,106,0.4)', lineHeight: 1.6, letterSpacing: '0.02em' }}>
                182M tonnes retired in 2024 · $535M total value<br />
                Indicative benchmarks sourced from public registry data. Not real-time trading prices.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PARTNER LOGOS — Full-width credibility bar
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--slate)', borderBottom: '1px solid var(--border-light)', padding: '36px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-5">
            <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 500, color: 'var(--sage)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Settlement &amp; Insurance Infrastructure (target)</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5" style={{ opacity: 0.35 }}>
            {[
              { src: '/partners/acx.svg', alt: 'ACX Abu Dhabi', w: 80 },
              { src: '/partners/carbonplace.svg', alt: 'Carbonplace', w: 115 },
              { src: '/partners/cix.svg', alt: 'CIX Singapore', w: 95 },
              { src: '/partners/xpansiv.svg', alt: 'Xpansiv CBL', w: 80 },
              { src: '/partners/lloyds.svg', alt: "Lloyd's of London", w: 120 },
              { src: '/partners/verra.svg', alt: 'Verra', w: 70 },
              { src: '/partners/goldstandard.svg', alt: 'Gold Standard', w: 105 },
              { src: '/partners/kita.svg', alt: 'Kita', w: 55 },
              { src: '/partners/munichre.svg', alt: 'Munich Re', w: 100 },
            ].map(p => (
              <img key={p.alt} src={p.src} alt={p.alt} width={p.w} height={28} style={{ height: '18px', width: 'auto', filter: 'grayscale(1)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE PROBLEM — Why this matters now
          ═══════════════════════════════════════════════════════ */}
      <Section>
        <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionHeader eyebrow="The Compliance Wave" title={<>Three regulations.<br />Active now.<br />No platform.</>} subtitle="" center={false} />
            <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              For the first time, MENA corporations face simultaneous carbon compliance obligations — the UAE&apos;s National Registry for Carbon Credits, the EU&apos;s Carbon Border Adjustment Mechanism, and ICAO&apos;s CORSIA mandate for airlines. Yet there is no marketplace, no integrated purchasing infrastructure, and no compliance tooling built for this region. Companies are navigating a complex, opaque market with spreadsheets and phone calls.
            </p>
            <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.7, marginTop: '16px' }}>
              CarbonBridge changes that.
            </p>
          </div>

          <FadeIn>
          <div className="space-y-3">
            {[
              { reg: 'UAE NRCC', deadline: 'May 30, 2026', days: 'First deadline passed', desc: 'The UAE National Registry of Carbon Credits first compliance deadline has passed. Large emitters now face retroactive reporting obligations. The window for managed retroactive compliance is open now.', color: '#C97A5A', passed: true },
              { reg: 'EU CBAM', deadline: 'January 1, 2027', days: `${daysUntil('2027-01-01')} days`, desc: 'Carbon Border Adjustment Mechanism. UAE aluminium, steel, cement, and fertiliser exporters to the EU must purchase equivalent carbon credits or face import duties.', color: '#3C7A55', passed: false },
              { reg: 'CORSIA Phase 2', deadline: '2027–2035', days: 'Procurement now', desc: 'Mandatory carbon offsetting for international aviation. Airlines must source eligible credits and retire them against verified emissions. Multi-year forward procurement is already underway.', color: '#637A6A', passed: false },
            ].map(r => (
                <div key={r.reg} style={{ background: 'var(--canvas)', border: '1px solid var(--border-light)', borderLeft: `3px solid ${r.color}`, borderRadius: '8px', padding: '20px 22px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{r.reg}</span>
                    <span style={{ fontFamily: mono, fontSize: '10px', fontWeight: 600, color: r.color, background: `${r.color}18`, padding: '3px 10px', borderRadius: '3px', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>{r.days}</span>
                  </div>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.58 }}>{r.desc}</p>
                  <span style={{ fontFamily: mono, fontSize: '9px', color: 'rgba(85,99,88,0.5)', marginTop: '8px', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Deadline: {r.deadline}</span>
                </div>
            ))}
          </div>
          </FadeIn>
        </div>
        </FadeIn>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          PLATFORM — How it works
          ═══════════════════════════════════════════════════════ */}
      <section id="platform" style={{ background: 'var(--canvas)', padding: '96px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <FadeIn>
          <SectionHeader eyebrow="The Platform" title={<>From discovery to retirement,<br />in one workflow.</>} subtitle="CarbonBridge integrates seven capabilities that are typically fragmented across different providers, spreadsheets, and manual processes." />

          {/* Process steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { step: '01', title: 'Discover', desc: 'Browse verified credits across Verra, Gold Standard, and ACR. Filter by type, geography, vintage, price, and ICVCM quality rating.' },
              { step: '02', title: 'Evaluate', desc: 'Compare credits using independent quality ratings, co-benefit scores, permanence risk assessments, and real-time price benchmarks.' },
              { step: '03', title: 'Purchase & Insure', desc: 'Buy with integrated insurance at checkout — non-delivery cover, invalidation protection, and CORSIA guarantees backed by Lloyd\'s.' },
              { step: '04', title: 'Retire & Report', desc: 'Retire credits across any registry from one dashboard. Auto-generated retirement certificates and audit-ready compliance records.' },
            ].map((s, i) => (
                <div key={s.step} style={{ position: 'relative' }}>
                  {i < 3 && <div className="hidden md:block" style={{ position: 'absolute', top: '16px', right: '-12px', width: '24px', height: '1px', background: 'var(--border-light)' }} />}
                  <div style={{ fontFamily: mono, fontSize: '11px', fontWeight: 600, color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.1em' }}>{s.step}</div>
                  <h3 style={{ fontFamily: bg, fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
            ))}
          </div>

          {/* Capability cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: icons.globe, title: 'Marketplace', desc: 'Connect developers and buyers across multiple registries. Self-serve listings, RFQ system, and OTC facilitation.', tag: 'Core' },
              { icon: icons.shield, title: 'Integrated Insurance', desc: 'Optional credit guarantee insurance at checkout. Non-delivery, invalidation, political risk, and CORSIA covers via Kita and CFC (Lloyd\'s syndicates).', tag: 'Unique' },
              { icon: icons.chart, title: 'Data & Ratings', desc: 'Independent credit quality ratings (AAA–C) against ICVCM CCP criteria. Price benchmarks, vintage analysis, and compliance eligibility mapping.', tag: 'Core' },
              { icon: icons.code, title: 'Retirement API', desc: 'REST API for point-of-sale carbon offsetting. Log offset requests in real-time. Monthly retirement and branded certificate delivery. From $0.15/call.', tag: 'Developer' },
              { icon: icons.database, title: 'Carbon Management', desc: 'Track your emissions, manage compliance obligations, and optimise your portfolio with dynamic tools and real-time market data.', tag: 'Enterprise' },
              { icon: icons.users, title: 'Managed Procurement', desc: 'White-glove service for large compliance buyers. CORSIA credit sourcing, CBAM bundling, forward offtake structuring, and dedicated account management.', tag: 'Premium' },
            ].map(f => (
                <div key={f.title} className="group" style={{ background: 'var(--slate)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '24px', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(60,122,85,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
                  <div className="flex items-start justify-between mb-4">
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>{f.icon}</div>
                    <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: f.tag === 'Unique' ? 'var(--gold)' : 'var(--ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', background: f.tag === 'Unique' ? 'rgba(60,122,85,0.1)' : 'rgba(15,26,19,0.04)', padding: '3px 7px', borderRadius: '3px' }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>{f.title}</h3>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOLUTIONS — Audience routing
          ═══════════════════════════════════════════════════════ */}
      <Section id="solutions" dark>
        <SectionHeader eyebrow="Solutions" title={<>Built for every participant<br />in the carbon market.</>} dark />

        <FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: icons.building, role: 'Corporate Buyers', desc: 'Source high-integrity credits for NRCC, CBAM, and voluntary commitments. Quality ratings remove guesswork. Insurance removes risk.', points: ['Multi-registry marketplace browsing', 'Independent quality ratings (AAA–C)', 'Insurance at checkout (Lloyd\'s-backed)', 'Portfolio management & compliance tracking', 'Retirement certificates on demand'] },
            { icon: icons.leaf, role: 'Project Developers', desc: 'List your credits on the region\'s first dedicated marketplace. Reach corporate buyers you can\'t access through bilateral channels alone.', points: ['Self-serve listing portal with inventory management', 'Reach Gulf corporate buyers directly', 'OTC and marketplace sales channels', 'Institutional settlement via ACX, CIX, Carbonplace', 'Forward contract facilitation'] },
            { icon: icons.plane, role: 'Airlines & Aviation', desc: 'Procure CORSIA-eligible credits with Letters of Authorisation and corresponding adjustments. Full compliance packaging from sourcing to retirement.', points: ['CORSIA-eligible credit sourcing', 'Letter of Authorisation procurement', 'Insurance-wrapped delivery guarantees', 'Multi-year forward offtake structuring', 'Dedicated procurement desk'] },
            { icon: icons.code, role: 'Developers & Platforms', desc: 'Embed carbon offsetting into checkout flows, fintech apps, and corporate platforms. REST API with real-time offset logging and monthly retirement.', points: ['Point-of-sale retirement API', 'Webhook notifications & SDKs', 'White-label certificate generation', 'Sandbox environment for testing', 'From $0.15/call + 25% margin on credit cost'] },
          ].map(s => (
            <div key={s.role} style={{ background: 'rgba(240,242,238,0.04)', border: '1px solid rgba(60,122,85,0.1)', borderRadius: '8px', padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(60,122,85,0.1)', border: '1px solid rgba(60,122,85,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', marginBottom: '14px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: bg, fontSize: '17px', fontWeight: 700, color: '#EEEEE8', marginBottom: '8px' }}>{s.role}</h3>
              <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--sage)', lineHeight: 1.65, marginBottom: '18px' }}>{s.desc}</p>
              <ul className="space-y-2">
                {s.points.map(p => (
                  <li key={p} className="flex items-start gap-2.5">
                    <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }}>{icons.check}</span>
                    <span style={{ fontFamily: bg, fontSize: '12.5px', color: 'rgba(190,210,198,0.75)' }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        </FadeIn>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          MARKET DATA — The intelligence layer
          ═══════════════════════════════════════════════════════ */}
      <Section id="market-data">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
          <div>
            <SectionHeader eyebrow="Market Intelligence" title={<>Data you can<br />actually trust.</>} subtitle="Every credit on CarbonBridge is independently rated against ICVCM Core Carbon Principles. No guesswork. No greenwashing." center={false} />

            <div className="space-y-4 mt-8">
              {[
                { title: 'Quality Ratings', desc: 'AAA to C scale based on ICVCM CCP assessment — additionality, permanence, leakage risk, co-benefit scoring, and methodology integrity.' },
                { title: 'Price Intelligence', desc: 'Benchmarks by credit type, geography, vintage, and quality tier sourced from public registry data. Historical trends, vintage spread analysis.' },
                { title: 'Compliance Mapping', desc: 'Eligibility checks: which credits qualify for NRCC, CBAM, CORSIA, SBTi BVCM, and VCMI claims — visible before you commit.' },
                { title: 'Risk Scores', desc: 'Permanence risk, political risk, and reversal probability scores for every project. Know what you\'re buying.' },
              ].map(item => (
                <div key={item.title} style={{ borderLeft: '2px solid var(--gold)', paddingLeft: '16px' }}>
                  <h4 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          </FadeIn>

          {/* Credit row preview — financial data rows, not greeting-card tiles */}
          <FadeIn>
          <div>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', background: 'var(--canvas)' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0', padding: '10px 18px', background: 'var(--slate)', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Project</span>
                <span style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'right', paddingRight: '20px' }}>Rating</span>
                <span style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'right', minWidth: '70px' }}>Price</span>
              </div>
              {[
                { type: 'ARR', project: 'Great Southern Forest Restoration', location: 'Victoria, Australia', registry: 'Verra VCS', vintage: '2025', rating: 'AA', price: '26.40', volume: '45,000', badge: 'Removal', badgeColor: '#4A8A5C', id: 'cb-au-arr-001' },
                { type: 'Blue Carbon', project: 'Abu Dhabi Mangrove Conservation', location: 'Abu Dhabi, UAE', registry: 'Verra VCS', vintage: '2025', rating: 'AAA', price: '42.50', volume: '12,000', badge: 'Blue Carbon', badgeColor: '#4A7A8A', id: 'cb-ae-blue-001' },
                { type: 'Biochar', project: 'Queensland Biochar Sequestration', location: 'Queensland, Australia', registry: 'Verra VCS', vintage: '2026', rating: 'AA+', price: '142.00', volume: '8,200', badge: 'Engineered CDR', badgeColor: '#7A6A4A', id: 'cb-au-bio-001' },
              ].map((c, i) => (
                <a key={c.project} href={`/credits/${c.id}`}
                  style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0', alignItems: 'center', padding: '14px 18px', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: c.badgeColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c.badge}</span>
                      <span style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)' }}>{c.vintage}</span>
                    </div>
                    <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.project}</div>
                    <div style={{ fontFamily: mono, fontSize: '10px', color: 'var(--sage)', marginTop: '1px' }}>{c.location}</div>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: '13px', fontWeight: 700, color: 'var(--forest)', paddingRight: '20px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.rating}</div>
                  <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', minWidth: '70px' }}>${c.price}</div>
                </a>
              ))}
            </div>
            <p style={{ fontFamily: mono, fontSize: '9px', color: 'var(--sage)', opacity: 0.6, textAlign: 'right', marginTop: '8px', letterSpacing: '0.04em' }}>
              Illustrative listings · Prices from public VCM data (Ecosystem Marketplace, ACX)
            </p>
            <div className="text-center pt-4">
              <a href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} className="hover:underline">
                Browse all credits {icons.arrow}
              </a>
            </div>
          </div>
          </FadeIn>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          INSURANCE — The trust differentiator
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--forest-deep)', padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">
          <SectionHeader eyebrow="Integrated Insurance" title={<>Every credit purchase,<br />protected.</>} subtitle="Optional insurance at checkout — the only carbon marketplace with integrated credit guarantee products backed by Lloyd's of London." dark />

          <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: icons.shield, title: 'Non-Delivery', desc: 'Full refund if credits are not delivered as specified in the purchase agreement.' },
              { icon: icons.lock, title: 'Invalidation', desc: 'Protection if a registry invalidates credits post-issuance due to methodology or verification failures.' },
              { icon: icons.globe, title: 'Political Risk', desc: 'Coverage for sovereign intervention, export restrictions, or regulatory changes in the project host country.' },
              { icon: icons.plane, title: 'CORSIA Guarantee', desc: 'Insurance that credits maintain CORSIA eligibility through the entire compliance period.' },
            ].map(i => (
              <div key={i.title} style={{ background: 'rgba(240,242,238,0.03)', border: '1px solid rgba(60,122,85,0.1)', borderRadius: '8px', padding: '22px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(60,122,85,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', marginBottom: '14px' }}>{i.icon}</div>
                <h3 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 700, color: '#EEEEE8', marginBottom: '6px' }}>{i.title}</h3>
                <p style={{ fontFamily: bg, fontSize: '12.5px', color: 'var(--sage)', lineHeight: 1.6 }}>{i.desc}</p>
              </div>
            ))}
          </div>

          {/* Insurance partner logos — honest treatment at readable opacity */}
          <div className="mt-12" style={{ borderTop: '1px solid rgba(60,122,85,0.06)', paddingTop: '24px' }}>
            <div className="text-center mb-5">
              <span style={{ fontFamily: mono, fontSize: '9px', color: 'rgba(99,122,106,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Insurance &amp; Underwriting Partners (target)</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4" style={{ opacity: 0.4 }}>
              {[
                { src: '/partners/lloyds.svg', alt: "Lloyd's of London", w: 120 },
                { src: '/partners/kita.svg', alt: 'Kita', w: 60 },
                { src: '/partners/munichre.svg', alt: 'Munich Re', w: 100 },
                { src: '/partners/cfc.svg', alt: 'CFC Underwriting', w: 50 },
              ].map(p => (
                <img key={p.alt} src={p.src} alt={p.alt} width={p.w} height={28} style={{ height: '24px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
              ))}
            </div>
            <p className="text-center mt-4" style={{ fontFamily: mono, fontSize: '9px', color: 'rgba(99,122,106,0.35)', letterSpacing: '0.04em' }}>
              Insurance distributed by CarbonBridge. Underwritten by Lloyd&apos;s of London syndicates.
            </p>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT — Credibility
          ═══════════════════════════════════════════════════════ */}
      <Section id="about">
        <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader eyebrow="About" title={<>Built by operators,<br />not observers.</>} subtitle="CarbonBridge was founded by a team with experience across carbon markets, institutional finance, and technology — headquartered in Abu Dhabi with operations in Australia." center={false} />

            <div className="grid grid-cols-2 gap-3 mt-8">
              {[
                'ADGM jurisdiction — Abu Dhabi',
                'Verra General Account (target)',
                'ACX Abu Dhabi (target)',
                'Institutional-grade settlement',
                'Lloyd\'s insurance distribution',
                'Multi-registry access',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }}>{icons.check}</span>
                  <span style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--forest)', borderRadius: '8px', padding: '32px' }}>
            <div style={{ fontFamily: mono, fontSize: '9px', fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '18px' }}>Our Position</div>
            <blockquote style={{ fontFamily: fr, fontSize: '19px', fontWeight: 400, fontStyle: 'italic', color: '#EEEEE8', lineHeight: 1.55, borderLeft: '2px solid rgba(60,122,85,0.3)', paddingLeft: '18px', margin: '0 0 20px' }}>
              &ldquo;The first self-serve carbon credit marketplace with integrated insurance, data analytics, and compliance tools — built specifically for the MENA market.&rdquo;
            </blockquote>
            <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--sage)', lineHeight: 1.65 }}>
              No existing platform combines marketplace, brokerage, insurance distribution, data ratings, API services, carbon management SaaS, and managed procurement in one product. We do.
            </p>
          </div>
        </div>
        </FadeIn>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--canvas)', padding: '96px 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <SectionHeader eyebrow="FAQ" title="Common questions." />
          <div className="space-y-0">
            {[
              { q: 'What registries do you support?', a: 'CarbonBridge supports credits from Verra (VCS), Gold Standard, and the American Carbon Registry (ACR). We also facilitate ACCU-adjacent projects registered directly with Verra.' },
              { q: 'How are credits rated?', a: 'We use an independent rating framework based on ICVCM Core Carbon Principles. Each credit is scored on additionality, permanence, leakage risk, co-benefits, and methodology integrity — from AAA (highest) to C.' },
              { q: 'Is the insurance mandatory?', a: 'No. Insurance is optional and available at checkout. You choose the level of cover you need — from basic non-delivery protection to comprehensive CORSIA guarantees.' },
              { q: 'How does settlement work?', a: 'All marketplace transactions settle via bank transfer (recommended) or card payment through Tap Payments or Stripe (buyer\'s choice). Bank transfer purchases generate a legally binding Purchase Agreement valid for 5 business days. For institutional-grade credit settlement, transfers are executed through ACX Abu Dhabi, CIX Singapore, or Carbonplace — delivery versus payment.' },
              { q: 'Do you sell your own credits?', a: 'Yes, through CarbonBridge Direct — our own curated inventory. These are always clearly labelled and never algorithmically favoured over third-party listings.' },
              { q: 'What compliance frameworks do you support?', a: 'We map every credit to its eligibility for UAE NRCC, EU CBAM, ICAO CORSIA, SBTi BVCM, and VCMI claims. This mapping is visible before purchase.' },
            ].map(faq => (
              <details key={faq.q} className="group" style={{ borderBottom: '1px solid var(--border-light)', padding: '18px 0' }}>
                <summary style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none', gap: '16px' }} className="[&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="group-open:rotate-180 transition-transform duration-200" style={{ color: 'var(--ink-muted)', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                </summary>
                <p style={{ fontFamily: bg, fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.68, marginTop: '10px', paddingRight: '28px' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════ */}
      <section id="contact" style={{ background: 'var(--forest-deep)', padding: '96px 0', position: 'relative' }}>
        <div className="max-w-[580px] mx-auto px-6 lg:px-10 text-center relative">
          <h2 style={{ fontFamily: fr, fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 700, color: '#EEEEE8', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '14px' }}>
            Navigate the carbon market<br />with confidence.
          </h2>
          <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--sage)', lineHeight: 1.7, marginBottom: '32px' }}>
            Whether you&apos;re sourcing your first credit or managing a large compliance programme — contact us for a direct conversation about your requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:hello@carbonbridge.ae" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: 'var(--forest-deep)', background: 'var(--gold)', padding: '13px 28px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Contact our team {icons.arrow}
            </a>
            <a href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: 'rgba(238,238,232,0.65)', padding: '13px 28px', borderRadius: '6px', border: '1px solid rgba(238,238,232,0.12)' }}>
              Explore the platform
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--forest-deep)', borderTop: '1px solid rgba(74,139,100,0.06)', padding: '56px 0 36px' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '24px', width: 'auto' }} />
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#4A6B55', marginTop: '10px', lineHeight: 1.6 }}>
                MENA&apos;s first integrated carbon credit marketplace. Abu Dhabi, UAE. ADGM authorisation in progress.
              </p>
            </div>
            {[
              { title: 'Platform', items: [
                { label: 'Marketplace', href: '/marketplace' },
                { label: 'Data & Ratings', href: '/data' },
                { label: 'Insurance', href: '/marketplace' },
                { label: 'Compare Credits', href: '/compare' },
                { label: 'Carbon Management', href: '/carbon-management' },
              ] },
              { title: 'Solutions', items: [
                { label: 'Corporate Buyers', href: '/#solutions' },
                { label: 'Project Developers', href: '/#solutions' },
                { label: 'Airlines & CORSIA', href: '/#solutions' },
                { label: 'CBAM Compliance', href: '/#solutions' },
                { label: 'Advisory', href: 'mailto:hello@carbonbridge.ae' },
              ] },
              { title: 'Company', items: [
                { label: 'About', href: '/about' },
                { label: 'Contact', href: 'mailto:hello@carbonbridge.ae' },
                { label: 'Privacy', href: '/legal/privacy' },
                { label: 'Terms', href: '/legal/terms' },
                { label: 'Insurance Terms', href: '/legal/insurance' },
                { label: 'API Terms', href: '/legal/api-terms' },
                { label: 'Marketplace Rules', href: '/legal/marketplace-rules' },
              ] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#4A8B64', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item.label}><a href={item.href} style={{ fontFamily: bg, fontSize: '13px', color: '#4A6B55' }} className="hover:text-white transition-colors duration-200">{item.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(60,122,85,0.06)', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: mono, fontSize: '10px', color: '#3A5A45', letterSpacing: '0.04em' }}>
              © {new Date().getFullYear()} CarbonBridge. Operating under ADGM jurisdiction.
            </span>
            <a href="mailto:hello@carbonbridge.ae" style={{ fontFamily: mono, fontSize: '10px', color: '#3A5A45', letterSpacing: '0.04em' }} className="hover:text-white transition-colors">hello@carbonbridge.ae</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
