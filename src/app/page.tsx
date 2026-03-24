import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   CarbonBridge — Homepage
   Brand: Heritage Emerald (Forest #1B3A2D + Parchment #F2ECE0 + Gold #C9A96E)
   Fonts: Fraunces (serif display) + Bricolage Grotesque (body/UI)
   Design: Dark-light split. Mahogany boardroom → sunlit courtyard.
   ═══════════════════════════════════════════════════════════════ */

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

// ─── Icon Components ────────────────────────────────────────
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const Shield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const Globe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const BarChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>
);
const Leaf = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);
const Zap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const Lock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const Database = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>
);
const Code = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
);
const CheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
const ChevDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default function Home() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════════════
          NAVIGATION — Dark zone (Forest)
          ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(27,58,45,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,169,110,0.12)' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span style={{ fontFamily: fr, fontSize: '22px', fontWeight: 700, color: '#FFFCF6', letterSpacing: '-0.02em' }}>
              Carbon<span style={{ color: '#C9A96E' }}>Bridge</span><span style={{ color: '#C9A96E' }}>.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Marketplace', href: '#marketplace' },
              { label: 'Solutions', href: '#solutions' },
              { label: 'Data & Ratings', href: '#data' },
              { label: 'Insurance', href: '#insurance' },
              { label: 'About', href: '#about' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: '#8AAA92', letterSpacing: '0.01em' }} className="hover:text-white transition-colors duration-200">
                {item.label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="#contact" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: '#C9A96E', padding: '8px 20px', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '8px' }} className="hover:border-[#C9A96E] transition-colors">
              Log in
            </a>
            <a href="#contact" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '8px 24px', borderRadius: '8px' }} className="hover:brightness-110 transition-all">
              Get started
            </a>
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden text-white" aria-label="Menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO — Dark zone (Forest deep)
          "Walking into a mahogany-panelled boardroom"
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #0C1C14 0%, #1B3A2D 100%)', paddingTop: '140px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grain overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
        
        {/* Gold accent line */}
        <div style={{ position: 'absolute', top: '72px', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)' }} />

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#C9A96E', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', padding: '6px 14px', borderRadius: '100px' }}>
              MENA&apos;s First Carbon Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: fr, fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 700, color: '#FFFCF6', lineHeight: 1.08, letterSpacing: '-0.03em', maxWidth: '800px', marginBottom: '24px' }}>
            Where carbon<br />
            credits meet<br />
            <span style={{ color: '#C9A96E' }}>institutional trust.</span>
          </h1>

          {/* Sub */}
          <p style={{ fontFamily: bg, fontSize: '18px', color: '#8AAA92', lineHeight: 1.65, maxWidth: '540px', marginBottom: '40px' }}>
            Discover, compare, purchase, and insure verified carbon credits — with integrated data analytics, portfolio management, and compliance tools built for the Gulf compliance wave.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16">
            <a href="#contact" style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '14px 32px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="hover:brightness-110 transition-all">
              Start buying credits <ArrowRight />
            </a>
            <a href="#marketplace" style={{ fontFamily: bg, fontSize: '15px', fontWeight: 500, color: '#FFFCF6', padding: '14px 32px', borderRadius: '10px', border: '1px solid rgba(255,252,246,0.15)', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="hover:border-white/30 transition-colors">
              List your credits
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-8 items-center" style={{ borderTop: '1px solid rgba(201,169,110,0.12)', paddingTop: '28px' }}>
            {[
              { num: '$535M', label: 'VCM retired value (2024)' },
              { num: '182M', label: 'tonnes retired globally' },
              { num: '66 days', label: 'until UAE NRCC deadline' },
              { num: '24.2%', label: 'AU carbon market CAGR' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: fr, fontSize: '24px', fontWeight: 700, color: '#C9A96E' }}>{s.num}</div>
                <div style={{ fontFamily: bg, fontSize: '12px', color: '#6B8A74', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRANSITION — Hard cut to parchment
          "Stepping into the sunlit courtyard"
          ═══════════════════════════════════════════════════════ */}

      {/* ── WHY CARBONBRIDGE ──────────────────────────────── */}
      <section style={{ background: 'var(--parchment)', padding: '100px 0 80px' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Why CarbonBridge</span>
            <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
              Seven revenue layers.<br />One platform.
            </h2>
            <p style={{ fontFamily: bg, fontSize: '16px', color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: '560px', margin: '16px auto 0' }}>
              We combine marketplace, brokerage, insurance distribution, data analytics, API services, carbon management SaaS, and managed procurement into a single integrated experience.
            </p>
          </div>

          {/* Feature cards — 2x3 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Globe />, title: 'Marketplace', desc: 'Connect project developers with corporate buyers across Verra, Gold Standard, and ACR registries. Multi-registry access from one account.', tag: 'Layer 1' },
              { icon: <Shield />, title: 'Insurance', desc: 'Integrated credit guarantee insurance at checkout via Kita and CFC. Non-delivery cover, invalidation protection, CORSIA guarantees.', tag: 'Layer 2' },
              { icon: <BarChart />, title: 'Data & Ratings', desc: 'Credit quality ratings powered by ICVCM CCP criteria. Price benchmarks, vintage analysis, co-benefit scoring, and market intelligence.', tag: 'Layer 3' },
              { icon: <Code />, title: 'Retirement API', desc: 'Point-of-sale carbon offsetting for e-commerce, airlines, and fintech. REST API with real-time retirement certificates.', tag: 'Layer 4' },
              { icon: <Database />, title: 'Carbon Management', desc: 'Track emissions, manage compliance obligations, and build your climate strategy with integrated portfolio tools.', tag: 'Layer 5' },
              { icon: <Zap />, title: 'Managed Procurement', desc: 'White-glove procurement for large buyers. CORSIA compliance packages, CBAM credit bundling, and forward offtake structuring.', tag: 'Layer 6' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--cream)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontFamily: bg, fontSize: '11px', fontWeight: 600, color: 'var(--gold)', background: 'rgba(201,169,110,0.1)', padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.05em' }}>{f.tag}</div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', marginBottom: '20px' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: fr, fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontFamily: bg, fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE PREVIEW ─────────────────────────────── */}
      <section id="marketplace" style={{ background: 'var(--cream)', padding: '80px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Live Marketplace</span>
            <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px' }}>
              Browse verified credits
            </h2>
            <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', maxWidth: '480px', margin: '12px auto 0', lineHeight: 1.6 }}>
              Every credit is independently rated, registry-verified, and available with optional insurance.
            </p>
          </div>

          {/* Sample credit cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { type: 'ARR', project: 'Great Southern Forest Restoration', location: 'Victoria, Australia', registry: 'Verra VCS', vintage: '2025', rating: 'AA', price: '$26.40', volume: '45,000 tCO2e', color: '#16A34A', badge: 'Removal' },
              { type: 'Blue Carbon', project: 'Abu Dhabi Mangrove Conservation', location: 'Abu Dhabi, UAE', registry: 'Verra VCS', vintage: '2025', rating: 'AAA', price: '$64.00', volume: '12,000 tCO2e', color: '#0EA5E9', badge: 'Premium' },
              { type: 'Biochar', project: 'Queensland Biochar Sequestration', location: 'Queensland, Australia', registry: 'Verra VCS', vintage: '2026', rating: 'AA+', price: '$142.00', volume: '8,200 tCO2e', color: '#8B5CF6', badge: 'Engineered' },
            ].map(c => (
              <div key={c.project} style={{ background: '#FFFCF6', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Header band */}
                <div style={{ background: 'var(--forest)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: c.color, background: `${c.color}15`, padding: '3px 10px', borderRadius: '100px', border: `1px solid ${c.color}30` }}>{c.badge}</span>
                  <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8AAA92' }}>{c.registry}</span>
                </div>
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{c.type}</div>
                  <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px', lineHeight: 1.3 }}>{c.project}</h3>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '20px' }}>{c.location}</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Rating', value: c.rating },
                      { label: 'Vintage', value: c.vintage },
                      { label: 'Available', value: c.volume },
                    ].map(d => (
                      <div key={d.label}>
                        <div style={{ fontFamily: bg, fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
                        <div style={{ fontFamily: fr, fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <div>
                      <div style={{ fontFamily: bg, fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price per tonne</div>
                      <div style={{ fontFamily: fr, fontSize: '24px', fontWeight: 700, color: 'var(--forest)' }}>{c.price}</div>
                    </div>
                    <button style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#0C1C14', background: 'var(--gold)', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="#contact" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', gap: '8px' }} className="hover:underline">
              Browse all available credits <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS BY ROLE ────────────────────────────────── */}
      <section id="solutions" style={{ background: 'var(--forest)', padding: '100px 0' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#C9A96E', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Built For You</span>
            <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#FFFCF6', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px' }}>
              Solutions by role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { role: 'Corporate Buyers', desc: 'Source high-integrity credits for NRCC, CBAM, and voluntary commitments. Compare prices, verify ratings, and insure purchases — all from one dashboard.', items: ['Multi-registry browsing', 'Quality ratings & price benchmarks', 'Insurance at checkout', 'Portfolio management & compliance tracking', 'Retirement certificates on demand'] },
              { role: 'Project Developers', desc: 'List your credits on the largest MENA-focused marketplace. Reach corporate buyers, manage inventory, and streamline settlement.', items: ['Self-serve listing portal', 'Real-time inventory management', 'OTC and marketplace sales channels', 'Institutional-grade settlement (ACX/CIX)', 'Forward contract facilitation'] },
              { role: 'Airlines & CORSIA', desc: 'Procure CORSIA-eligible credits with Letters of Authorisation and corresponding adjustments. Full compliance packaging.', items: ['CORSIA-eligible credit sourcing', 'Letter of Authorisation procurement', 'Insurance-wrapped delivery', 'Multi-year forward offtake agreements', 'Dedicated procurement desk'] },
              { role: 'API Clients', desc: 'Embed carbon offsetting into your checkout, app, or platform with our REST API. Real-time retirement and certificate generation.', items: ['Point-of-sale retirement API', 'Webhook notifications', 'Certificate generation', 'White-label options', 'Usage-based pricing from $0.02/tonne'] },
            ].map(s => (
              <div key={s.role} style={{ background: 'rgba(45,90,63,0.3)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: '16px', padding: '36px' }}>
                <h3 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#FFFCF6', marginBottom: '8px' }}>{s.role}</h3>
                <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', lineHeight: 1.6, marginBottom: '24px' }}>{s.desc}</p>
                <ul className="space-y-3">
                  {s.items.map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span style={{ color: '#C9A96E', flexShrink: 0, marginTop: '2px' }}><CheckCircle /></span>
                      <span style={{ fontFamily: bg, fontSize: '14px', color: '#C5D5CB' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA & RATINGS ─────────────────────────────────── */}
      <section id="data" style={{ background: 'var(--parchment)', padding: '100px 0' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Market Intelligence</span>
              <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px', marginBottom: '16px' }}>
                Data you can<br />actually trust.
              </h2>
              <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '32px' }}>
                Every credit on CarbonBridge is rated against ICVCM Core Carbon Principles. No guesswork. No greenwashing. Independent quality scores, price benchmarks, and vintage analysis — updated in real time.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Quality Ratings', desc: 'AAA to C scale based on ICVCM CCP criteria, additionality assessment, permanence risk, and co-benefit scoring.' },
                  { label: 'Price Intelligence', desc: 'Real-time benchmarks by credit type, geography, and vintage. Historical trends and forward curve estimates.' },
                  { label: 'Compliance Mapping', desc: 'See which credits qualify for NRCC, CBAM, CORSIA, SBTi BVCM, and VCMI claims — before you buy.' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--cream)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
                    <h4 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>{item.label}</h4>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data visualization mockup */}
            <div style={{ background: 'var(--forest)', borderRadius: '20px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#8AAA92', marginBottom: '24px' }}>MARKET OVERVIEW — MARCH 2026</div>
              
              {/* Price cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Removal Credits', price: '$26.40', change: '+12.3%', up: true },
                  { label: 'Avoidance Credits', price: '$6.34', change: '-3.1%', up: false },
                  { label: 'Blue Carbon', price: '$64.00', change: '+28.7%', up: true },
                  { label: 'Biochar', price: '$142.00', change: '+45.2%', up: true },
                ].map(p => (
                  <div key={p.label} style={{ background: 'rgba(255,252,246,0.05)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontFamily: bg, fontSize: '10px', color: '#6B8A74', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.label}</div>
                    <div style={{ fontFamily: fr, fontSize: '20px', fontWeight: 700, color: '#FFFCF6', marginTop: '4px' }}>{p.price}</div>
                    <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: p.up ? '#22C55E' : '#EF4444', marginTop: '2px' }}>{p.change} YTD</div>
                  </div>
                ))}
              </div>

              {/* Chart placeholder — styled bars */}
              <div style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', marginBottom: '12px' }}>VOLUME BY CREDIT TYPE (tCO2e retired, 2024)</div>
              <div className="space-y-3">
                {[
                  { label: 'REDD+', pct: 38, color: '#22C55E' },
                  { label: 'Renewable Energy', pct: 22, color: '#0EA5E9' },
                  { label: 'ARR / Reforestation', pct: 18, color: '#16A34A' },
                  { label: 'Biochar / Engineered', pct: 12, color: '#8B5CF6' },
                  { label: 'Blue Carbon', pct: 6, color: '#06B6D4' },
                  { label: 'Other', pct: 4, color: '#6B8A74' },
                ].map(bar => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92', width: '100px', flexShrink: 0, textAlign: 'right' }}>{bar.label}</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,252,246,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${bar.pct}%`, height: '100%', background: bar.color, borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', width: '30px' }}>{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INSURANCE ────────────────────────────────────────── */}
      <section id="insurance" style={{ background: 'var(--cream)', padding: '100px 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Integrated Insurance</span>
            <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px' }}>
              Buy with confidence.
            </h2>
            <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', maxWidth: '520px', margin: '12px auto 0', lineHeight: 1.6 }}>
              Every purchase on CarbonBridge can be insured at checkout. Protection backed by Lloyd&apos;s of London syndicates including Munich Re, Chaucer, and Tokio Marine Kiln.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Shield />, title: 'Non-Delivery', desc: 'Full refund if credits are not delivered as specified in the purchase agreement.' },
              { icon: <Lock />, title: 'Invalidation', desc: 'Protection against post-issuance invalidation by the registry due to methodology or verification failures.' },
              { icon: <Globe />, title: 'Political Risk', desc: 'Coverage for sovereign intervention, export bans, or regulatory changes in the project host country.' },
              { icon: <Leaf />, title: 'CORSIA Guarantee', desc: 'Insurance that credits will maintain CORSIA eligibility through the compliance period. Approved by Gold Standard and Verra.' },
            ].map(i => (
              <div key={i.title} style={{ background: 'var(--parchment)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '28px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', margin: '0 auto 16px' }}>
                  {i.icon}
                </div>
                <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>{i.title}</h3>
                <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>{i.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p style={{ fontFamily: bg, fontSize: '13px', color: 'var(--ink-muted)' }}>
              Insurance distributed by CarbonBridge. Underwritten by Lloyd&apos;s of London syndicates via <strong>Kita</strong> and <strong>CFC</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE URGENCY ────────────────────────────────── */}
      <section style={{ background: 'var(--forest)', padding: '80px 0' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#C9A96E', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Compliance Countdown</span>
              <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#FFFCF6', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px', marginBottom: '16px' }}>
                The Gulf compliance<br />wave is here.
              </h2>
              <p style={{ fontFamily: bg, fontSize: '15px', color: '#8AAA92', lineHeight: 1.65, marginBottom: '24px' }}>
                Three regulatory forces are converging on the MENA region simultaneously — creating the largest carbon credit demand event in the Gulf&apos;s history.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { deadline: 'May 30, 2026', reg: 'UAE NRCC', desc: 'National Registry for Carbon Credits. Mandatory reporting for large UAE emitters. First compliance deadline.', urgency: '66 days' },
                { deadline: 'Jan 1, 2027', reg: 'EU CBAM', desc: 'Carbon Border Adjustment Mechanism. UAE aluminium, steel, cement, and fertiliser exporters to the EU must purchase EU-equivalent carbon credits.', urgency: '282 days' },
                { deadline: '2027–2035', reg: 'CORSIA Phase 2', desc: 'Mandatory carbon offsetting for international aviation. Gulf carriers (Emirates, Etihad, Qatar Airways) require millions of CORSIA-eligible credits annually.', urgency: 'Procurement now' },
              ].map(r => (
                <div key={r.reg} style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '14px', padding: '24px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#FFFCF6' }}>{r.reg}</span>
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#C9A96E', background: 'rgba(201,169,110,0.15)', padding: '4px 12px', borderRadius: '100px' }}>{r.urgency}</span>
                  </div>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92', lineHeight: 1.55, marginBottom: '4px' }}>{r.desc}</p>
                  <span style={{ fontFamily: bg, fontSize: '12px', color: '#6B8A74' }}>Deadline: {r.deadline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────── */}
      <section id="about" style={{ background: 'var(--parchment)', padding: '100px 0' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>About Us</span>
              <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: '12px', marginBottom: '16px' }}>
                Built by operators,<br />not observers.
              </h2>
              <p style={{ fontFamily: bg, fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '24px' }}>
                CarbonBridge was founded by a team with deep experience across carbon markets, institutional finance, and technology — based in the UAE and Australia. We don&apos;t just build platforms. We trade, advise, and source credits alongside our clients.
              </p>
              <div className="space-y-3">
                {[
                  'ADGM-registered entity',
                  'Verra General Account holder',
                  'ACX Abu Dhabi member',
                  'Institutional settlement via ACX, CIX, and Carbonplace',
                  'Insurance distribution via Lloyd\'s of London',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <span style={{ color: 'var(--gold)' }}><CheckCircle /></span>
                    <span style={{ fontFamily: bg, fontSize: '14px', color: 'var(--ink)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Positioning statement card */}
            <div style={{ background: 'var(--forest)', borderRadius: '20px', padding: '40px', position: 'relative' }}>
              <div style={{ fontFamily: fr, fontSize: '11px', fontWeight: 600, color: '#C9A96E', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Position</div>
              <blockquote style={{ fontFamily: fr, fontSize: '22px', fontWeight: 400, fontStyle: 'italic', color: '#FFFCF6', lineHeight: 1.5, borderLeft: '3px solid #C9A96E', paddingLeft: '20px' }}>
                &ldquo;The first self-serve carbon credit marketplace with integrated insurance, data analytics, and compliance tools — built specifically for the MENA market.&rdquo;
              </blockquote>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', marginTop: '24px', lineHeight: 1.6 }}>
                No existing platform combines marketplace + brokerage + insurance + data + API + carbon management + managed procurement in one product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section id="contact" style={{ background: 'var(--forest-deep)', padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(45,90,63,0.3) 0%, transparent 70%)' }} />
        <div className="max-w-[640px] mx-auto px-6 lg:px-10 text-center relative">
          <h2 style={{ fontFamily: fr, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#FFFCF6', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Ready to trade?
          </h2>
          <p style={{ fontFamily: bg, fontSize: '16px', color: '#8AAA92', lineHeight: 1.6, marginBottom: '36px' }}>
            Whether you&apos;re buying your first credit or managing a multi-million dollar compliance programme — we&apos;ll help you navigate the carbon market with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:hello@carbonbridge.ae" style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#0C1C14', background: '#C9A96E', padding: '16px 36px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="hover:brightness-110 transition-all">
              Contact our team <ArrowRight />
            </a>
            <a href="#marketplace" style={{ fontFamily: bg, fontSize: '15px', fontWeight: 500, color: '#FFFCF6', padding: '16px 36px', borderRadius: '10px', border: '1px solid rgba(255,252,246,0.15)' }} className="hover:border-white/30 transition-colors">
              Browse marketplace
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ background: 'var(--forest-deep)', borderTop: '1px solid rgba(201,169,110,0.1)', padding: '60px 0 40px' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <span style={{ fontFamily: fr, fontSize: '18px', fontWeight: 700, color: '#FFFCF6' }}>
                Carbon<span style={{ color: '#C9A96E' }}>Bridge</span><span style={{ color: '#C9A96E' }}>.</span>
              </span>
              <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74', marginTop: '12px', lineHeight: 1.6 }}>
                MENA&apos;s first integrated carbon credit marketplace. ADGM registered.
              </p>
            </div>
            {[
              { title: 'Platform', items: ['Marketplace', 'Data & Ratings', 'Insurance', 'Retirement API', 'Carbon Management'] },
              { title: 'Solutions', items: ['Corporate Buyers', 'Project Developers', 'Airlines & CORSIA', 'CBAM Compliance', 'Advisory Services'] },
              { title: 'Company', items: ['About', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#C9A96E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item}><a href="#" style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }} className="hover:text-white transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(201,169,110,0.08)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: bg, fontSize: '12px', color: '#4A6B55' }}>
              © {new Date().getFullYear()} CarbonBridge. Registered in Abu Dhabi Global Market. All rights reserved.
            </span>
            <div className="flex gap-6">
              <a href="#" style={{ fontFamily: bg, fontSize: '12px', color: '#4A6B55' }} className="hover:text-white transition-colors">Privacy</a>
              <a href="#" style={{ fontFamily: bg, fontSize: '12px', color: '#4A6B55' }} className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:hello@carbonbridge.ae" style={{ fontFamily: bg, fontSize: '12px', color: '#4A6B55' }} className="hover:text-white transition-colors">hello@carbonbridge.ae</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
