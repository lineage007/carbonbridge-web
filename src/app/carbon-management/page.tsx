'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';

const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'DM Mono', monospace";

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }); }

type Tab = 'emissions' | 'targets' | 'offsets' | 'compliance';

const SCOPES = [
  { scope: 'Scope 1', label: 'Direct Emissions', value: 12400, unit: 'tCO₂e', sub: 'Fuel combustion, fleet, refrigerants', color: '#EF4444', pct: 28 },
  { scope: 'Scope 2', label: 'Energy Indirect', value: 8600, unit: 'tCO₂e', sub: 'Purchased electricity, heating, cooling', color: '#F59E0B', pct: 19 },
  { scope: 'Scope 3', label: 'Value Chain', value: 23400, unit: 'tCO₂e', sub: 'Business travel, procurement, logistics', color: '#8B5CF6', pct: 53 },
];

const TARGETS = [
  { framework: 'SBTi Near-Term', target: 'Reduce Scope 1+2 by 42% by 2030', baseline: 21000, current: 21000, goal: 12180, year: 2030, status: 'On Track' as const },
  { framework: 'UAE Net Zero 2050', target: 'Net zero across all scopes by 2050', baseline: 44400, current: 44400, goal: 0, year: 2050, status: 'Baseline Set' as const },
  { framework: 'NRCC Compliance', target: 'Report & offset mandatory emissions by May 2026', baseline: 12400, current: 12400, goal: 0, year: 2026, status: 'Action Required' as const },
];

const OFFSET_PORTFOLIO = [
  { project: 'Great Southern Forest Restoration', type: 'ARR', qty: 5000, vintage: 2025, price: 26.40, total: 132000, coverage: '11.3%', status: 'Active' },
  { project: 'Abu Dhabi Blue Carbon', type: 'Blue Carbon', qty: 3000, vintage: 2025, price: 64.00, total: 192000, coverage: '6.8%', status: 'Active' },
  { project: 'Queensland Biochar', type: 'Biochar', qty: 2000, vintage: 2026, price: 142.00, total: 284000, coverage: '4.5%', status: 'Pending' },
];

