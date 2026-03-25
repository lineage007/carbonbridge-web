'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

const fr = "'Fraunces', serif";
const bg = "'Plus Jakarta Sans', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const CREDIT_TYPES = ['ARR', 'REDD+', 'Blue Carbon', 'Biochar', 'Cookstove', 'DACCS', 'Soil Carbon', 'ERW', 'IFM', 'Landfill Gas'];
const QUALITY_OPTIONS = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B'];
const COMPLIANCE = ['NRCC', 'CBAM', 'CORSIA', 'SBTi / VCMI', 'None specific'];

export default function RFQPage() {
  const [step, setStep] = useState(1);
  const [types, setTypes] = useState<string[]>([]);
  const [qty, setQty] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [timeline, setTimeline] = useState('');
  const [compliance, setCompliance] = useState('');
  const [quality, setQuality] = useState('');
  const [geography, setGeography] = useState('');
  const [insurance, setInsurance] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const Pill = ({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (v: string) => void }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {items.map(item => (
        <button key={item} type="button" onClick={() => onToggle(item)} style={{
          fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', cursor: 'pointer', transition: 'all 0.15s',
          border: `1px solid ${selected.includes(item) ? '#1B3A2D' : '#E8E2D8'}`,
          background: selected.includes(item) ? 'rgba(27,58,45,0.06)' : '#fff',
          color: selected.includes(item) ? '#1B3A2D' : '#8B8178',
        }}>{item}</button>
      ))}
    </div>
  );

  if (submitted) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, background: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '28px', color: '#C9A96E' }}>✓</span>
          </div>
          <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>RFQ Submitted</h1>
          <p style={{ fontFamily: bg, fontSize: '14px', color: '#8B8178', lineHeight: 1.7 }}>Your request for {parseInt(qty || '0').toLocaleString()} tCO₂e has been sent to matched sellers. You&apos;ll receive responses within 48 hours in your dashboard.</p>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, background: '#FAFAF7', overflow: 'auto' }}>
        <div style={{ padding: '28px', maxWidth: '700px' }}>
          <h1 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Request for Quotation</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178', marginBottom: '28px' }}>Tell us what you need. We&apos;ll match you with the right sellers and get you competitive quotes.</p>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#1B3A2D' : '#E8E2D8' }} />)}
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '16px' }}>What credit types are you looking for?</h2>
              <Pill items={CREDIT_TYPES} selected={types} onToggle={v => toggle(types, v, setTypes)} />

              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginTop: '28px', marginBottom: '8px' }}>Quantity needed (tCO₂e)</h2>
              <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="e.g. 10000" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', outline: 'none' }} />

              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginTop: '28px', marginBottom: '8px' }}>Target price range ($/tCO₂e)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input value={priceMin} onChange={e => setPriceMin(e.target.value)} type="number" placeholder="Min" style={{ padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', outline: 'none' }} />
                <input value={priceMax} onChange={e => setPriceMax(e.target.value)} type="number" placeholder="Max" style={{ padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', outline: 'none' }} />
              </div>

              <button onClick={() => setStep(2)} disabled={types.length === 0 || !qty} style={{ marginTop: '24px', width: '100%', padding: '14px', border: 'none', borderRadius: '10px', fontFamily: bg, fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: (types.length && qty) ? '#1B3A2D' : '#C5BFB3', color: '#FFFCF6' }}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Delivery timeline</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {['Within 30 days', 'Within 90 days', 'Within 6 months', 'Within 12 months', 'Flexible'].map(t => (
                  <button key={t} type="button" onClick={() => setTimeline(t)} style={{
                    fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${timeline === t ? '#1B3A2D' : '#E8E2D8'}`, background: timeline === t ? 'rgba(27,58,45,0.06)' : '#fff', color: timeline === t ? '#1B3A2D' : '#8B8178',
                  }}>{t}</button>
                ))}
              </div>

              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Compliance requirement</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {COMPLIANCE.map(c => (
                  <button key={c} type="button" onClick={() => setCompliance(c)} style={{
                    fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${compliance === c ? '#1B3A2D' : '#E8E2D8'}`, background: compliance === c ? 'rgba(27,58,45,0.06)' : '#fff', color: compliance === c ? '#1B3A2D' : '#8B8178',
                  }}>{c}</button>
                ))}
              </div>

              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Minimum quality rating</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {QUALITY_OPTIONS.map(q => (
                  <button key={q} type="button" onClick={() => setQuality(q)} style={{
                    fontFamily: mono, fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${quality === q ? '#C9A96E' : '#E8E2D8'}`, background: quality === q ? 'rgba(201,169,110,0.08)' : '#fff', color: quality === q ? '#C9A96E' : '#8B8178',
                  }}>{q}</button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', border: '1px solid #E8E2D8', borderRadius: '10px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#8B8178', background: '#fff', cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: '14px', border: 'none', borderRadius: '10px', fontFamily: bg, fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: '#1B3A2D', color: '#FFFCF6' }}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Geography preference</h2>
              <input value={geography} onChange={e => setGeography(e.target.value)} placeholder="e.g. MENA, Australia, Southeast Asia, Any" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '14px', outline: 'none', marginBottom: '20px' }} />

              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Insurance requirement</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['Required (non-delivery cover)', 'Preferred but optional', 'Not needed'].map(i => (
                  <button key={i} type="button" onClick={() => setInsurance(i)} style={{
                    fontFamily: bg, fontSize: '12px', fontWeight: 600, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${insurance === i ? '#1B3A2D' : '#E8E2D8'}`, background: insurance === i ? 'rgba(27,58,45,0.06)' : '#fff', color: insurance === i ? '#1B3A2D' : '#8B8178',
                  }}>{i}</button>
                ))}
              </div>

              <h2 style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>Additional notes</h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any specific requirements, preferred registries, vintage preferences..." style={{ width: '100%', height: '100px', padding: '12px 14px', border: '1px solid #E8E2D8', borderRadius: '8px', fontFamily: bg, fontSize: '13px', outline: 'none', resize: 'vertical' }} />

              {/* Summary */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#F5F0E8', borderRadius: '10px', border: '1px solid #E8E2D8' }}>
                <div style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#8B8178', marginBottom: '8px' }}>RFQ SUMMARY</div>
                <div style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714', lineHeight: 2 }}>
                  <strong>Types:</strong> {types.join(', ')}<br/>
                  <strong>Volume:</strong> {parseInt(qty || '0').toLocaleString()} tCO₂e<br/>
                  {priceMin && <><strong>Price range:</strong> ${priceMin}–${priceMax}/tCO₂e<br/></>}
                  {timeline && <><strong>Timeline:</strong> {timeline}<br/></>}
                  {compliance && <><strong>Compliance:</strong> {compliance}<br/></>}
                  {quality && <><strong>Min quality:</strong> {quality}<br/></>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', border: '1px solid #E8E2D8', borderRadius: '10px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#8B8178', background: '#fff', cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setSubmitted(true)} style={{ flex: 2, padding: '14px', border: 'none', borderRadius: '10px', fontFamily: bg, fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: '#1B3A2D', color: '#FFFCF6' }}>Submit RFQ</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
