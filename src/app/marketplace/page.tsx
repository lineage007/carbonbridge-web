'use client';


import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { LISTINGS, CREDIT_TYPE_COLORS, type CreditListing, type CreditType, type QualityRating, type Region, type ComplianceTag, type CoBenefit, type Registry } from '@/data/credits';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Courier New', monospace";

// ─── Filter Options ────────────────────────────────────────
const CREDIT_TYPES: CreditType[] = ['ARR', 'Blue Carbon', 'REDD+', 'Biochar', 'Soil Carbon', 'Savanna', 'Landfill Gas', 'Energy Efficiency', 'IFM'];
const QUALITY_RATINGS: QualityRating[] = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'C'];
const REGISTRIES: Registry[] = ['Verra VCS', 'Gold Standard', 'ACR'];
const REGIONS: Region[] = ['Australia', 'UAE', 'Southeast Asia', 'Latin America', 'Africa', 'India', 'Europe', 'North America'];
const COMPLIANCE_TAGS: ComplianceTag[] = ['CORSIA', 'NRCC', 'CBAM', 'SBTi BVCM', 'VCMI'];
const CO_BENEFITS: CoBenefit[] = ['Biodiversity', 'Community', 'Water', 'Gender', 'Indigenous'];
const VINTAGES = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'quality', label: 'Quality: Highest' },
  { value: 'newest', label: 'Newest Listings' },
  { value: 'volume', label: 'Volume: Largest' },
];

