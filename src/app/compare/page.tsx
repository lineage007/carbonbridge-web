'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LISTINGS } from '@/data/credits';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

type CreditListing = typeof LISTINGS[0];

const COMPARE_DIMENSIONS = [
  { key: 'type', label: 'Credit Type' },
  { key: 'registry', label: 'Registry' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'location', label: 'Location' },
  { key: 'price', label: 'Price (USD/tCO₂e)' },
  { key: 'available', label: 'Volume Available' },
  { key: 'qualityRating', label: 'Quality Rating' },
  { key: 'permanence', label: 'Permanence' },
  { key: 'additionality', label: 'Additionality' },
  { key: 'coBenefits', label: 'Co-benefits' },
  { key: 'insurance', label: 'Insurance Available' },
  { key: 'corsiaEligible', label: 'CORSIA Eligible' },
  { key: 'cbamEligible', label: 'CBAM Eligible' },
] as const;

function getRatingColor(r: string) {
  if (r.startsWith('AAA')) return '#16A34A';
  if (r.startsWith('AA')) return '#2D6A4F';
  if (r.startsWith('A')) return '#C9A96E';
  return '#8B8178';
}

function getCellValue(credit: CreditListing, key: string): string {
  switch (key) {
    case 'type': return credit.creditType;
    case 'registry': return credit.registry;
    case 'methodology': return credit.methodology;
    case 'vintage': return String(credit.vintage);
    case 'location': return credit.location;
    case 'price': return `$${credit.price.toFixed(2)}`;
    case 'available': return credit.volumeAvailable.toLocaleString() + ' tCO₂e';
    case 'qualityRating': return credit.qualityRating;
    case 'permanence': return 'High — verified by ' + credit.verificationBody;
    case 'additionality': return 'Verified — ' + credit.methodology;
    case 'coBenefits': return credit.coBenefits.join(', ');
    case 'insurance': return credit.ccpLabelled ? '✓ Available' : '—';
    case 'corsiaEligible': return credit.compliance.includes('CORSIA') ? '✓ Eligible' : '✗ Not eligible';
    case 'cbamEligible': return credit.compliance.includes('CBAM') ? '✓ Eligible' : '✗ Not eligible';
    default: return '—';
  }
}

