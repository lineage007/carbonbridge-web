'use client';
const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const SCOPES = [
  { scope: 'Scope 1', label: 'Direct Emissions', tonnes: 1240, sources: ['Fleet vehicles', 'On-site generators', 'Refrigerants'], color: '#1B3A2D' },
  { scope: 'Scope 2', label: 'Energy Indirect', tonnes: 890, sources: ['Purchased electricity', 'District cooling'], color: '#2D6A4F' },
  { scope: 'Scope 3', label: 'Value Chain', tonnes: 4520, sources: ['Business travel', 'Employee commuting', 'Purchased goods', 'Waste disposal'], color: '#4A8A6A' },
];
const totalEmissions = SCOPES.reduce((s, sc) => s + sc.tonnes, 0);
const totalOffset = 25500;
const coverage = ((totalOffset / totalEmissions) * 100).toFixed(0);

const TARGETS = [
  { name: 'UAE Net Zero 2050', target: 'Net zero by 2050', progress: 38, status: 'On track', color: '#16A34A' },
  { name: 'SBTi Near-Term', target: '42% reduction by 2030', progress: 22, status: 'Monitoring', color: '#C9A96E' },
  { name: 'NRCC Compliance', target: 'Annual reporting + offsetting', progress: 85, status: 'Action needed', color: '#dc2626' },
];

export default function CarbonPage() {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Carbon Management</h1>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#6B6259' }}>Track emissions, manage compliance, and optimise your offset portfolio.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: '3px solid #1B3A2D' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>Total Emissions</div>
          <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#1B3A2D' }}>{totalEmissions.toLocaleString()} tCO₂e</div>
          <div style={{ fontFamily: bg, fontSize: '11px', color: '#8A7E70', marginTop: '4px' }}>FY 2025-26 · ↓7.9% YoY</div>
        </div>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: '3px solid #16A34A' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>Credits Purchased</div>
          <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#16A34A' }}>{totalOffset.toLocaleString()} tCO₂e</div>
          <div style={{ fontFamily: bg, fontSize: '11px', color: '#8A7E70', marginTop: '4px' }}>{coverage}% of total emissions</div>
        </div>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '18px', borderTop: '3px solid #C9A96E' }}>
          <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '6px' }}>Net Position</div>
          <div style={{ fontFamily: mono, fontSize: '22px', fontWeight: 700, color: '#C9A96E' }}>Carbon Positive</div>
          <div style={{ fontFamily: bg, fontSize: '11px', color: '#8A7E70', marginTop: '4px' }}>Offsets exceed emissions by {(totalOffset - totalEmissions).toLocaleString()} tCO₂e</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '16px' }}>Emissions by Scope</h2>
          {SCOPES.map(sc => (
            <div key={sc.scope} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{sc.scope}: {sc.label}</span>
                <span style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: sc.color }}>{sc.tonnes.toLocaleString()} tCO₂e</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: '#F0EBE0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(sc.tonnes / totalEmissions) * 100}%`, background: sc.color, borderRadius: '4px' }} />
              </div>
              <div style={{ fontFamily: bg, fontSize: '11px', color: '#8A7E70', marginTop: '4px' }}>{sc.sources.join(' · ')}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '16px' }}>Compliance Targets</h2>
          {TARGETS.map(t => (
            <div key={t.name} style={{ marginBottom: '16px', padding: '14px', background: '#fff', borderRadius: '10px', border: '1px solid #F0EBE0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{t.name}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', color: t.color, background: `${t.color}15` }}>{t.status}</span>
              </div>
              <div style={{ fontFamily: bg, fontSize: '12px', color: '#8A7E70', marginBottom: '8px' }}>{t.target}</div>
              <div style={{ height: '6px', borderRadius: '3px', background: '#F0EBE0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.progress}%`, background: t.color, borderRadius: '3px' }} />
              </div>
              <div style={{ fontFamily: mono, fontSize: '11px', color: '#8A7E70', marginTop: '4px' }}>{t.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
