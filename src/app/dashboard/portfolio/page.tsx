'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPortfolio } from '@/lib/db';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

export default function PortfolioPage() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getPortfolio(user.id).then(setPortfolio).finally(() => setLoading(false));
  }, [user?.id]);

  const totalValue = portfolio.reduce((s, p) => s + (p.listing?.price_per_tonne || 0) * (p.quantity || 0), 0);
  const totalTonnes = portfolio.reduce((s, p) => s + (p.quantity || 0), 0);

  return (
    <div style={{ fontFamily: bg }}>
      <h1 style={{ fontFamily: fr, fontSize: '26px', color: '#1A1714', marginBottom: '4px' }}>Portfolio</h1>
      <p style={{ fontSize: '13px', color: '#8A7E70', marginBottom: '24px' }}>Your owned carbon credits across all projects</p>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1B3A2D', borderRadius: '12px', padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#8AAA92' }}>Total Value</div>
          <div style={{ fontFamily: mono, fontSize: '28px', fontWeight: 700, color: '#F2ECE0' }}>{loading ? '...' : fmt(totalValue)}</div>
        </div>
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '12px', padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#8A7E70' }}>Total Credits</div>
          <div style={{ fontFamily: mono, fontSize: '28px', fontWeight: 700, color: '#1A1714' }}>{loading ? '...' : `${totalTonnes.toLocaleString()} tCO₂e`}</div>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: '40px', textAlign: 'center', color: '#8A7E70' }}>Loading portfolio...</p>
      ) : portfolio.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>◇</div>
          <h3 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '8px' }}>Your portfolio is empty</h3>
          <p style={{ fontSize: '13px', color: '#8A7E70', marginBottom: '20px' }}>Purchase carbon credits from the marketplace to build your portfolio</p>
          <Link href="/marketplace" style={{ fontSize: '14px', fontWeight: 600, color: '#F2ECE0', background: '#1B3A2D', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead><tr style={{ background: '#F5F0E8' }}>
              {['Project', 'Type', 'Registry', 'Vintage', 'Qty (tCO₂e)', 'Unit Price', 'Value', 'Rating'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Project' ? 'left' : 'right', fontSize: '10px', fontWeight: 700, color: '#5A5248', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {portfolio.map((p, i) => (
                <tr key={i} onClick={() => p.listing?.id && (window.location.href = `/credits/${p.listing.id}`)}
                  style={{ borderBottom: '1px solid #F0EBE0', cursor: 'pointer', transition: 'background 120ms' }}
                  className="hover:bg-[#F5F0E8]">
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1B3A2D' }}>{p.listing?.project_name || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px', color: '#5A5248' }}>{p.listing?.credit_type?.replace(/_/g, ' ')?.toUpperCase() || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px' }}>{p.listing?.registry || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: mono }}>{p.listing?.vintage_year || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: mono, fontWeight: 600 }}>{(p.quantity || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: mono }}>${(p.listing?.price_per_tonne || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: mono, fontWeight: 600 }}>{fmt((p.listing?.price_per_tonne || 0) * (p.quantity || 0))}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#F5F0E8', color: '#1B3A2D' }}>
                      {p.listing?.quality_rating || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
