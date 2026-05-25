'use client';

import { useState, useEffect } from 'react';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

type ListingStatus = 'pending_review' | 'active' | 'paused' | 'sold_out' | 'rejected' | 'expired';

const STATUS_CONFIG: Record<ListingStatus, { label: string; bg: string; text: string }> = {
  pending_review: { label: 'Pending Review', bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  active:         { label: 'Active',         bg: 'rgba(22,163,74,0.1)',  text: '#16A34A' },
  paused:         { label: 'Paused',         bg: 'rgba(107,98,89,0.1)',  text: '#8B8178' },
  sold_out:       { label: 'Sold Out',       bg: 'rgba(107,98,89,0.1)',  text: '#8B8178' },
  rejected:       { label: 'Rejected',       bg: 'rgba(239,68,68,0.06)', text: '#EF4444' },
  expired:        { label: 'Expired',        bg: 'rgba(107,98,89,0.08)', text: '#6B6259' },
};

interface Listing {
  id: string;
  project_name: string;
  credit_type: string;
  registry: string;
  methodology: string;
  country: string;
  available_tonnes: number;
  price_per_tonne: number;
  quality_rating: string;
  corsia_eligible: boolean;
  nrcc_eligible: boolean;
  status: ListingStatus;
  is_cb_direct: boolean;
  created_at: string;
  seller?: { company_name: string } | null;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ListingStatus>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    try {
      // Admin can see all listings via the PATCH endpoint's admin check
      const res = await fetch('/api/listings?seller=me');
      // For admin, we use a dedicated admin listings query
      const adminRes = await fetch('/api/admin/listings');
      if (adminRes.ok) {
        const data = await adminRes.json();
        setListings(data.listings || []);
      }
    } catch {
      // graceful fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(listingId: string) {
    const res = await fetch(`/api/listings?id=${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    if (res.ok) {
      setActionFeedback('Listing approved and set to active.');
      fetchListings();
    } else {
      const data = await res.json();
      setActionFeedback(`Error: ${data.error}`);
    }
  }

  async function handleReject(listingId: string, reason: string) {
    const res = await fetch(`/api/listings?id=${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
    });
    if (res.ok) {
      setActionFeedback('Listing rejected.');
      fetchListings();
    }
  }

  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter);
  const pendingCount = listings.filter(l => l.status === 'pending_review').length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#F2ECE0', marginBottom: '4px' }}>Listings</h1>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B8A74' }}>
          {listings.length} total
          {pendingCount > 0 && <span style={{ color: '#F59E0B', marginLeft: '8px' }}>· {pendingCount} pending review</span>}
        </p>
      </div>

      {actionFeedback && (
        <div style={{ background: 'rgba(45,106,79,0.12)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontFamily: bg, fontSize: '13px', color: '#8AAA92' }}>
          {actionFeedback}
          <button onClick={() => setActionFeedback(null)} style={{ marginLeft: '12px', color: '#6B8A74', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', 'pending_review', 'active', 'paused', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              fontFamily: bg, fontSize: '12px', fontWeight: filter === s ? 600 : 400,
              padding: '5px 14px', borderRadius: '20px', cursor: 'pointer',
              background: filter === s ? 'rgba(201,169,110,0.15)' : 'transparent',
              border: filter === s ? '1px solid rgba(201,169,110,0.35)' : '1px solid rgba(138,170,146,0.15)',
              color: filter === s ? '#C9A96E' : '#6B8A74',
            }}
          >
            {s === 'all' ? `All (${listings.length})` : `${STATUS_CONFIG[s as ListingStatus]?.label || s} (${listings.filter(l => l.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B8A74', fontFamily: bg, fontSize: '14px' }}>
          Loading listings from database...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B8A74', fontFamily: bg, fontSize: '14px' }}>
          No listings in this category.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                {['Project', 'Seller', 'Registry', 'Type', 'Available (t)', 'Price/t', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ fontFamily: bg, fontSize: '11px', color: '#6B8A74', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '8px 12px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(listing => {
                const sc = STATUS_CONFIG[listing.status] || { label: listing.status, bg: 'transparent', text: '#8AAA92' };
                return (
                  <tr key={listing.id} style={{ borderBottom: '1px solid rgba(201,169,110,0.04)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#C4B8A8', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {listing.project_name}
                      {listing.is_cb_direct && <span style={{ marginLeft: '4px', fontSize: '10px', color: '#C9A96E' }}>CB Direct</span>}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>{listing.seller?.company_name || '—'}</td>
                    <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '11px', color: '#8AAA92' }}>{listing.registry}</td>
                    <td style={{ padding: '10px 12px', fontFamily: bg, fontSize: '12px', color: '#8AAA92' }}>{listing.credit_type}</td>
                    <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#D4C9BA' }}>{listing.available_tonnes?.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontFamily: mono, fontSize: '12px', color: '#C9A96E' }}>${listing.price_per_tonne}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {listing.status === 'pending_review' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            style={{ fontFamily: bg, fontSize: '11px', color: '#22C55E', background: 'rgba(22,197,94,0.08)', border: '1px solid rgba(22,197,94,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) handleReject(listing.id, reason);
                            }}
                            style={{ fontFamily: bg, fontSize: '11px', color: '#EF4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
