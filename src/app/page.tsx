"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════
   CarbonBridge — Homepage V3
   + Dynamic NRCC countdown
   + Scroll-triggered animations (IntersectionObserver)
   + Tactile hover states on credit cards
   + Geometric decorative circles on dark sections
   + Market data disclaimer ("Indicative")
   ═══════════════════════════════════════════════════════════════ */

/* ─── Dynamic countdown ──────────────────────────────────── */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00+04:00");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

/* ─── Scroll-triggered fade-in ───────────────────────────── */
function FadeIn({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────── */
function AnimCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Decorative geometric circles (brand guideline element) */
function GeoCircles({ side = "right" }: { side?: "left" | "right" }) {
  return (
    <div style={{ position: "absolute", [side]: "-60px", top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }}>
      <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
        <circle cx="160" cy="160" r="155" stroke="#C9A96E" strokeWidth="1" />
        <circle cx="160" cy="160" r="110" stroke="#C9A96E" strokeWidth="0.5" />
        <circle cx="160" cy="160" r="65" stroke="#C9A96E" strokeWidth="0.5" />
        <line x1="5" y1="160" x2="315" y2="160" stroke="#C9A96E" strokeWidth="0.3" />
        <line x1="160" y1="5" x2="160" y2="315" stroke="#C9A96E" strokeWidth="0.3" />
      </svg>
    </div>
  );
}

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

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
function Section({ id, dark, children, className = '', geo }: { id?: string; dark?: boolean; children: React.ReactNode; className?: string; geo?: "left" | "right" | "both" }) {
  return (
    <section id={id} style={{ background: dark ? 'var(--forest)' : 'var(--parchment)', padding: '100px 0', position: 'relative', overflow: 'hidden' }} className={className}>
      {geo && (geo === "both" ? <><GeoCircles side="left" /><GeoCircles side="right" /></> : <GeoCircles side={geo} />)}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle, dark, center = true }: { eyebrow: string; title: React.ReactNode; subtitle?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={center ? 'text-center mb-16' : 'mb-12'}>
      <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: dark ? '#C9A96E' : 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{eyebrow}</span>
      <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: dark ? '#FFFCF6' : 'var(--ink)', lineHeight: 1.12, letterSpacing: '-0.025em', marginTop: '10px', maxWidth: center ? '600px' : undefined, marginLeft: center ? 'auto' : undefined, marginRight: center ? 'auto' : undefined }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontFamily: bg, fontSize: '15px', color: dark ? '#8AAA92' : 'var(--ink-muted)', lineHeight: 1.65, maxWidth: '520px', margin: center ? '14px auto 0' : '14px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════════════
          NAVIGATION 
          ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(12,28,20,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '48px', width: 'auto' }} />
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {[
              { label: 'Marketplace', href: '/marketplace' },
              { label: 'Data & Insights', href: '/data' },
              { label: 'About', href: '/about' },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontFamily: bg, fontSize: '13.5px', fontWeight: 500, color: 'rgba(255,252,246,0.55)' }} className="hover:text-white transition-colors duration-300">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="/register" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 500, color: 'rgba(201,169,110,0.8)', padding: '7px 18px', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '7px' }} className="hover:border-[rgba(201,169,110,0.5)] hover:text-[#C9A96E] transition-all duration-300">
              Sign in
            </a>
            <a href="#contact" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: 'var(--forest-deep)', background: '#C9A96E', padding: '7px 20px', borderRadius: '7px' }} className="hover:brightness-110 transition-all duration-200">
              Create account
            </a>
          </div>

          <button className="lg:hidden text-white/60 hover:text-white" aria-label="Menu">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(175deg, #0C1C14 0%, #142E22 50%, #1B3A2D 100%)', paddingTop: '140px', paddingBottom: '110px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(201,169,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {/* Decorative geometric circles — brand element */}
        <div style={{ position: 'absolute', right: '-120px', bottom: '-80px', opacity: 0.025, pointerEvents: 'none' }}>
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="245" stroke="#C9A96E" strokeWidth="1" />
            <circle cx="250" cy="250" r="180" stroke="#C9A96E" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="115" stroke="#C9A96E" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="50" stroke="#C9A96E" strokeWidth="0.5" />
          </svg>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <div className="flex items-center gap-3 mb-7">
                <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', padding: '5px 14px', borderRadius: '100px' }}>
                  Create your free account today
                </span>
              </div>

              <h1 style={{ fontFamily: fr, fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 700, color: '#FFFCF6', lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: '22px' }}>
                The carbon credit marketplace built for the Gulf compliance wave.
              </h1>

              <p style={{ fontFamily: bg, fontSize: '16px', color: '#8AAA92', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
                Discover, compare, and purchase verified carbon credits with integrated insurance, quality ratings, and institutional-grade settlement — in one platform.
              </p>

              <div className="flex flex-wrap gap-3 mb-14">
                <a href="/register" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: 'var(--forest-deep)', background: '#C9A96E', padding: '13px 28px', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} className="hover:brightness-110 transition-all duration-200">
                  Create free account {icons.arrow}
                </a>
                <a href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: 'rgba(255,252,246,0.7)', padding: '13px 28px', borderRadius: '9px', border: '1px solid rgba(255,252,246,0.1)' }} className="hover:border-white/25 hover:text-white transition-all duration-300">
                  Explore the platform
                </a>
              </div>

              {/* Trust bar — Settlement partner logos */}
              <div style={{ borderTop: '1px solid rgba(201,169,110,0.1)', paddingTop: '24px' }}>
                <div style={{ fontFamily: bg, fontSize: '10px', color: 'rgba(138,170,146,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Settlement &amp; Registry Partners</div>
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4" style={{ opacity: 0.4 }}>
                  {[
                    { src: '/partners/acx.svg', alt: 'ACX Abu Dhabi', w: 80 },
                    { src: '/partners/carbonplace.svg', alt: 'Carbonplace', w: 110 },
                    { src: '/partners/cix.svg', alt: 'CIX Singapore', w: 90 },
                    { src: '/partners/xpansiv.svg', alt: 'Xpansiv CBL', w: 80 },
                    { src: '/partners/verra.svg', alt: 'Verra', w: 70 },
                    { src: '/partners/goldstandard.svg', alt: 'Gold Standard', w: 100 },
                  ].map(p => (
                    <img key={p.alt} src={p.src} alt={p.alt} width={p.w} height={28} style={{ height: '22px', width: 'auto', filter: 'brightness(0) invert(1)', transition: 'opacity 0.3s' }} className="hover:opacity-100" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Market data dashboard */}
            <div style={{ background: 'rgba(12,28,20,0.6)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '18px', padding: '28px', position: 'relative' }}>
              <div className="flex items-center justify-between mb-6">
                <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92' }}>Market Overview</span>
                <span style={{ fontFamily: bg, fontSize: '10px', color: 'rgba(138,170,146,0.4)', background: 'rgba(138,170,146,0.08)', padding: '2px 8px', borderRadius: '4px' }}>Indicative</span>
              </div>

              {/* Price grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'High-Integrity VCUs', price: '$14.80', delta: '+18.4%', up: true },
                  { label: 'Blue Carbon', price: '$64.00', delta: '+28.7%', up: true },
                  { label: 'Biochar / CDR', price: '$142.00', delta: '+45.2%', up: true },
                  { label: 'Legacy Credits', price: '$3.50', delta: '-22.1%', up: false },
                ].map(p => (
                  <div key={p.label} style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.06)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.label}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span style={{ fontFamily: fr, fontSize: '20px', fontWeight: 700, color: '#FFFCF6' }}>{p.price}</span>
                      <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: p.up ? '#22C55E' : '#EF4444' }}>{p.delta}</span>
                    </div>
                    <div style={{ fontFamily: bg, fontSize: '10px', color: 'rgba(138,170,146,0.4)', marginTop: '2px' }}>per tCO₂e</div>
                  </div>
                ))}
              </div>

              {/* Volume bars */}
              <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Retirement volume by type (2024)</div>
              <div className="space-y-2">
                {[
                  { label: 'Nature-Based', pct: 56, color: '#22C55E' },
                  { label: 'Engineered', pct: 24, color: '#8B5CF6' },
                  { label: 'Avoidance', pct: 14, color: '#0EA5E9' },
                  { label: 'Other', pct: 6, color: '#6B8A74' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92', width: '90px', flexShrink: 0 }}>{b.label}</span>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,252,246,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: '3px', transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', width: '28px', textAlign: 'right' }}>{b.pct}%</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(201,169,110,0.06)', marginTop: '20px', paddingTop: '14px', fontFamily: bg, fontSize: '10px', color: 'rgba(138,170,146,0.35)', lineHeight: 1.5 }}>
                182M tonnes retired in 2024 · $535M total value · Quality premium widening<br />
                <span style={{ fontSize: '9px', opacity: 0.7 }}>Prices are indicative benchmarks from public registry data. Not real-time trading prices.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PARTNER LOGOS — Full-width credibility bar
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--parchment)', borderBottom: '1px solid var(--border-light)', padding: '40px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-6">
            <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>Trusted Settlement &amp; Insurance Infrastructure</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5" style={{ opacity: 0.3 }}>
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
              <img key={p.alt} src={p.src} alt={p.alt} width={p.w} height={28} style={{ height: '20px', width: 'auto', filter: 'grayscale(1)', transition: 'all 0.3s' }} className="hover:grayscale-0 hover:opacity-80" />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE PROBLEM — Why this matters now
          ═══════════════════════════════════════════════════════ */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionHeader eyebrow="The Compliance Wave" title={<>Three regulations.<br />One deadline.<br />No platform.</>} subtitle="" center={false} />
            <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              For the first time, MENA corporations face simultaneous carbon compliance obligations — the UAE&apos;s National Registry for Carbon Credits, the EU&apos;s Carbon Border Adjustment Mechanism, and ICAO&apos;s CORSIA mandate for airlines. Yet there is no marketplace, no integrated purchasing infrastructure, and no compliance tooling built for this region. Companies are navigating a complex, opaque market with spreadsheets and phone calls.
            </p>
            <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.7, marginTop: '16px' }}>
              CarbonBridge changes that.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { reg: 'UAE NRCC', deadline: 'May 30, 2026', days: `${daysUntil('2026-05-30')} days`, desc: 'Mandatory carbon reporting for large UAE emitters. First compliance deadline for the National Registry of Carbon Credits.', color: '#EF4444' },
              { reg: 'EU CBAM', deadline: 'January 1, 2027', days: `${daysUntil('2027-01-01')} days`, desc: 'Carbon Border Adjustment Mechanism. UAE aluminium, steel, cement, and fertiliser exporters to the EU must purchase equivalent carbon credits.', color: '#F59E0B' },
              { reg: 'CORSIA Phase 2', deadline: '2027–2035', days: 'Procurement starting now', desc: 'Mandatory carbon offsetting for international aviation. Emirates, Etihad, and Qatar Airways face multi-million credit requirements annually.', color: '#0EA5E9' },
            ].map((r, i) => (
              <FadeIn key={r.reg} delay={i * 150}>
                <div style={{ background: 'var(--cream)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '24px', borderLeft: `3px solid ${r.color}`, transition: 'box-shadow 0.3s' }} className="hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>{r.reg}</span>
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: r.color, background: `${r.color}15`, padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>{r.days}</span>
                  </div>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>{r.desc}</p>
                  <span style={{ fontFamily: bg, fontSize: '11px', color: 'rgba(107,98,89,0.5)', marginTop: '6px', display: 'block' }}>Deadline: {r.deadline}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          PLATFORM — How it works
          ═══════════════════════════════════════════════════════ */}
      <section id="platform" style={{ background: 'var(--cream)', padding: '100px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <SectionHeader eyebrow="The Platform" title={<>From discovery to retirement,<br />in one workflow.</>} subtitle="CarbonBridge integrates seven capabilities that are typically fragmented across different providers, spreadsheets, and manual processes." />

          {/* Process steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {[
              { step: '01', title: 'Discover', desc: 'Browse verified credits across Verra, Gold Standard, and ACR. Filter by type, geography, vintage, price, and ICVCM quality rating.' },
              { step: '02', title: 'Evaluate', desc: 'Compare credits using independent quality ratings, co-benefit scores, permanence risk assessments, and real-time price benchmarks.' },
              { step: '03', title: 'Purchase & Insure', desc: 'Buy with integrated insurance at checkout — non-delivery cover, invalidation protection, and CORSIA guarantees backed by Lloyd\'s.' },
              { step: '04', title: 'Retire & Report', desc: 'Retire credits across any registry from one dashboard. Auto-generated retirement certificates and audit-ready compliance records.' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 100}>
                <div style={{ position: 'relative' }}>
                  {i < 3 && <div className="hidden md:block" style={{ position: 'absolute', top: '24px', right: '-12px', width: '24px', height: '1px', background: 'var(--border-light)' }} />}
                  <div style={{ fontFamily: fr, fontSize: '32px', fontWeight: 300, color: 'var(--gold)', marginBottom: '12px', opacity: 0.6 }}>{s.step}</div>
                  <h3 style={{ fontFamily: fr, fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Capability cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: icons.globe, title: 'Marketplace', desc: 'Connect developers and buyers across multiple registries. Self-serve listings, RFQ system, and OTC facilitation.', tag: 'Core' },
              { icon: icons.shield, title: 'Integrated Insurance', desc: 'Optional credit guarantee insurance at checkout. Non-delivery, invalidation, political risk, and CORSIA covers via Kita and CFC (Lloyd\'s syndicates).', tag: 'Unique' },
              { icon: icons.chart, title: 'Data & Ratings', desc: 'Independent credit quality ratings (AAA–C) against ICVCM CCP criteria. Price benchmarks, vintage analysis, and compliance eligibility mapping.', tag: 'Core' },
              { icon: icons.code, title: 'Retirement API', desc: 'REST API for point-of-sale carbon offsetting. Real-time retirement, certificate generation, and webhook notifications. From $0.02/tonne.', tag: 'Developer' },
              { icon: icons.database, title: 'Carbon Management', desc: 'Track your emissions, manage compliance obligations, and optimise your portfolio with dynamic tools and real-time market data.', tag: 'Enterprise' },
              { icon: icons.users, title: 'Managed Procurement', desc: 'White-glove service for large compliance buyers. CORSIA credit sourcing, CBAM bundling, forward offtake structuring, and dedicated account management.', tag: 'Premium' },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="group" style={{ background: '#FFFCF6', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '28px', transition: 'box-shadow 0.3s, border-color 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,58,45,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
                  <div className="flex items-start justify-between mb-4">
                    <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', transition: 'transform 0.2s' }} className="group-hover:scale-105">{f.icon}</div>
                    <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: f.tag === 'Unique' ? '#C9A96E' : 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', background: f.tag === 'Unique' ? 'rgba(201,169,110,0.1)' : 'rgba(26,23,20,0.04)', padding: '3px 8px', borderRadius: '4px' }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>{f.title}</h3>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOLUTIONS — Audience routing
          ═══════════════════════════════════════════════════════ */}
      <Section id="solutions" dark geo="right">
        <SectionHeader eyebrow="Solutions" title={<>Built for every participant<br />in the carbon market.</>} dark />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: icons.building, role: 'Corporate Buyers', desc: 'Source high-integrity credits for NRCC, CBAM, and voluntary commitments. Quality ratings remove guesswork. Insurance removes risk.', points: ['Multi-registry marketplace browsing', 'Independent quality ratings (AAA–C)', 'Insurance at checkout (Lloyd\'s-backed)', 'Portfolio management & compliance tracking', 'Retirement certificates on demand'] },
            { icon: icons.leaf, role: 'Project Developers', desc: 'List your credits on the region\'s first dedicated marketplace. Reach corporate buyers you can\'t access through bilateral channels alone.', points: ['Self-serve listing portal with inventory management', 'Reach Gulf corporate buyers directly', 'OTC and marketplace sales channels', 'Institutional settlement via ACX, CIX, Carbonplace', 'Forward contract facilitation'] },
            { icon: icons.plane, role: 'Airlines & Aviation', desc: 'Procure CORSIA-eligible credits with Letters of Authorisation and corresponding adjustments. Full compliance packaging from sourcing to retirement.', points: ['CORSIA-eligible credit sourcing', 'Letter of Authorisation procurement', 'Insurance-wrapped delivery guarantees', 'Multi-year forward offtake structuring', 'Dedicated procurement desk'] },
            { icon: icons.code, role: 'Developers & Platforms', desc: 'Embed carbon offsetting into checkout flows, fintech apps, and corporate platforms. REST API with real-time retirement and certificate generation.', points: ['Point-of-sale retirement API', 'Webhook notifications & SDKs', 'White-label certificate generation', 'Sandbox environment for testing', 'Usage-based pricing from $0.02/tonne'] },
          ].map(s => (
            <div key={s.role} style={{ background: 'rgba(255,252,246,0.04)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '16px', padding: '32px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', marginBottom: '16px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#FFFCF6', marginBottom: '8px' }}>{s.role}</h3>
              <p style={{ fontFamily: bg, fontSize: '13.5px', color: '#8AAA92', lineHeight: 1.6, marginBottom: '20px' }}>{s.desc}</p>
              <ul className="space-y-2.5">
                {s.points.map(p => (
                  <li key={p} className="flex items-start gap-2.5">
                    <span style={{ color: '#C9A96E', flexShrink: 0, marginTop: '2px' }}>{icons.check}</span>
                    <span style={{ fontFamily: bg, fontSize: '13px', color: 'rgba(197,213,203,0.8)' }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          MARKET DATA — The intelligence layer
          ═══════════════════════════════════════════════════════ */}
      <Section id="market-data">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader eyebrow="Market Intelligence" title={<>Data you can<br />actually trust.</>} subtitle="Every credit on CarbonBridge is independently rated against ICVCM Core Carbon Principles. No guesswork. No greenwashing." center={false} />
            
            <div className="space-y-4 mt-8">
              {[
                { title: 'Quality Ratings', desc: 'AAA to C scale based on ICVCM CCP assessment — additionality, permanence, leakage risk, co-benefit scoring, and methodology integrity.' },
                { title: 'Price Intelligence', desc: 'Real-time benchmarks by credit type, geography, vintage, and quality tier. Historical trends, forward curves, and spread analysis.' },
                { title: 'Compliance Mapping', desc: 'Instant eligibility checks: which credits qualify for NRCC, CBAM, CORSIA, SBTi BVCM, and VCMI claims — before you buy.' },
                { title: 'Risk Scores', desc: 'Permanence risk, political risk, and reversal probability scores for every project. Know what you\'re buying.' },
              ].map(item => (
                <div key={item.title} style={{ borderLeft: '2px solid var(--gold)', paddingLeft: '16px' }}>
                  <h4 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '3px' }}>{item.title}</h4>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Credit card preview — tactile hover states */}
          <div className="space-y-4">
            {[
              { type: 'ARR / Reforestation', project: 'Great Southern Forest Restoration', location: 'Victoria, Australia', registry: 'Verra VCS', vintage: '2025', rating: 'AA', price: '$26.40', volume: '45,000', badge: 'Removal', badgeColor: '#16A34A' },
              { type: 'Blue Carbon', project: 'Abu Dhabi Mangrove Conservation', location: 'Abu Dhabi, UAE', registry: 'Verra VCS', vintage: '2025', rating: 'AAA', price: '$64.00', volume: '12,000', badge: 'Premium', badgeColor: '#0EA5E9' },
              { type: 'Biochar', project: 'Queensland Biochar Sequestration', location: 'Queensland, Australia', registry: 'Verra VCS', vintage: '2026', rating: 'AA+', price: '$142.00', volume: '8,200', badge: 'Engineered CDR', badgeColor: '#8B5CF6' },
            ].map((c, i) => (
              <FadeIn key={c.project} delay={i * 120}>
                <div
                  className="group cursor-pointer"
                  style={{ background: 'var(--cream)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.25s ease, box-shadow 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(27,58,45,0.08)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.2s' }} className="group-hover:scale-105">
                    <span style={{ fontFamily: fr, fontSize: '16px', fontWeight: 700, color: '#C9A96E' }}>{c.rating}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: c.badgeColor, background: `${c.badgeColor}12`, padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{c.badge}</span>
                      <span style={{ fontFamily: bg, fontSize: '11px', color: 'var(--ink-muted)' }}>{c.registry} · {c.vintage}</span>
                    </div>
                    <h4 style={{ fontFamily: fr, fontSize: '15px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{c.project}</h4>
                    <span style={{ fontFamily: bg, fontSize: '12px', color: 'var(--ink-muted)' }}>{c.location} · {c.volume} tCO₂e available</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: fr, fontSize: '20px', fontWeight: 700, color: 'var(--forest)', transition: 'color 0.2s' }} className="group-hover:text-[#C9A96E]">{c.price}</div>
                    <div style={{ fontFamily: bg, fontSize: '10px', color: 'var(--ink-muted)' }}>per tCO₂e</div>
                  </div>
                </div>
              </FadeIn>
            ))}
            <p style={{ fontFamily: bg, fontSize: '10px', color: 'var(--ink-muted)', opacity: 0.5, textAlign: 'center', marginTop: '8px' }}>
              Illustrative listings. Prices based on public voluntary carbon market data (Ecosystem Marketplace, ACX).
            </p>
            <div className="text-center pt-2">
              <a href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} className="hover:underline">
                Browse all credits {icons.arrow}
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          INSURANCE — The trust differentiator
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--forest-deep)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(45,90,63,0.4) 0%, transparent 60%)' }} />
        <GeoCircles side="left" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">
          <SectionHeader eyebrow="Integrated Insurance" title={<>Every credit purchase,<br />protected.</>} subtitle="Optional insurance at checkout — the only carbon marketplace with integrated credit guarantee products backed by Lloyd's of London." dark />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: icons.shield, title: 'Non-Delivery', desc: 'Full refund if credits are not delivered as specified in the purchase agreement.' },
              { icon: icons.lock, title: 'Invalidation', desc: 'Protection if a registry invalidates credits post-issuance due to methodology or verification failures.' },
              { icon: icons.globe, title: 'Political Risk', desc: 'Coverage for sovereign intervention, export restrictions, or regulatory changes in the project host country.' },
              { icon: icons.plane, title: 'CORSIA Guarantee', desc: 'Insurance that credits maintain CORSIA eligibility through the entire compliance period.' },
            ].map(i => (
              <div key={i.title} style={{ background: 'rgba(255,252,246,0.03)', border: '1px solid rgba(201,169,110,0.08)', borderRadius: '14px', padding: '24px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'rgba(201,169,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', marginBottom: '14px' }}>{i.icon}</div>
                <h3 style={{ fontFamily: fr, fontSize: '17px', fontWeight: 600, color: '#FFFCF6', marginBottom: '6px' }}>{i.title}</h3>
                <p style={{ fontFamily: bg, fontSize: '12.5px', color: '#8AAA92', lineHeight: 1.55 }}>{i.desc}</p>
              </div>
            ))}
          </div>

          {/* Insurance partner logos */}
          <div className="mt-12" style={{ borderTop: '1px solid rgba(201,169,110,0.06)', paddingTop: '24px' }}>
            <div className="text-center mb-5">
              <span style={{ fontFamily: bg, fontSize: '10px', color: 'rgba(138,170,146,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Insurance &amp; Underwriting Partners</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4" style={{ opacity: 0.35 }}>
              {[
                { src: '/partners/lloyds.svg', alt: "Lloyd's of London", w: 120 },
                { src: '/partners/kita.svg', alt: 'Kita', w: 60 },
                { src: '/partners/munichre.svg', alt: 'Munich Re', w: 100 },
                { src: '/partners/cfc.svg', alt: 'CFC Underwriting', w: 50 },
              ].map(p => (
                <img key={p.alt} src={p.src} alt={p.alt} width={p.w} height={28} style={{ height: '24px', width: 'auto', filter: 'brightness(0) invert(1)', transition: 'opacity 0.3s' }} className="hover:opacity-100" />
              ))}
            </div>
            <p className="text-center mt-4" style={{ fontFamily: bg, fontSize: '11px', color: 'rgba(138,170,146,0.35)' }}>
              Insurance distributed by CarbonBridge. Underwritten by Lloyd&apos;s of London syndicates.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT — Credibility 
          ═══════════════════════════════════════════════════════ */}
      <Section id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader eyebrow="About" title={<>Built by operators,<br />not observers.</>} subtitle="CarbonBridge was founded by a team with deep experience across carbon markets, institutional finance, and technology — headquartered in the UAE with operations in Australia." center={false} />
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                'ADGM-registered entity',
                'Verra General Account holder',
                'ACX Abu Dhabi member',
                'Institutional-grade settlement',
                'Lloyd\'s insurance distribution',
                'Multi-registry access',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '1px' }}>{icons.check}</span>
                  <span style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--forest)', borderRadius: '18px', padding: '36px' }}>
            <div style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Position</div>
            <blockquote style={{ fontFamily: fr, fontSize: '20px', fontWeight: 400, fontStyle: 'italic', color: '#FFFCF6', lineHeight: 1.5, borderLeft: '2px solid rgba(201,169,110,0.3)', paddingLeft: '20px', margin: '0 0 24px' }}>
              &ldquo;The first self-serve carbon credit marketplace with integrated insurance, data analytics, and compliance tools — built specifically for the MENA market.&rdquo;
            </blockquote>
            <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', lineHeight: 1.6 }}>
              No existing platform combines marketplace, brokerage, insurance distribution, data ratings, API services, carbon management SaaS, and managed procurement in one product. We do.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: '100px 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <SectionHeader eyebrow="FAQ" title="Common questions." />
          <div className="space-y-0">
            {[
              { q: 'What registries do you support?', a: 'CarbonBridge supports credits from Verra (VCS), Gold Standard, and the American Carbon Registry (ACR). We also facilitate ACCU-adjacent projects registered directly with Verra.' },
              { q: 'How are credits rated?', a: 'We use an independent rating framework based on ICVCM Core Carbon Principles. Each credit is scored on additionality, permanence, leakage risk, co-benefits, and methodology integrity — from AAA (highest) to C.' },
              { q: 'Is the insurance mandatory?', a: 'No. Insurance is optional and available at checkout. You choose the level of cover you need — from basic non-delivery protection to comprehensive CORSIA guarantees.' },
              { q: 'How does settlement work?', a: 'Transactions under $100K settle via Stripe Connect escrow. Institutional transactions ($100K+) settle through ACX Abu Dhabi, CIX Singapore, or Carbonplace — bank-grade delivery-versus-payment.' },
              { q: 'Do you sell your own credits?', a: 'Yes, through CarbonBridge Direct — our own curated inventory. These are always clearly labelled and never algorithmically favoured over third-party listings.' },
              { q: 'What compliance frameworks do you support?', a: 'We map every credit to its eligibility for UAE NRCC, EU CBAM, ICAO CORSIA, SBTi BVCM, and VCMI claims. This mapping is visible before purchase.' },
            ].map(faq => (
              <details key={faq.q} className="group" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 0' }}>
                <summary style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }} className="[&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="group-open:rotate-180 transition-transform duration-200" style={{ color: 'var(--ink-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                </summary>
                <p style={{ fontFamily: bg, fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.65, marginTop: '12px', paddingRight: '32px' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════ */}
      <section id="contact" style={{ background: 'var(--forest-deep)', padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(45,90,63,0.3) 0%, transparent 70%)' }} />
        <div className="max-w-[600px] mx-auto px-6 lg:px-10 text-center relative">
          <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: '#FFFCF6', lineHeight: 1.12, letterSpacing: '-0.025em', marginBottom: '14px' }}>
            Ready to navigate the<br />carbon market with confidence?
          </h2>
          <p style={{ fontFamily: bg, fontSize: '15px', color: '#8AAA92', lineHeight: 1.65, marginBottom: '32px' }}>
            Whether you&apos;re purchasing your first credit or managing a multi-million dollar compliance programme — our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:hello@carbonbridge.ae" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: 'var(--forest-deep)', background: '#C9A96E', padding: '14px 32px', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} className="hover:brightness-110 transition-all duration-200">
              Contact our team {icons.arrow}
            </a>
            <a href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: 'rgba(255,252,246,0.7)', padding: '14px 32px', borderRadius: '9px', border: '1px solid rgba(255,252,246,0.1)' }} className="hover:border-white/25 transition-all">
              Explore the platform
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--forest-deep)', borderTop: '1px solid rgba(201,169,110,0.06)', padding: '56px 0 36px' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '24px', width: 'auto', opacity: 0.85 }} />
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#4A6B55', marginTop: '10px', lineHeight: 1.6 }}>
                MENA&apos;s first integrated carbon credit marketplace. ADGM registered. Abu Dhabi, UAE.
              </p>
            </div>
            {[
              { title: 'Platform', items: ['Marketplace', 'Data & Ratings', 'Insurance', 'API', 'Carbon Management'] },
              { title: 'Solutions', items: ['Corporate Buyers', 'Project Developers', 'Airlines & CORSIA', 'CBAM Compliance', 'Advisory'] },
              { title: 'Company', items: ['About', 'Contact', 'Careers', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item}><a href="#" style={{ fontFamily: bg, fontSize: '13px', color: '#4A6B55' }} className="hover:text-white transition-colors duration-200">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(201,169,110,0.06)', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: bg, fontSize: '11px', color: '#3A5A45' }}>
              © {new Date().getFullYear()} CarbonBridge. Registered in Abu Dhabi Global Market.
            </span>
            <a href="mailto:hello@carbonbridge.ae" style={{ fontFamily: bg, fontSize: '11px', color: '#3A5A45' }} className="hover:text-white transition-colors">hello@carbonbridge.ae</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
