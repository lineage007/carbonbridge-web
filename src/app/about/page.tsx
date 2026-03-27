'use client';


import Link from 'next/link';
import Navbar from '@/components/Navbar';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

export default function AboutPage() {
  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <Navbar dark={true} />

      <div>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D 60%, #0C1C14)', padding: '80px 0 72px' }}>
          <div className="max-w-[800px] mx-auto px-4 lg:px-8 text-center">
            <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>About CarbonBridge</span>
            <h1 style={{ fontFamily: fr, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#FFFCF6', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '20px' }}>
              Building the infrastructure<br />for trusted carbon markets
            </h1>
            <p style={{ fontFamily: bg, fontSize: '16px', color: '#8AAA92', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
              CarbonBridge exists because carbon markets shouldn&apos;t require a degree in environmental science to navigate. We connect buyers who need verified credits with developers who produce them — with institutional-grade data, settlement, and insurance at every step.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our thesis</span>
              <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginTop: '8px', marginBottom: '16px' }}>Carbon markets are broken by fragmentation</h2>
              <div style={{ fontFamily: bg, fontSize: '14px', color: '#3D3830', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '14px' }}>Today, buying a carbon credit requires navigating multiple registries, comparing methodologies you weren&apos;t trained to evaluate, finding brokers through word-of-mouth, negotiating prices with no benchmark, and hoping the credit you bought is actually worth what you paid.</p>
                <p style={{ marginBottom: '14px' }}>For sellers, listing credits means choosing between fragmented exchanges, dealing with manual settlement processes, and having no insurance against buyer default.</p>
                <p>This fragmentation isn&apos;t just inconvenient — it&apos;s the primary reason carbon markets haven&apos;t scaled to match the urgency of the climate crisis.</p>
              </div>
            </div>
            <div>
              <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our approach</span>
              <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginTop: '8px', marginBottom: '16px' }}>One platform. Complete workflow.</h2>
              <div style={{ fontFamily: bg, fontSize: '14px', color: '#3D3830', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '14px' }}>CarbonBridge integrates the seven capabilities that are currently scattered across dozens of providers: discovery, quality assessment, marketplace, insurance, settlement, retirement, and compliance reporting.</p>
                <p style={{ marginBottom: '14px' }}>We don&apos;t build another exchange. We don&apos;t compete with registries. We build the workflow layer that makes carbon markets accessible to every organisation that has a compliance obligation — or a voluntary commitment.</p>
                <p>Our quality ratings use ICVCM Core Carbon Principles as the foundation, supplemented by independent co-benefit verification and permanence risk assessment. Every rating is explainable, auditable, and updated as project data changes.</p>
              </div>
            </div>
          </div>

          {/* Why MENA */}
          <div style={{ background: 'linear-gradient(135deg, #0C1C14, #1B3A2D)', borderRadius: '20px', padding: 'clamp(32px, 5vw, 48px)', marginBottom: '48px' }}>
            <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Why the UAE</span>
            <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#FFFCF6', marginTop: '8px', marginBottom: '20px' }}>The Gulf is ground zero for the compliance wave</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { stat: '50+', label: 'countries with carbon pricing mechanisms by 2026', detail: 'World Bank State and Trends of Carbon Pricing 2025' },
                { stat: 'COP28', label: 'hosted in the UAE — catalysed regional commitment', detail: 'UAE Net Zero 2050 strategy + Article 6.4 mechanism launched' },
                { stat: '$250B', label: 'projected VCM value by 2050', detail: 'McKinsey / TSVCM (Taskforce on Scaling VCMs)' },
              ].map(s => (
                <div key={s.stat}>
                  <div style={{ fontFamily: fr, fontSize: '36px', fontWeight: 700, color: '#C9A96E', marginBottom: '6px' }}>{s.stat}</div>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: '#FFFCF6', lineHeight: 1.5, marginBottom: '6px' }}>{s.label}</p>
                  <p style={{ fontFamily: bg, fontSize: '11px', color: '#8AAA92', fontStyle: 'italic' }}>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div style={{ marginBottom: '48px' }}>
            <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Leadership</span>
            <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginTop: '8px', marginBottom: '20px' }}>Built by operators, not academics</h2>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7, marginBottom: '28px', maxWidth: '600px' }}>
              CarbonBridge is founded by a team with decades of experience across technology, finance, and environmental markets in both Australia and the Gulf.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Gary C.', role: 'Founder & CEO', location: 'Dubai, UAE', desc: 'Technology finance and real estate operator. Built and scaled multiple SaaS platforms across ANZ and MENA. Leads Gulf relationships and investor conversations.' },
                { name: 'Alex A.', role: 'Co-founder & COO', location: 'Australia', desc: 'Environmental markets strategist. Leads Australian developer outreach, project sourcing, and supply-side partnerships.' },
                { name: 'Julian K.', role: 'Strategic Advisor', location: 'Global', desc: 'Co-architect of the CarbonBridge platform strategy. Deep expertise in carbon market regulation and product design.' },
              ].map(p => (
                <div key={p.role} style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <h3 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 700, color: '#1A1714', marginBottom: '2px' }}>{p.name} — {p.role}</h3>
                  <p style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', marginBottom: '12px' }}>{p.location}</p>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Principles</span>
            <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginTop: '8px', marginBottom: '20px' }}>What we believe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Integrity over volume', text: 'We would rather facilitate 10,000 high-quality tonnes than 1 million questionable ones. Our quality ratings exist because not all carbon credits are equal — and pretending they are damages the entire market.' },
                { title: 'Transparency by default', text: 'Every credit on our platform has a full methodology reference, verification body, vintage, and quality breakdown. No black boxes, no "proprietary methodology" hand-waving.' },
                { title: 'Insurance is not optional', text: 'We pioneered integrated credit insurance at checkout because we believe buyers shouldn\'t need to be carbon market experts to protect their investment. Coverage is optional for the buyer — but its availability is not optional for us.' },
                { title: 'The compliance wave is an opportunity', text: 'NRCC, CORSIA, CBAM, and VCMI are not burdens — they are the catalysts that will scale carbon markets from $1.7B to $250B. CarbonBridge is built for this future.' },
              ].map(v => (
                <div key={v.title} style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>{v.title}</h3>
                  <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.7 }}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center" style={{ marginTop: '64px', padding: '48px', background: 'linear-gradient(135deg, #0C1C14, #1B3A2D)', borderRadius: '20px' }}>
            <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#FFFCF6', marginBottom: '12px' }}>Ready to participate?</h2>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', marginBottom: '24px' }}>Whether you&apos;re buying for compliance or listing credits for sale — CarbonBridge is open.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/register" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px' }}>Create free account</Link>
              <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: '#FFFCF6', border: '1px solid rgba(255,252,246,0.15)', padding: '13px 28px', borderRadius: '10px' }}>Browse marketplace</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