function isGoodValue(key: string, val: string): boolean | null {
  if (key === 'insurance' || key === 'corsiaEligible' || key === 'cbamEligible') return val.startsWith('✓');
  if (key === 'qualityRating') return val.startsWith('AA');
  if (key === 'permanence') return val.toLowerCase().includes('1,000') || val.toLowerCase().includes('permanent');
  return null;
}

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([LISTINGS[0].id, LISTINGS[5].id]);
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const credits = selected.map(id => LISTINGS.find(l => l.id === id)).filter(Boolean) as CreditListing[];
  const filtered = LISTINGS.filter(l => !selected.includes(l.id) && (l.projectName.toLowerCase().includes(search.toLowerCase()) || l.creditType.toLowerCase().includes(search.toLowerCase())));

  const addSlot = () => { if (selected.length < 4) setSelected([...selected, '']); };
  const removeSlot = (idx: number) => { setSelected(selected.filter((_, i) => i !== idx)); };
  const pickCredit = (idx: number, id: string) => { const next = [...selected]; next[idx] = id; setSelected(next); setShowPicker(null); setSearch(''); };

  return (
    <div style={{ background: '#FAFAF7', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--forest-deep, #1B3A2D)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px', width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', color: 'rgba(255,252,246,0.6)' }}>← Back to Marketplace</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Compare Credits</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>Side-by-side comparison across quality, price, compliance eligibility, and co-benefits.</p>
        </div>

        {/* Credit selector row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {selected.map((id, idx) => {
            const credit = LISTINGS.find(l => l.id === id);
            return (
              <div key={idx} style={{ flex: '1 1 200px', maxWidth: '280px', position: 'relative' }}>
                {credit ? (
                  <div
                    onClick={() => setShowPicker(showPicker === idx ? null : idx)}
                    style={{ background: '#fff', border: '2px solid #1B3A2D', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  >
                    <button onClick={(e) => { e.stopPropagation(); removeSlot(idx); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8178', fontSize: '16px' }}>✕</button>
                    <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 700, color: getRatingColor(credit.qualityRating), marginBottom: '6px' }}>{credit.qualityRating}</div>
                    <div style={{ fontFamily: fr, fontSize: '14px', fontWeight: 600, color: '#1A1714', lineHeight: 1.3, marginBottom: '4px' }}>{credit.projectName}</div>
                    <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>{credit.creditType} · {String(credit.vintage)}</div>
                    <div style={{ fontFamily: mono, fontSize: '16px', fontWeight: 700, color: '#2D6A4F', marginTop: '8px' }}>${credit.price.toFixed(2)}</div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowPicker(showPicker === idx ? null : idx)}
                    style={{ background: '#fff', border: '2px dashed #D5CFC4', borderRadius: '12px', padding: '28px 16px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <div style={{ fontFamily: bg, fontSize: '24px', color: '#D5CFC4', marginBottom: '6px' }}>＋</div>
                    <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>Select credit</div>
                  </div>
                )}

                {/* Dropdown picker */}
                {showPicker === idx && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #E8E2D8', borderRadius: '10px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', marginTop: '4px', maxHeight: '320px', overflow: 'hidden' }}>
                    <div style={{ padding: '8px' }}>
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credits..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #E8E2D8', borderRadius: '6px', fontFamily: bg, fontSize: '12px', outline: 'none' }} />
                    </div>
                    <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                      {filtered.map(l => (
                        <div key={l.id} onClick={() => pickCredit(idx, l.id)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #F0EDE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div>
                            <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{l.projectName}</div>
                            <div style={{ fontFamily: bg, fontSize: '10px', color: '#8B8178' }}>{l.creditType} · {l.location}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: mono, fontSize: '12px', fontWeight: 600, color: '#2D6A4F' }}>${l.price.toFixed(2)}</div>
                            <div style={{ fontFamily: mono, fontSize: '10px', color: '#C9A96E' }}>{l.qualityRating}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {selected.length < 4 && (
            <button onClick={addSlot} style={{ flex: '1 1 200px', maxWidth: '280px', background: 'transparent', border: '2px dashed #D5CFC4', borderRadius: '12px', padding: '28px', cursor: 'pointer', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>
              ＋ Add credit
            </button>
          )}
        </div>

        {/* Comparison table */}
        {credits.length >= 2 && (
          <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E8E2D8' }}>
                  <th style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '14px 18px', textAlign: 'left', width: '180px' }}>Dimension</th>
                  {credits.map(c => (
                    <th key={c.id} style={{ fontFamily: fr, fontSize: '13px', fontWeight: 600, color: '#1A1714', padding: '14px 18px', textAlign: 'left', borderLeft: '1px solid #F0EDE6' }}>
                      <Link href={`/credits/${c.id}`} style={{ color: '#1A1714', textDecoration: 'none' }} className="hover:text-[#1B3A2D]">{c.projectName}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_DIMENSIONS.map((dim, i) => (
                  <tr key={dim.key} style={{ borderBottom: '1px solid #F0EDE6', background: i % 2 === 0 ? 'transparent' : '#FAFAF7' }}>
                    <td style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8B8178', padding: '12px 18px' }}>{dim.label}</td>
                    {credits.map(c => {
                      const val = getCellValue(c, dim.key);
                      const good = isGoodValue(dim.key, val);
                      return (
                        <td key={c.id} style={{ padding: '12px 18px', borderLeft: '1px solid #F0EDE6', fontFamily: dim.key === 'price' || dim.key === 'available' || dim.key === 'qualityRating' ? mono : bg, fontSize: '12px', color: dim.key === 'qualityRating' ? getRatingColor(val) : good === true ? '#16A34A' : good === false ? '#EF4444' : '#1A1714', fontWeight: dim.key === 'price' || dim.key === 'qualityRating' ? 700 : 400 }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {credits.length < 2 && (
          <div style={{ background: '#fff', border: '2px dashed #D5CFC4', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: fr, fontSize: '20px', color: '#8B8178', marginBottom: '8px' }}>Select at least 2 credits to compare</div>
            <p style={{ fontFamily: bg, fontSize: '13px', color: '#A39E94' }}>Click the cards above or browse the <Link href="/marketplace" style={{ color: '#1B3A2D', textDecoration: 'underline' }}>marketplace</Link> to find credits.</p>
          </div>
        )}

        {/* Bottom CTA */}
        {credits.length >= 2 && (
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link href="/checkout" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1B3A2D', background: '#C9A96E', padding: '12px 28px', borderRadius: '9px', textDecoration: 'none' }}>
              Purchase Selected
            </Link>
            <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: '#1A1714', padding: '12px 28px', borderRadius: '9px', border: '1px solid #E8E2D8', textDecoration: 'none' }}>
              Browse More Credits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