const COMPLIANCE = [
  { reg: 'UAE NRCC', deadline: '30 May 2026', status: 'Action Required' as const, requirement: 'Report Scope 1+2 emissions and offset mandatory portion', progress: 35 },
  { reg: 'EU CBAM', deadline: '1 Jan 2027', status: 'Monitoring' as const, requirement: 'Purchase carbon certificates for EU exports (aluminium, steel)', progress: 15 },
  { reg: 'CORSIA Phase 1', deadline: 'Ongoing', status: 'Compliant' as const, requirement: 'Offset international aviation emissions above 2019 baseline', progress: 100 },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'On Track': { bg: 'rgba(22,163,74,0.1)', text: '#16A34A' },
  'Baseline Set': { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  'Action Required': { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
  'Monitoring': { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  'Compliant': { bg: 'rgba(22,163,74,0.1)', text: '#16A34A' },
};

export default function CarbonManagementPage() {
  const [tab, setTab] = useState<Tab>('emissions');
  const totalEmissions = SCOPES.reduce((s, sc) => s + sc.value, 0);
  const { user, loading } = useAuth();
  const router = useRouter();
  const totalOffset = OFFSET_PORTFOLIO.reduce((s, o) => s + o.qty, 0);
  const coveragePct = ((totalOffset / totalEmissions) * 100).toFixed(1);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/carbon-management');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF7" }}>
      <Navbar />
      <main>
      

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>Carbon Management</h1>
          <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>Track emissions, manage targets, monitor compliance, and optimise your offset portfolio.</p>
        </div>

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Emissions', value: `${(totalEmissions / 1000).toFixed(1)}k`, sub: 'tCO₂e (FY2025)', accent: '#EF4444' },
            { label: 'Credits Held', value: totalOffset.toLocaleString(), sub: 'tCO₂e in portfolio', accent: '#2D6A4F' },
            { label: 'Coverage', value: `${coveragePct}%`, sub: 'of total emissions offset', accent: '#C9A96E' },
            { label: 'Compliance Score', value: '72%', sub: 'across all frameworks', accent: '#3B82F6' },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '20px', borderTop: `3px solid ${kpi.accent}` }}>
              <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{kpi.label}</div>
              <div style={{ fontFamily: mono, fontSize: '26px', fontWeight: 700, color: '#1A1714', marginBottom: '2px' }}>{kpi.value}</div>
              <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #E8E2D8', marginBottom: '24px' }}>
          {(['emissions', 'targets', 'offsets', 'compliance'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: bg, fontSize: '13px', fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#1B3A2D' : '#8B8178', background: 'transparent',
              border: 'none', padding: '10px 18px', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #1B3A2D' : '2px solid transparent',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {/* Emissions Tab */}
        {tab === 'emissions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Emissions by Scope</h3>
              {/* Stacked bar */}
              <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                {SCOPES.map(s => (
                  <div key={s.scope} style={{ width: `${s.pct}%`, background: s.color, transition: 'width 0.5s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {SCOPES.map(s => (
                  <div key={s.scope} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714' }}>{s.scope}: {s.label}</span>
                        <span style={{ fontFamily: mono, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>{s.value.toLocaleString()} tCO₂e</span>
                      </div>
                      <div style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginTop: '2px' }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px', padding: '14px', background: '#FAFAF7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>Total</span>
                <span style={{ fontFamily: mono, fontSize: '16px', fontWeight: 700, color: '#1A1714' }}>{totalEmissions.toLocaleString()} tCO₂e</span>
              </div>
            </div>

            {/* Emissions trend */}
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '16px', fontWeight: 600, color: '#1A1714', marginBottom: '20px' }}>Year-on-Year</h3>
              {[
                { year: 'FY2023', val: 48200, color: '#D5CFC4' },
                { year: 'FY2024', val: 46800, color: '#A39E94' },
                { year: 'FY2025', val: 44400, color: '#1B3A2D' },
              ].map(y => (
                <div key={y.year} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: bg, fontSize: '12px', fontWeight: 600, color: '#1A1714' }}>{y.year}</span>
                    <span style={{ fontFamily: mono, fontSize: '12px', color: y.color }}>{y.val.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', background: '#E8E2D8', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(y.val / 50000) * 100}%`, height: '100%', background: y.color, borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(22,163,74,0.06)', borderRadius: '6px' }}>
                <span style={{ fontFamily: bg, fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>↓ 7.9% reduction over 2 years</span>
              </div>
            </div>
          </div>
        )}

        {/* Targets Tab */}
        {tab === 'targets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {TARGETS.map(t => {
              const progress = t.goal === 0 && t.year > 2030 ? 5 : t.goal === 0 ? t.status === 'Action Required' ? 35 : 100 : Math.min(100, ((t.baseline - t.current) / (t.baseline - t.goal)) * 100);
              return (
                <div key={t.framework} style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#1A1714' }}>{t.framework}</h3>
                        <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: STATUS_STYLE[t.status]?.bg, color: STATUS_STYLE[t.status]?.text }}>{t.status}</span>
                      </div>
                      <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{t.target}</p>
                    </div>
                    <div style={{ fontFamily: mono, fontSize: '14px', fontWeight: 700, color: '#8B8178' }}>by {t.year}</div>
                  </div>
                  <div style={{ height: '10px', background: '#E8E2D8', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(progress, 2)}%`, height: '100%', background: t.status === 'Action Required' ? '#EF4444' : t.status === 'On Track' ? '#16A34A' : '#3B82F6', borderRadius: '5px', transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>Baseline: {t.baseline.toLocaleString()} tCO₂e</span>
                    <span style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178' }}>Target: {t.goal === 0 ? 'Net Zero' : t.goal.toLocaleString() + ' tCO₂e'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Offsets Tab */}
        {tab === 'offsets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#1A1714' }}>Offset Portfolio</h3>
              <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1B3A2D', background: '#C9A96E', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none' }}>Purchase Credits</Link>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8E2D8' }}>
                    {['Project', 'Type', 'Volume', 'Vintage', 'Price', 'Total', 'Coverage', 'Status'].map(h => (
                      <th key={h} style={{ fontFamily: bg, fontSize: '10px', fontWeight: 700, color: '#8B8178', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 14px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OFFSET_PORTFOLIO.map(o => (
                    <tr key={o.project} style={{ borderBottom: '1px solid #F0EDE6' }}>
                      <td style={{ padding: '14px', fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{o.project}</td>
                      <td style={{ padding: '14px', fontFamily: bg, fontSize: '12px', color: '#8B8178' }}>{o.type}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{o.qty.toLocaleString()}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>{o.vintage}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#1A1714' }}>${o.price.toFixed(2)}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '13px', fontWeight: 600, color: '#2D6A4F' }}>{fmt(o.total)}</td>
                      <td style={{ padding: '14px', fontFamily: mono, fontSize: '12px', color: '#C9A96E', fontWeight: 600 }}>{o.coverage}</td>
                      <td style={{ padding: '14px' }}><span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: o.status === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(245,158,11,0.1)', color: o.status === 'Active' ? '#16A34A' : '#F59E0B' }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '16px', padding: '16px', background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#1A1714' }}>Total Portfolio Value</span>
                <span style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', marginLeft: '8px' }}>{totalOffset.toLocaleString()} tCO₂e across {OFFSET_PORTFOLIO.length} projects</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: '20px', fontWeight: 700, color: '#2D6A4F' }}>{fmt(OFFSET_PORTFOLIO.reduce((s, o) => s + o.total, 0))}</span>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {tab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {COMPLIANCE.map(c => (
              <div key={c.reg} style={{ background: '#fff', border: '1px solid #E8E2D8', borderRadius: '12px', padding: '24px', borderLeft: `4px solid ${STATUS_STYLE[c.status]?.text || '#8B8178'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontFamily: fr, fontSize: '18px', fontWeight: 600, color: '#1A1714' }}>{c.reg}</h3>
                      <span style={{ fontFamily: bg, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: STATUS_STYLE[c.status]?.bg, color: STATUS_STYLE[c.status]?.text }}>{c.status}</span>
                    </div>
                    <p style={{ fontFamily: bg, fontSize: '13px', color: '#8B8178' }}>{c.requirement}</p>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: '13px', fontWeight: 600, color: c.status === 'Action Required' ? '#EF4444' : '#8B8178' }}>Deadline: {c.deadline}</div>
                </div>
                <div style={{ height: '8px', background: '#E8E2D8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.progress}%`, height: '100%', background: STATUS_STYLE[c.status]?.text || '#8B8178', borderRadius: '4px' }} />
                </div>
                <div style={{ fontFamily: bg, fontSize: '11px', color: '#8B8178', marginTop: '6px' }}>{c.progress}% complete</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
    </div>
  );
}
