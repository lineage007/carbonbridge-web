'use client';


import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { LISTINGS, CREDIT_TYPE_COLORS, type CreditListing, type CreditType, type QualityRating, type Region, type ComplianceTag, type CoBenefit, type Registry } from '@/data/credits';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

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
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar dark={true} />
      <main>

      <div>
        {/* Header */}
        <div style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D)', padding: '48px 0 40px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
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
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#C9A96E', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', padding: '12px 18px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar filters — desktop always, mobile toggle */}
            <aside className={`w-[280px] shrink-0 ${showFilters ? 'block fixed inset-0 z-40 bg-white p-6 overflow-y-auto' : 'hidden'} lg:block lg:static lg:bg-transparent lg:p-0`}>
              {showFilters && (
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <span style={{ fontFamily: bg, fontSize: '16px', fontWeight: 700 }}>Filters</span>
                  <button onClick={() => setShowFilters(false)} style={{ fontFamily: bg, fontSize: '13px', color: '#666' }}>✕ Close</button>
                </div>
              )}

              <div className="flex items-center justify-between mb-5">
                <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 700, color: '#1A1714', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Filters</span>
                {activeFilterCount > 0 && <button onClick={clearAll} style={{ fontFamily: bg, fontSize: '11px', color: '#C9A96E', fontWeight: 600 }}>Clear all ({activeFilterCount})</button>}
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
                <input type="range" min={0} max={200} step={5} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} style={{ width: '100%', accentColor: '#C9A96E' }} />
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
                  <input type="checkbox" checked={ccpOnly} onChange={() => setCcpOnly(!ccpOnly)} style={{ accentColor: '#C9A96E' }} />
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
                  <button onClick={clearAll} style={{ fontFamily: bg, fontSize: '14px', color: '#C9A96E', fontWeight: 600 }}>Clear all filters</button>
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
    <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E8E2D6' }}>
      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '11px', fontWeight: 700, color: '#8B8178', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  );
}

function FilterPill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui",
        fontSize: '12px',
        fontWeight: active ? 700 : 500,
        color: active ? (color || '#1B3A2D') : '#8B8178',
        background: active ? (color ? `${color}15` : 'rgba(27,58,45,0.08)') : 'transparent',
        border: `1px solid ${active ? (color || '#1B3A2D') : '#E8E2D6'}`,
        padding: '5px 12px',
        borderRadius: '100px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function CreditCard({ credit }: { credit: CreditListing }) {
  const ratingColor = credit.qualityRating.startsWith('A') ? '#2D6A4F' : credit.qualityRating === 'BBB' ? '#7B5B3A' : '#8B8178';

  return (
    <Link href={`/credits/${credit.id}`}>
      <div
        className="group"
        style={{
          background: 'white',
          border: '1px solid #E8E2D6',
          borderRadius: '14px',
          padding: '22px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(27,58,45,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E8E2D6'; e.currentTarget.style.transform = 'none'; }}
      >
        {/* Top row: type badge + CB Direct */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '10px', fontWeight: 700, color: 'white', background: CREDIT_TYPE_COLORS[credit.creditType], padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.03em' }}>
            {credit.creditType}
          </span>
          <div className="flex items-center gap-2">
            {credit.ccpLabelled && <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '9px', fontWeight: 700, color: '#C9A96E', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', padding: '2px 7px', borderRadius: '4px' }}>CCP</span>}
            {credit.isCBDirect && <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '9px', fontWeight: 700, color: '#1B3A2D', background: 'rgba(27,58,45,0.08)', border: '1px solid rgba(27,58,45,0.15)', padding: '2px 7px', borderRadius: '4px' }}>CB Direct</span>}
            {!credit.isCBDirect && (credit as any).isCBSourced && <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '9px', fontWeight: 700, color: '#C9A96E', background: 'transparent', border: '1px solid #C9A96E', padding: '2px 7px', borderRadius: '4px' }}>CB Sourced</span>}
          </div>
        </div>

        {/* Project name + location */}
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '14px', fontWeight: 700, color: '#1A1714', lineHeight: 1.35, marginBottom: '3px', minHeight: '38px' }}>
          {credit.projectName}
        </h3>
        <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '11.5px', color: '#8B8178', marginBottom: '14px' }}>
          {credit.location}
        </p>

        {/* Price + Rating row */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span style={{ fontFamily: fr, fontSize: '26px', fontWeight: 700, color: '#1A1714', letterSpacing: '-0.02em', fontFeatureSettings: "'tnum'", transition: 'color 0.2s' }} className="group-hover:text-[#C9A96E]">
              ${credit.price.toFixed(2)}
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '11px', color: '#8B8178', marginLeft: '3px' }}>/tCO₂e</span>
            {credit.priceNegotiable && <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '10px', color: '#C9A96E', display: 'block', marginTop: '1px' }}>Negotiable for volume</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: fr, fontSize: '20px', fontWeight: 700, color: ratingColor, lineHeight: 1 }}>{credit.qualityRating}</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '9px', color: '#B0A99A', marginTop: '2px' }}>Quality</span>
          </div>
        </div>

        {/* Metadata */}
        <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '11px', color: '#8B8178', display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span>{credit.vintage}</span>
          <span>·</span>
          <span>{credit.registry}</span>
          <span>·</span>
          <span>{credit.methodology}</span>
        </div>

        {/* Volume */}
        <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '11px', color: '#1A1714', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, fontFeatureSettings: "'tnum'" }}>{credit.volumeAvailable.toLocaleString()}</span>
          <span style={{ color: '#B0A99A' }}> tCO₂e available</span>
        </div>

        {/* Compliance tags */}
        {credit.compliance.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-3" style={{ borderTop: '1px solid #F0EBE3' }}>
            {credit.compliance.map(c => (
              <span key={c} style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '9.5px', fontWeight: 600, color: '#1B3A2D', background: 'rgba(27,58,45,0.06)', border: '1px solid rgba(27,58,45,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
