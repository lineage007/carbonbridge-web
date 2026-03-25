'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getProfile, updateProfile } from '@/lib/db';
import { supabase } from '@/lib/supabase';

const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export default function SettingsPage() {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploads, setUploads] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.id) getProfile(user.id).then(p => setProfile(p));
  }, [user?.id]);

  const handleChange = (field: string, value: string | string[] | boolean) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        company_name: profile.company_name,
        contact_name: profile.contact_name,
        email: profile.email,
        country: profile.country,
        company_type: profile.company_type,
        compliance_needs: profile.compliance_needs || [],
        estimated_volume: profile.estimated_volume,
        registry_accounts: profile.registry_accounts || [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Failed to save: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    if (!user?.id) return;
    const path = `seller-verification/${user.id}/${docType.replace(/\s/g, '-').toLowerCase()}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('documents').upload(path, file);
    if (error) { alert('Upload failed: ' + error.message); return; }
    setUploads(prev => ({ ...prev, [docType]: file.name }));
  };

  const handleApplySeller = async () => {
    if (!user?.id) return;
    if (Object.keys(uploads).length < 2) {
      alert('Please upload at least Company Registration and Registry Account evidence before applying.');
      return;
    }
    await updateProfile(user.id, { seller_status: 'pending' });
    alert('Seller verification submitted! Our team will review within 48 hours.');
  };

  if (!profile) return <p style={{ fontFamily: bg, padding: '40px', color: '#8A7E70' }}>Loading settings...</p>;

  return (
    <div style={{ fontFamily: bg, maxWidth: '720px' }}>
      <h1 style={{ fontFamily: fr, fontSize: '26px', color: '#1A1714', marginBottom: '24px' }}>Account Settings</h1>

      {/* Company Details */}
      <section style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '16px' }}>Company Details</h2>
        <div style={{ display: 'grid', gap: '14px' }}>
          <Field label="Company Name" value={profile.company_name || ''} onChange={v => handleChange('company_name', v)} />
          <Field label="Contact Name" value={profile.contact_name || ''} onChange={v => handleChange('contact_name', v)} />
          <Field label="Email" value={profile.email || ''} onChange={v => handleChange('email', v)} type="email" />
          <Field label="Country" value={profile.country || 'AE'} onChange={v => handleChange('country', v)} />
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#5A5248', display: 'block', marginBottom: '4px' }}>Company Type</label>
            <select value={profile.company_type || 'corporate'} onChange={e => handleChange('company_type', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5DED3', fontSize: '14px', background: '#fff' }}>
              {['corporate', 'airline', 'government', 'financial', 'developer', 'broker', 'other'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#5A5248', display: 'block', marginBottom: '4px' }}>Estimated Annual Volume</label>
            <select value={profile.estimated_volume || ''} onChange={e => handleChange('estimated_volume', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5DED3', fontSize: '14px', background: '#fff' }}>
              <option value="">Select...</option>
              <option value="under_1k">Under 1,000 tCO₂e</option>
              <option value="1k_10k">1,000 – 10,000 tCO₂e</option>
              <option value="10k_100k">10,000 – 100,000 tCO₂e</option>
              <option value="100k_plus">100,000+ tCO₂e</option>
            </select>
          </div>
        </div>
      </section>

      {/* Compliance Needs */}
      <section style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '16px' }}>Compliance Requirements</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['nrcc', 'cbam', 'corsia', 'voluntary', 'sbti'].map(need => {
            const active = (profile.compliance_needs || []).includes(need);
            return (
              <button key={need} onClick={() => {
                const current = profile.compliance_needs || [];
                handleChange('compliance_needs', active ? current.filter((n: string) => n !== need) : [...current, need]);
              }} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: active ? '2px solid #1B3A2D' : '1px solid #E5DED3',
                background: active ? '#1B3A2D' : '#fff',
                color: active ? '#F2ECE0' : '#5A5248',
              }}>{need.toUpperCase()}</button>
            );
          })}
        </div>
      </section>

      {/* Seller Verification */}
      <section style={{ background: '#FFFCF6', border: '1px solid #E5DED3', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: fr, fontSize: '18px', color: '#1A1714', marginBottom: '4px' }}>Seller Verification</h2>
        <p style={{ fontSize: '12px', color: '#8A7E70', marginBottom: '16px' }}>
          {String(profile.seller_status || "") === "approved" ? '✅ Your account is verified for selling.' : 'Upload documents to apply for seller access. Accepted: PDF, JPG, PNG (max 10MB).'}
        </p>
        {String(profile.seller_status || "") !== "approved" && (
          <>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
              {['Company Registration Certificate', 'Registry Account Screenshot', 'Credit Ownership Evidence', 'Government-issued ID (Director)'].map(doc => (
                <div key={doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', border: uploads[doc] ? '1px solid #2D6A4F' : '1px dashed #E5DED3', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1714' }}>{doc}</div>
                    <div style={{ fontSize: '11px', color: uploads[doc] ? '#2D6A4F' : '#8A7E70' }}>{uploads[doc] || 'Not uploaded'}</div>
                  </div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: uploads[doc] ? '#2D6A4F' : '#C9A96E', cursor: 'pointer', padding: '6px 16px', border: `1px solid ${uploads[doc] ? '#2D6A4F' : '#C9A96E'}`, borderRadius: '6px' }}>
                    {uploads[doc] ? '✓ Uploaded' : 'Upload'}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && handleFileUpload(doc, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
            <button onClick={handleApplySeller}
              style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#F2ECE0', background: '#1B3A2D', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
              Submit for Verification
            </button>
          </>
        )}
      </section>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        style={{ fontFamily: bg, fontSize: '15px', fontWeight: 600, color: '#F2ECE0', background: saving ? '#4A6A55' : '#1B3A2D', padding: '14px 28px', borderRadius: '10px', border: 'none', cursor: saving ? 'wait' : 'pointer', width: '100%' }}>
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#5A5248', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5DED3', fontSize: '14px', background: '#fff' }} />
    </div>
  );
}