type SortKey = typeof SORT_OPTIONS[number]['value'];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('quality');
  const [selectedTypes, setSelectedTypes] = useState<Set<CreditType>>(new Set());
  const [selectedRatings, setSelectedRatings] = useState<Set<QualityRating>>(new Set());
  const [selectedRegistries, setSelectedRegistries] = useState<Set<Registry>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<Region>>(new Set());
  const [selectedCompliance, setSelectedCompliance] = useState<Set<ComplianceTag>>(new Set());
  const [selectedCoBenefits, setSelectedCoBenefits] = useState<Set<CoBenefit>>(new Set());
  const [selectedVintages, setSelectedVintages] = useState<Set<number>>(new Set());
  const [ccpOnly, setCcpOnly] = useState(false);
  const [sellerFilter, setSellerFilter] = useState<'all' | 'cb-direct' | 'cb-sourced' | 'third-party'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [showFilters, setShowFilters] = useState(false);

  const toggle = <T,>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const filtered = useMemo(() => {
    let result = LISTINGS.filter(c => c.status === 'active');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.projectName.toLowerCase().includes(q) ||
        c.developer.toLowerCase().includes(q) ||
        c.methodology.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.creditType.toLowerCase().includes(q)
      );
    }

    if (selectedTypes.size > 0) result = result.filter(c => selectedTypes.has(c.creditType));
    if (selectedRatings.size > 0) result = result.filter(c => selectedRatings.has(c.qualityRating));
    if (selectedRegistries.size > 0) result = result.filter(c => selectedRegistries.has(c.registry));
    if (selectedRegions.size > 0) result = result.filter(c => selectedRegions.has(c.region));
    if (selectedCompliance.size > 0) result = result.filter(c => c.compliance.some(t => selectedCompliance.has(t)));
    if (selectedCoBenefits.size > 0) result = result.filter(c => c.coBenefits.some(b => selectedCoBenefits.has(b)));
    if (selectedVintages.size > 0) result = result.filter(c => selectedVintages.has(c.vintage));
    if (ccpOnly) result = result.filter(c => c.ccpLabelled);
    if (sellerFilter === 'cb-direct') result = result.filter(c => c.isCBDirect);
    if (sellerFilter === 'cb-sourced') result = result.filter(c => !c.isCBDirect && (c as any).isCBSourced);
    if (sellerFilter === 'third-party') result = result.filter(c => !c.isCBDirect && !(c as any).isCBSourced);
    result = result.filter(c => c.price >= priceRange[0] && c.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'quality': result.sort((a, b) => QUALITY_RATINGS.indexOf(a.qualityRating) - QUALITY_RATINGS.indexOf(b.qualityRating)); break;
      case 'newest': result.sort((a, b) => b.vintage - a.vintage); break;
      case 'volume': result.sort((a, b) => b.volumeAvailable - a.volumeAvailable); break;
    }

    return result;
  }, [search, sortBy, selectedTypes, selectedRatings, selectedRegistries, selectedRegions, selectedCompliance, selectedCoBenefits, selectedVintages, ccpOnly, sellerFilter, priceRange]);

  const activeFilterCount = [selectedTypes, selectedRatings, selectedRegistries, selectedRegions, selectedCompliance, selectedCoBenefits, selectedVintages].reduce((n, s) => n + s.size, 0) + (ccpOnly ? 1 : 0) + (sellerFilter !== 'all' ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0);

  const clearAll = () => {
    setSelectedTypes(new Set()); setSelectedRatings(new Set()); setSelectedRegistries(new Set());
    setSelectedRegions(new Set()); setSelectedCompliance(new Set()); setSelectedCoBenefits(new Set());
    setSelectedVintages(new Set()); setCcpOnly(false); setSellerFilter('all'); setPriceRange([0, 200]); setSearch('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate)' }}>
      <Navbar dark={true} />
      <main>

      <div>
        {/* Header */}
        <div style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D)', padding: '48px 0 40px', borderBottom: '1px solid rgba(74,139,100,0.1)' }}>
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <h1 style={{ fontFamily: fr, fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: '#FFFCF6', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Carbon Credit Marketplace
            </h1>
            <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', marginBottom: '24px' }}>
              {filtered.length} verified credit{filtered.length !== 1 ? 's' : ''} available · Browse, compare, and purchase with institutional-grade settlement
            </p>

            {/* Search bar */}
            <div className="flex gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8AAA92" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects, developers, methodologies, locations..."
                  style={{ fontFamily: bg, fontSize: '14px', width: '100%', padding: '12px 12px 12px 42px', background: 'rgba(255,252,246,0.06)', border: '1px solid rgba(255,252,246,0.1)', borderRadius: '10px', color: '#FFFCF6', outline: 'none' }}
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#4A8B64', background: 'rgba(74,139,100,0.1)', border: '1px solid rgba(74,139,100,0.2)', padding: '12px 18px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar filters — desktop always, mobile toggle */}
            <aside className={`w-[280px] shrink-0 ${showFilters ? 'block fixed inset-0 z-40 p-6 overflow-y-auto' : 'hidden'} lg:block lg:static lg:bg-transparent lg:p-0`} style={showFilters ? { background: 'var(--canvas)' } : {}}>
              {showFilters && (
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <span style={{ fontFamily: bg, fontSize: '16px', fontWeight: 700 }}>Filters</span>
                  <button onClick={() => setShowFilters(false)} style={{ fontFamily: bg, fontSize: '13px', color: '#666' }}>✕ Close</button>
                </div>
              )}

              <div className="flex items-center justify-between mb-5">
                <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Filters</span>
                {activeFilterCount > 0 && <button onClick={clearAll} style={{ fontFamily: mono, fontSize: '10px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.04em' }}>Clear all ({activeFilterCount})</button>}
              </div>

              {/* Sort */}
              <FilterSection title="Sort by">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} style={{ fontFamily: bg, fontSize: '13px', width: '100%', padding: '8px 10px', border: '1px solid #E8E2D6', borderRadius: '8px', background: 'white', color: '#1A1714' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FilterSection>

              {/* Credit Type */}
              <FilterSection title="Credit Type">
                <div className="flex flex-wrap gap-1.5">
                  {CREDIT_TYPES.map(t => (
                    <FilterPill key={t} label={t} active={selectedTypes.has(t)} onClick={() => toggle(selectedTypes, t, setSelectedTypes)} color={CREDIT_TYPE_COLORS[t]} />
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title={`Price: $${priceRange[0]} – $${priceRange[1] >= 200 ? '200+' : priceRange[1]}`}>
                <input type="range" min={0} max={200} step={5} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} style={{ width: '100%', accentColor: '#4A8B64' }} />
              </FilterSection>

              {/* Quality Rating */}
              <FilterSection title="Quality Rating">
                <div className="flex flex-wrap gap-1.5">
                  {QUALITY_RATINGS.map(r => <FilterPill key={r} label={r} active={selectedRatings.has(r)} onClick={() => toggle(selectedRatings, r, setSelectedRatings)} />)}
                </div>
              </FilterSection>

              {/* Vintage */}
              <FilterSection title="Vintage">
                <div className="flex flex-wrap gap-1.5">
                  {VINTAGES.map(v => <FilterPill key={v} label={String(v)} active={selectedVintages.has(v)} onClick={() => toggle(selectedVintages, v, setSelectedVintages)} />)}
                </div>
              </FilterSection>

              {/* Registry */}
              <FilterSection title="Registry">
                <div className="flex flex-wrap gap-1.5">
                  {REGISTRIES.map(r => <FilterPill key={r} label={r} active={selectedRegistries.has(r)} onClick={() => toggle(selectedRegistries, r, setSelectedRegistries)} />)}
                </div>
              </FilterSection>

              {/* Geography */}
              <FilterSection title="Geography">
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map(r => <FilterPill key={r} label={r} active={selectedRegions.has(r)} onClick={() => toggle(selectedRegions, r, setSelectedRegions)} />)}
                </div>
              </FilterSection>

              {/* Compliance Eligibility */}
              <FilterSection title="Compliance Eligibility">
                <div className="flex flex-wrap gap-1.5">
                  {COMPLIANCE_TAGS.map(t => <FilterPill key={t} label={t} active={selectedCompliance.has(t)} onClick={() => toggle(selectedCompliance, t, setSelectedCompliance)} />)}
                </div>
              </FilterSection>

              {/* Co-benefits */}
              <FilterSection title="Co-benefits">
                <div className="flex flex-wrap gap-1.5">
                  {CO_BENEFITS.map(b => <FilterPill key={b} label={b} active={selectedCoBenefits.has(b)} onClick={() => toggle(selectedCoBenefits, b, setSelectedCoBenefits)} />)}
                </div>
              </FilterSection>

              {/* CCP Labelled */}
              <FilterSection title="CCP Labelled">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={ccpOnly} onChange={() => setCcpOnly(!ccpOnly)} style={{ accentColor: '#4A8B64' }} />
                  <span style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714' }}>ICVCM Core Carbon Principles only</span>
                </label>
              </FilterSection>

              {/* Seller */}
              <FilterSection title="Seller">
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'cb-direct', 'cb-sourced', 'third-party'] as const).map(s => (
                    <FilterPill key={s} label={s === 'all' ? 'All' : s === 'cb-direct' ? 'CB Direct' : s === 'cb-sourced' ? 'CB Sourced' : 'Third-party'} active={sellerFilter === s} onClick={() => setSellerFilter(s)} />
                  ))}
                </div>
              </FilterSection>
            </aside>

            {/* Credit grid */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p style={{ fontFamily: bg, fontSize: '16px', color: '#8B8178', marginBottom: '8px' }}>No credits match your filters.</p>
                  <button onClick={clearAll} style={{ fontFamily: bg, fontSize: '14px', color: '#4A8B64', fontWeight: 600 }}>Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(credit => (
                    <CreditCard key={credit.id} credit={credit} />
                  ))}
                </div>
              )}

              <p style={{ fontFamily: bg, fontSize: '11px', color: '#B0A99A', marginTop: '24px', fontStyle: 'italic' }}>
                Prices are indicative benchmarks. Actual transaction prices confirmed at settlement. CarbonBridge quality ratings are proprietary assessments based on ICVCM CCP criteria.
              </p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

