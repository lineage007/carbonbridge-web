'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RFQ_EMAIL, RFQ_NOTES_MAX, rfqBody, rfqMailto, rfqProblem } from './rfq-email';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

const CREDIT_TYPES = ['ARR','REDD+','Blue Carbon','Biochar','Soil Carbon','Savanna Fire Management','Landfill Gas','Energy Efficiency','IFM','Direct Air Capture (DACCS)','Enhanced Rock Weathering','Carbon Mineralization'];
const QUALITY_OPTIONS = ['AAA','AA','A','BBB','Any'];

export default function RFQPage() {
  const [submitted, setSubmitted] = useState(false);
  const [problem, setProblem] = useState('');
  const [form, setForm] = useState({
    creditTypes: [] as string[], quantity: '', priceMin: '', priceMax: '',
    delivery: 'flexible', compliance: '', quality: 'bbb', geography: '',
    insurance: 'undecided', notes: '',
  });

  const toggleType = (t: string) => setForm(f => ({
    ...f, creditTypes: f.creditTypes.includes(t) ? f.creditTypes.filter(x => x !== t) : [...f.creditTypes, t]
  }));

  const emailRequest = () => {
    const found = rfqProblem(form);
    if (found) {
      setProblem(found);
      return;
    }
    setProblem('');
    window.location.href = rfqMailto(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFCF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#1B3A2D', marginBottom: '12px' }}>Send your request from your email app</h1>
          <p style={{ fontFamily: bg, fontSize: '15px', color: '#6B6259', lineHeight: 1.7, marginBottom: '16px' }}>
            Your email app should have opened with a draft to {RFQ_EMAIL}. It reaches us only when you press send there.
          </p>
          <p style={{ fontFamily: bg, fontSize: '15px', color: '#6B6259', lineHeight: 1.7, marginBottom: '16px' }}>
            If no draft opened, copy this into an email to <a href={`mailto:${RFQ_EMAIL}`} style={{ color: '#1B3A2D', fontWeight: 600 }}>{RFQ_EMAIL}</a>:
          </p>
          <pre style={{ fontFamily: bg, fontSize: '13px', color: '#1A1714', background: '#F2ECE0', padding: '16px', borderRadius: '10px', textAlign: 'left', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginBottom: '24px' }}>{rfqBody(form)}</pre>
          <button onClick={() => setSubmitted(false)} style={{ fontFamily: bg, fontSize: '14px', color: '#1B3A2D', background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto 12px' }}>Edit request</button>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', color: '#C9A96E', textDecoration: 'none' }}>← Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const inputStyle = { fontFamily: bg, fontSize: '14px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E5DED3', background: '#FFFCF6', color: '#1A1714', width: '100%', outline: 'none' };
  const labelStyle = { fontFamily: bg, fontSize: '12px', fontWeight: 600 as const, color: '#6B6259', marginBottom: '6px', display: 'block' as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF6' }}>
      <header style={{ background: '#1B3A2D', padding: '16px 0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/"><img src="/logo-white.png" alt="CarbonBridge" style={{ height: '28px' }} /></Link>
          <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', color: '#8AAA92', textDecoration: 'none' }}>← Marketplace</Link>
        </div>
      </header>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '28px', color: '#1A1714', marginBottom: '8px' }}>Request for Quote</h1>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259', marginBottom: '36px' }}>For volumes over 10,000 tCO₂e. Send us your requirements by email. The team replies with availability and pricing.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p id="rfq-credit-types" style={labelStyle}>Credit types required *</p>
            <div role="group" aria-labelledby="rfq-credit-types" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CREDIT_TYPES.map(t => {
                const active = form.creditTypes.includes(t);
                return <button key={t} type="button" aria-pressed={active} onClick={() => toggleType(t)} style={{ fontFamily: bg, fontSize: '12px', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${active ? '#1B3A2D' : '#E5DED3'}`, background: active ? 'rgba(27,58,45,0.06)' : 'transparent', color: active ? '#1B3A2D' : '#6B6259', cursor: 'pointer' }}>{t}</button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '16px' }}>
            <div><label htmlFor="rfq-quantity" style={labelStyle}>Quantity (tCO₂e) *</label><input id="rfq-quantity" style={inputStyle} placeholder="Min 10,000" maxLength={40} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            <div><label htmlFor="rfq-price-min" style={labelStyle}>Target price min ($/t)</label><input id="rfq-price-min" style={inputStyle} placeholder="Optional" maxLength={20} value={form.priceMin} onChange={e => setForm(f => ({ ...f, priceMin: e.target.value }))} /></div>
            <div><label htmlFor="rfq-price-max" style={labelStyle}>Target price max ($/t)</label><input id="rfq-price-max" style={inputStyle} placeholder="Optional" maxLength={20} value={form.priceMax} onChange={e => setForm(f => ({ ...f, priceMax: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label htmlFor="rfq-delivery-timeline" style={labelStyle}>Delivery timeline</label>
              <select id="rfq-delivery-timeline" style={{ ...inputStyle, appearance: 'none' as const }} value={form.delivery} onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))}>
                <option value="immediate">Immediate</option><option value="3m">Within 3 months</option><option value="6m">Within 6 months</option><option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label htmlFor="rfq-minimum-quality" style={labelStyle}>Minimum quality</label>
              <select id="rfq-minimum-quality" style={{ ...inputStyle, appearance: 'none' as const }} value={form.quality} onChange={e => setForm(f => ({ ...f, quality: e.target.value }))}>
                {QUALITY_OPTIONS.map(q => <option key={q} value={q.toLowerCase()}>{q}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="rfq-additional-notes" style={labelStyle}>Additional notes</label>
            <textarea id="rfq-additional-notes" style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }} placeholder="Specific requirements, compliance context, preferred geography..." maxLength={RFQ_NOTES_MAX} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {problem && <p role="alert" style={{ fontFamily: bg, fontSize: '14px', color: '#9B2C2C', margin: 0 }}>{problem}</p>}
          <button onClick={emailRequest} style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, padding: '16px', borderRadius: '10px', border: 'none', background: '#1B3A2D', color: '#F2ECE0', cursor: 'pointer', width: '100%' }}>
            Email this request
          </button>
        </div>
      </div>
    </div>
  );
}
