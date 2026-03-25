'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LISTINGS, CREDIT_TYPE_COLORS, type CreditListing } from '@/data/credits';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

const SDG_NAMES: Record<number, string> = {
  1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health', 5: 'Gender Equality',
  6: 'Clean Water', 7: 'Affordable Energy', 8: 'Decent Work', 9: 'Industry & Innovation',
  10: 'Reduced Inequalities', 11: 'Sustainable Cities', 12: 'Responsible Consumption',
  13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
};

const SDG_COLORS: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 5: '#FF3A21', 6: '#26BDE2',
  7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367', 11: '#FD9D24',
  12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
};

export default function CreditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const credit = LISTINGS.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'methodology' | 'cobenefits' | 'developer' | 'insurance'>('overview');
  const [quantity, setQuantity] = useState('');

  const similar = useMemo(() => {
    if (!credit) return [];
    return LISTINGS.filter(c => c.id !== credit.id && (c.creditType === credit.creditType || c.region === credit.region))
      .sort((a, b) => Math.abs(a.price - credit.price) - Math.abs(b.price - credit.price))
      .slice(0, 4);
  }, [credit]);

  if (!credit) {
    return (
      <main style={{ background: '#FDFBF7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#1A1714', marginBottom: '12px' }}>Credit not found</h1>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', color: '#C9A96E', fontWeight: 600 }}>← Back to marketplace</Link>
        </div>
      </main>
    );
  }

  const ratingColor = credit.qualityRating.startsWith('A') ? '#2D6A4F' : credit.qualityRating === 'BBB' ? '#7B5B3A' : '#8B8178';
  const qtyNum = parseInt(quantity) || 0;
  const totalCost = qtyNum * credit.price;
  const insuranceCost = totalCost * 0.04;

  const tabs = [
    { key: 'overview' as const, label: 'Project Overview' },
    { key: 'methodology' as const, label: 'Methodology & Verification' },
    { key: 'cobenefits' as const, label: 'Co-benefits & SDGs' },
    { key: 'developer' as const, label: 'Developer' },
    { key: 'insurance' as const, label: 'Insurance Options' },
  ];

  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(12,28,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-white.png" alt="CarbonBridge" style={{ height: "28px", width: "auto" }} />
            
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', color: 'rgba(255,252,246,0.5)' }} className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/register" style={{ fontFamily: bg, fontSize: '13px', background: '#C9A96E', color: '#0C1C14', padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }} className="hover:brightness-110 transition-all">Create Account</Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Breadcrumb */}
        <div style={{ background: '#F5F0E8', borderBottom: '1px solid #E8E2D6', padding: '12px 0' }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-2" style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>
              <Link href="/marketplace" className="hover:text-[#1B3A2D] transition-colors">Marketplace</Link>
              <span>›</span>
              <span style={{ color: '#1A1714' }}>{credit.projectName}</span>
            </div>
          </div>
        </div>

        {/* ═══ TOP SECTION ═══ */}
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Project info (2/3) */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: 'white', background: CREDIT_TYPE_COLORS[credit.creditType], padding: '4px 12px', borderRadius: '6px' }}>{credit.creditType}</span>
                {credit.ccpLabelled && <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#C9A96E', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', padding: '3px 10px', borderRadius: '6px' }}>CCP Labelled</span>}
                {credit.isCBDirect && <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#1B3A2D', background: 'rgba(27,58,45,0.08)', border: '1px solid rgba(27,58,45,0.15)', padding: '3px 10px', borderRadius: '6px' }}>CarbonBridge Direct</span>}
              </div>

              {/* Project name */}
              <h1 style={{ fontFamily: fr, fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: '#1A1714', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '6px' }}>
                {credit.projectName}
              </h1>

              {/* Developer */}
              <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', marginBottom: '20px' }}>
                by <span style={{ color: '#1B3A2D', fontWeight: 600 }}>{credit.developer}</span> · {credit.location}
              </p>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6" style={{ fontFamily: bg, fontSize: '13px' }}>
                {[
                  { label: 'Vintage', value: String(credit.vintage) },
                  { label: 'Volume', value: `${credit.volumeAvailable.toLocaleString()} tCO₂e` },
                  { label: 'Registry', value: credit.registry },
                  { label: 'Methodology', value: credit.methodology },
                ].map(s => (
                  <div key={s.label}>
                    <span style={{ color: '#B0A99A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>{s.label}</span>
                    <span style={{ color: '#1A1714', fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Compliance eligibility */}
              {credit.compliance.length > 0 && (
                <div className="mb-6">
                  <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Compliance Eligibility</span>
                  <div className="flex flex-wrap gap-2">
                    {credit.compliance.map(c => (
                      <span key={c} style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', border: '1px solid rgba(27,58,45,0.12)', padding: '5px 14px', borderRadius: '8px' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality rating breakdown */}
              <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '20px', marginBottom: '8px' }}>
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quality Assessment</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: ratingColor }}>{credit.qualityRating}</span>
                    <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>rating</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Additionality', score: credit.qualityBreakdown.additionality },
                    { label: 'Permanence', score: credit.qualityBreakdown.permanence },
                    { label: 'Leakage Risk', score: credit.qualityBreakdown.leakageRisk },
                    { label: 'Co-benefit', score: credit.qualityBreakdown.coBenefitScore },
                    { label: 'Methodology', score: credit.qualityBreakdown.methodologyIntegrity },
                  ].map(q => (
                    <div key={q.label} className="text-center">
                      <div style={{ fontFamily: mono, fontSize: '18px', fontWeight: 700, color: q.score >= 85 ? '#2D6A4F' : q.score >= 70 ? '#7B5B3A' : '#8B8178' }}>{q.score}</div>
                      <div style={{ fontFamily: bg, fontSize: '10px', color: '#B0A99A', marginTop: '2px' }}>{q.label}</div>
                      <div style={{ width: '100%', height: '3px', background: '#F0EBE3', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${q.score}%`, height: '100%', background: q.score >= 85 ? '#2D6A4F' : q.score >= 70 ? '#C9A96E' : '#B0A99A', borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Purchase card (1/3) */}
            <div className="lg:col-span-1">
              <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '16px', padding: '28px', position: 'sticky', top: '88px' }}>
                {/* Price */}
                <div className="mb-5">
                  <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price per tCO₂e</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span style={{ fontFamily: fr, fontSize: '36px', fontWeight: 700, color: '#1A1714', letterSpacing: '-0.02em', fontFeatureSettings: "'tnum'" }}>${credit.price.toFixed(2)}</span>
                    {credit.priceNegotiable && <span style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', fontWeight: 600 }}>Negotiable</span>}
                  </div>
                </div>

                {/* Quantity input */}
                <div className="mb-4">
                  <label style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quantity (tCO₂e)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min={100}
                    max={credit.volumeAvailable}
                    placeholder="Min 100"
                    style={{ fontFamily: mono, fontSize: '14px', width: '100%', padding: '12px 14px', border: '1px solid #E8E2D6', borderRadius: '10px', background: '#FDFBF7', color: '#1A1714', outline: 'none' }}
                  />
                  <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '4px', display: 'block' }}>{credit.volumeAvailable.toLocaleString()} available</span>
                </div>

                {/* Cost summary */}
                {qtyNum >= 100 && (
                  <div style={{ background: '#F5F0E8', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                    <div className="flex justify-between mb-2" style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714' }}>
                      <span>{qtyNum.toLocaleString()} × ${credit.price.toFixed(2)}</span>
                      <span style={{ fontFamily: mono, fontWeight: 600 }}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>
                      <span>Credit guarantee (optional, ~4%)</span>
                      <span style={{ fontFamily: mono }}>+${insuranceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {qtyNum >= 10000 && (
                      <p style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', marginTop: '8px', fontWeight: 600 }}>
                        Volume over 10,000 tCO₂e — preferred pricing available via RFQ.
                      </p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <Link href={qtyNum >= 100 ? `/checkout?credit=${credit.id}&qty=${qtyNum}` : '#'} style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', display: 'block', textAlign: 'center', padding: '14px', borderRadius: '10px', marginBottom: '8px', opacity: qtyNum >= 100 ? 1 : 0.4, pointerEvents: qtyNum >= 100 ? 'auto' : 'none' }} className="hover:brightness-110 transition-all">
                  Purchase
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', border: '1px solid rgba(27,58,45,0.12)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                    + Compare
                  </button>
                  <button style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', border: '1px solid rgba(27,58,45,0.12)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                    ♡ Watchlist
                  </button>
                </div>
                <Link href={`/contact?subject=RFQ: ${credit.projectName}`} style={{ fontFamily: bg, fontSize: '12px', color: '#C9A96E', fontWeight: 600, display: 'block', textAlign: 'center', marginTop: '12px' }}>
                  Request quote for large volumes →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TABS SECTION ═══ */}
        <div style={{ borderTop: '1px solid #E8E2D6', background: 'white' }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            {/* Tab bar */}
            <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: '1px solid #E8E2D6' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  fontFamily: bg, fontSize: '13px', fontWeight: activeTab === t.key ? 700 : 500,
                  color: activeTab === t.key ? '#1B3A2D' : '#8B8178',
                  padding: '16px 20px', borderBottom: activeTab === t.key ? '2px solid #1B3A2D' : '2px solid transparent',
                  cursor: 'pointer', background: 'transparent', whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '32px 0 48px' }}>
              {activeTab === 'overview' && (
                <div className="max-w-3xl">
                  <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>About this project</h2>
                  <div style={{ fontFamily: bg, fontSize: '14.5px', color: '#3D3830', lineHeight: 1.8 }}>
                    {credit.projectOverview.split('. ').reduce((acc: string[][], sentence, i) => {
                      const pIdx = Math.floor(i / 3);
                      if (!acc[pIdx]) acc[pIdx] = [];
                      acc[pIdx].push(sentence);
                      return acc;
                    }, []).map((para, i) => (
                      <p key={i} style={{ marginBottom: '16px' }}>{para.join('. ')}{!para[para.length-1].endsWith('.') ? '.' : ''}</p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'methodology' && (
                <div className="max-w-3xl">
                  <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Methodology & Verification</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                      { label: 'Registry', value: credit.registry },
                      { label: 'Methodology', value: credit.methodology },
                      { label: 'Validation & Verification Body', value: credit.verificationBody },
                      { label: 'Validated', value: new Date(credit.validatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: 'Last Verified', value: new Date(credit.lastVerified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: 'Total Volume Issued', value: `${credit.volumeTotal.toLocaleString()} tCO₂e` },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '10px', padding: '16px' }}>
                        <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>{item.label}</span>
                        <span style={{ fontFamily: bg, fontSize: '14px', color: '#1A1714', fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '20px' }}>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.7 }}>
                      Documentation available upon request: Validation Report, Monitoring Report, Verification Report, Project Design Document (PDD). 
                      Contact <span style={{ color: '#C9A96E', fontWeight: 600 }}>team@carbonbridge.ae</span> for access.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'cobenefits' && (
                <div className="max-w-3xl">
                  <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Co-benefits & Sustainable Development Goals</h2>
                  
                  {credit.coBenefits.length > 0 && (
                    <div className="mb-8">
                      <h3 style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Verified Co-benefits</h3>
                      <div className="flex flex-wrap gap-3">
                        {credit.coBenefits.map(b => (
                          <div key={b} style={{ background: 'rgba(27,58,45,0.04)', border: '1px solid rgba(27,58,45,0.1)', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>
                              {b === 'Biodiversity' ? '🌿' : b === 'Community' ? '👥' : b === 'Water' ? '💧' : b === 'Gender' ? '♀' : '🏛'}
                            </span>
                            <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1B3A2D' }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <h3 style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>UN Sustainable Development Goals</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {credit.sdgs.map(sdg => (
                      <div key={sdg} style={{ background: SDG_COLORS[sdg] || '#666', borderRadius: '10px', padding: '14px', color: 'white' }}>
                        <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>SDG {sdg}</div>
                        <div style={{ fontFamily: bg, fontSize: '12px', opacity: 0.9 }}>{SDG_NAMES[sdg] || `Goal ${sdg}`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'developer' && (
                <div className="max-w-3xl">
                  <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Developer Profile</h2>
                  <div style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '28px' }}>
                    <h3 style={{ fontFamily: bg, fontSize: '20px', fontWeight: 700, color: '#1A1714', marginBottom: '4px' }}>{credit.developer}</h3>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '20px' }}>{credit.location}</p>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center" style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1B3A2D' }}>{credit.developerYears}</div>
                        <div style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>Years operating</div>
                      </div>
                      <div className="text-center" style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1B3A2D' }}>{credit.developerProjects}</div>
                        <div style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>Projects registered</div>
                      </div>
                      <div className="text-center" style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontFamily: fr, fontSize: '28px', fontWeight: 700, color: '#1B3A2D' }}>{credit.registry}</div>
                        <div style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>Primary registry</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="max-w-3xl">
                  <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Credit Insurance & Guarantees</h2>
                  <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', marginBottom: '24px' }}>Protect your carbon credit investment against delivery, invalidation, and political risks.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                      { name: 'Non-Delivery Protection', desc: 'Guarantees credit delivery to your registry account. If the seller fails to transfer credits within the agreed timeframe, you receive a full refund.', rate: '2-3%', provider: 'Kita' },
                      { name: 'Invalidation Cover', desc: 'Protects against post-issuance credit invalidation by the registry. If credits are revoked due to methodological re-assessment, you are made whole.', rate: '3-5%', provider: "Lloyd's Syndicate" },
                      { name: 'Political Risk', desc: 'Covers sovereign-level risks: government policy changes, export bans, or retroactive regulation that renders your credits non-compliant.', rate: '1-2%', provider: "Lloyd's Syndicate" },
                      { name: 'Buffer Pool Shortfall', desc: 'For REDD+ credits with buffer pool allocations — covers the scenario where the project\'s buffer pool is insufficient to cover reversals.', rate: '2-4%', provider: 'Kita' },
                    ].map(ins => (
                      <div key={ins.name} style={{ background: '#FDFBF7', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '20px' }}>
                        <h4 style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714', marginBottom: '6px' }}>{ins.name}</h4>
                        <p style={{ fontFamily: bg, fontSize: '12.5px', color: '#8B8178', lineHeight: 1.6, marginBottom: '12px' }}>{ins.desc}</p>
                        <div className="flex items-center justify-between">
                          <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#C9A96E' }}>{ins.rate} of purchase</span>
                          <span style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A' }}>{ins.provider}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '12px', padding: '18px' }}>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', lineHeight: 1.6 }}>
                      Insurance products are available at checkout. Coverage is optional and never pre-selected. Full terms and conditions provided before purchase confirmation. 
                      Insurance facilitated through CarbonBridge&apos;s partnerships with <strong style={{ color: '#1A1714' }}>Kita</strong> (carbon-specific guarantee products) and <strong style={{ color: '#1A1714' }}>Lloyd&apos;s of London</strong> syndicates (political and invalidation risk).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ PRICE HISTORY ═══ */}
        <div style={{ background: '#FDFBF7', borderTop: '1px solid #E8E2D6', padding: '48px 0' }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Price History</h2>
            <div style={{ background: 'white', border: '1px solid #E8E2D6', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '140px' }}>
                {credit.priceHistory.map((p, i) => {
                  const min = Math.min(...credit.priceHistory.map(h => h.price));
                  const max = Math.max(...credit.priceHistory.map(h => h.price));
                  const range = max - min || 1;
                  const height = 30 + ((p.price - min) / range) * 100;
                  const isLast = i === credit.priceHistory.length - 1;
                  return (
                    <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                      <span style={{ fontFamily: mono, fontSize: '10px', color: isLast ? '#1B3A2D' : '#B0A99A', fontWeight: isLast ? 700 : 400 }}>${p.price.toFixed(2)}</span>
                      <div style={{ width: '100%', maxWidth: '48px', height: `${height}px`, background: isLast ? '#1B3A2D' : '#E8E2D6', borderRadius: '4px 4px 0 0', transition: 'background 0.2s' }} />
                      <span style={{ fontFamily: bg, fontSize: '9px', color: '#B0A99A' }}>{p.month.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '12px', fontStyle: 'italic' }}>
                Indicative benchmark prices for {credit.creditType} credits in {credit.region}. Source: Ecosystem Marketplace, ACX.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ SIMILAR CREDITS ═══ */}
        {similar.length > 0 && (
          <div style={{ background: 'white', borderTop: '1px solid #E8E2D6', padding: '48px 0' }}>
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
              <h2 style={{ fontFamily: fr, fontSize: '22px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>You might also consider</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similar.map(c => (
                  <Link key={c.id} href={`/credits/${c.id}`}>
                    <div style={{ border: '1px solid #E8E2D6', borderRadius: '12px', padding: '18px', cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}
                      className="hover:shadow-md hover:border-[#C9A96E40]">
                      <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: 'white', background: CREDIT_TYPE_COLORS[c.creditType], padding: '2px 8px', borderRadius: '4px' }}>{c.creditType}</span>
                      <h4 style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#1A1714', marginTop: '8px', marginBottom: '4px', lineHeight: 1.3 }}>{c.projectName}</h4>
                      <p style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', marginBottom: '8px' }}>{c.location}</p>
                      <div className="flex items-baseline justify-between">
                        <span style={{ fontFamily: fr, fontSize: '20px', fontWeight: 700, color: '#1A1714' }}>${c.price.toFixed(2)}</span>
                        <span style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: ratingColor }}>{c.qualityRating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