// ─── Components ────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'var(--sage)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  );
}

function FilterPill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: mono,
        fontSize: '11px',
        fontWeight: active ? 600 : 400,
        color: active ? (color || 'var(--forest)') : 'var(--ink-muted)',
        background: active ? (color ? `${color}12` : 'rgba(27,58,45,0.07)') : 'transparent',
        border: `1px solid ${active ? (color || 'rgba(27,58,45,0.3)') : 'var(--border-light)'}`,
        padding: '4px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  );
}

function CreditCard({ credit }: { credit: CreditListing }) {
  const ratingColor = credit.qualityRating.startsWith('A') ? 'var(--forest)' : credit.qualityRating === 'BBB' ? 'var(--gold)' : 'var(--ink-muted)';

  return (
    <Link href={`/credits/${credit.id}`}>
      <div
        className="group"
        style={{
          background: 'var(--canvas)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '18px 20px',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(60,122,85,0.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
      >
        {/* Top row: type badge + status badges */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'white', background: CREDIT_TYPE_COLORS[credit.creditType], padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {credit.creditType}
          </span>
          <div className="flex items-center gap-1.5">
            {credit.ccpLabelled && <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'var(--gold)', background: 'rgba(60,122,85,0.1)', border: '1px solid rgba(60,122,85,0.2)', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.04em' }}>CCP</span>}
            {credit.isCBDirect && <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'var(--forest)', background: 'rgba(27,58,45,0.07)', border: '1px solid rgba(27,58,45,0.15)', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.04em' }}>Direct</span>}
            {!credit.isCBDirect && (credit as any).isCBSourced && <span style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'var(--gold)', border: '1px solid rgba(60,122,85,0.4)', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.04em' }}>Sourced</span>}
          </div>
        </div>

        {/* Project name + location */}
        <h3 style={{ fontFamily: bg, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.35, marginBottom: '3px', minHeight: '36px' }}>
          {credit.projectName}
        </h3>
        <p style={{ fontFamily: mono, fontSize: '10px', color: 'var(--sage)', marginBottom: '14px', letterSpacing: '0.02em' }}>
          {credit.location}
        </p>

        {/* Price + Rating row */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', transition: 'color 0.15s' }} className="group-hover:text-[#3C7A55]">
              ${credit.price.toFixed(2)}
            </span>
            <span style={{ fontFamily: mono, fontSize: '10px', color: 'var(--sage)', marginLeft: '3px' }}>/tCO₂e</span>
            {credit.priceNegotiable && <span style={{ fontFamily: mono, fontSize: '9px', color: 'var(--gold)', display: 'block', marginTop: '1px', letterSpacing: '0.04em' }}>vol. negotiable</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: mono, fontSize: '16px', fontWeight: 700, color: ratingColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{credit.qualityRating}</span>
            <span style={{ fontFamily: mono, fontSize: '8px', color: 'var(--sage)', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quality</span>
          </div>
        </div>

        {/* Metadata */}
        <div style={{ fontFamily: mono, fontSize: '10px', color: 'var(--sage)', display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', letterSpacing: '0.02em' }}>
          <span>{credit.vintage}</span>
          <span>·</span>
          <span>{credit.registry}</span>
          <span>·</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{credit.methodology}</span>
        </div>

        {/* Volume */}
        <div style={{ fontFamily: mono, fontSize: '10px', color: 'var(--ink)', marginBottom: '10px', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontWeight: 600 }}>{credit.volumeAvailable.toLocaleString()}</span>
          <span style={{ color: 'var(--sage)' }}> tCO₂e available</span>
        </div>

        {/* Compliance tags */}
        {credit.compliance.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
            {credit.compliance.map(c => (
              <span key={c} style={{ fontFamily: mono, fontSize: '9px', fontWeight: 600, color: 'var(--forest)', background: 'rgba(27,58,45,0.05)', border: '1px solid rgba(27,58,45,0.1)', padding: '1px 7px', borderRadius: '3px', letterSpacing: '0.04em' }}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
