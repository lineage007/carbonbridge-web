import Link from 'next/link';
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

/*
 * Shared primitives for the public compliance explainers under /compliance.
 * Server components only — no hooks, no browser APIs — so the pages are
 * statically rendered and indexable. Styling mirrors /about (Heritage Emerald).
 */

export const fr = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
export const bg = "'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif";
export const mono = "'JetBrains Mono', 'DM Mono', monospace";

export interface FaqItem {
  q: string;
  a: string;
}

export interface KeyDate {
  date: string;
  what: string;
  note?: string;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: light ? '#4A8B64' : '#2D5A3F', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
      {children}
    </span>
  );
}

export function Hero({ eyebrow, title, standfirst, reviewed }: { eyebrow: string; title: ReactNode; standfirst: string; reviewed: string }) {
  return (
    <div style={{ background: 'linear-gradient(175deg, #0C1C14, #1B3A2D 60%, #0C1C14)', padding: '80px 0 64px' }}>
      <div className="max-w-[820px] mx-auto px-4 lg:px-8">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 style={{ fontFamily: fr, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#FFFCF6', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '20px' }}>
          {title}
        </h1>
        <p style={{ fontFamily: bg, fontSize: '17px', color: '#8AAA92', lineHeight: 1.7, maxWidth: '680px' }}>{standfirst}</p>
        <p style={{ fontFamily: mono, fontSize: '11px', color: 'rgba(138,170,146,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '24px' }}>
          Last reviewed {reviewed} · General information, not legal or tax advice
        </p>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <Navbar dark={true} />
      {children}
    </main>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <div className="max-w-[820px] mx-auto px-4 lg:px-8 py-14">{children}</div>;
}

export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '56px', scrollMarginTop: '96px' }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{ fontFamily: fr, fontSize: '28px', fontWeight: 600, color: '#1A1714', marginBottom: '16px', lineHeight: 1.2 }}>{title}</h2>
      <div style={{ fontFamily: bg, fontSize: '15px', color: '#3D3830', lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p style={{ marginBottom: '14px' }}>{children}</p>;
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 style={{ fontFamily: bg, fontSize: '16px', fontWeight: 700, color: '#1A1714', marginTop: '24px', marginBottom: '8px' }}>{children}</h3>;
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ margin: '0 0 16px 0', padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ position: 'relative', paddingLeft: '20px', marginBottom: '10px' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: '13px', width: '8px', height: '1px', background: '#C9A96E' }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Callout({ title, children, tone = 'gold' }: { title: string; children: ReactNode; tone?: 'gold' | 'forest' }) {
  const border = tone === 'gold' ? 'rgba(201,169,110,0.35)' : 'rgba(45,90,63,0.35)';
  const background = tone === 'gold' ? 'rgba(201,169,110,0.08)' : 'rgba(45,90,63,0.06)';
  return (
    <div style={{ background, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px 22px', margin: '20px 0 24px' }}>
      <div style={{ fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#1B3A2D', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontFamily: bg, fontSize: '14px', color: '#3D3830', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export function KeyDates({ rows, caption }: { rows: KeyDate[]; caption: string }) {
  return (
    <div style={{ overflowX: 'auto', margin: '8px 0 20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: bg, fontSize: '14px' }}>
        <caption style={{ captionSide: 'bottom', textAlign: 'left', fontFamily: bg, fontSize: '12px', color: '#8B8178', paddingTop: '10px' }}>{caption}</caption>
        <thead>
          <tr style={{ borderBottom: '2px solid #1B3A2D' }}>
            <th scope="col" style={{ textAlign: 'left', padding: '10px 12px 10px 0', fontWeight: 700, color: '#1A1714', whiteSpace: 'nowrap' }}>Date</th>
            <th scope="col" style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#1A1714' }}>What happens</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date + r.what} style={{ borderBottom: '1px solid #E8E2D6', verticalAlign: 'top' }}>
              <td style={{ padding: '12px 12px 12px 0', fontFamily: mono, fontSize: '13px', color: '#1B3A2D', whiteSpace: 'nowrap' }}>{r.date}</td>
              <td style={{ padding: '12px', color: '#3D3830', lineHeight: 1.6 }}>
                {r.what}
                {r.note && <div style={{ fontSize: '12.5px', color: '#8B8178', marginTop: '4px' }}>{r.note}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((f) => (
        <details key={f.q} style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: '12px', padding: '16px 20px' }}>
          <summary style={{ fontFamily: fr, fontSize: '17px', fontWeight: 600, color: '#1A1714', cursor: 'pointer' }}>{f.q}</summary>
          <p style={{ fontFamily: bg, fontSize: '14px', color: '#3D3830', lineHeight: 1.7, marginTop: '10px' }}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Cta({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center" style={{ marginTop: '24px', padding: '44px 32px', background: 'linear-gradient(135deg, #0C1C14, #1B3A2D)', borderRadius: '20px' }}>
      <h2 style={{ fontFamily: fr, fontSize: '26px', fontWeight: 600, color: '#FFFCF6', marginBottom: '12px' }}>{title}</h2>
      <p style={{ fontFamily: bg, fontSize: '14px', color: '#8AAA92', maxWidth: '560px', margin: '0 auto 24px' }}>{text}</p>
      <div className="flex justify-center gap-3 flex-wrap">
        <a href="mailto:info@carbonbridge.ae" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 700, color: '#0C1C14', background: '#C9A96E', padding: '13px 28px', borderRadius: '10px' }}>Talk to the team</a>
        <Link href="/marketplace" style={{ fontFamily: bg, fontSize: '14px', fontWeight: 500, color: '#FFFCF6', border: '1px solid rgba(255,252,246,0.15)', padding: '13px 28px', borderRadius: '10px' }}>Browse verified credits</Link>
      </div>
    </div>
  );
}

export function Sources({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E8E2D6' }}>
      <div style={{ fontFamily: bg, fontSize: '11px', fontWeight: 700, color: '#8B8178', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Primary sources</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((s) => (
          <li key={s.href} style={{ fontFamily: bg, fontSize: '13px', color: '#3D3830', marginBottom: '6px' }}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{s.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleJsonLd(opts: { url: string; headline: string; description: string; published: string; modified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    datePublished: opts.published,
    dateModified: opts.modified,
    inLanguage: 'en-AE',
    author: { '@type': 'Organization', name: 'CarbonBridge', url: 'https://carbonbridge.ae' },
    publisher: { '@type': 'Organization', name: 'CarbonBridge', url: 'https://carbonbridge.ae', logo: { '@type': 'ImageObject', url: 'https://carbonbridge.ae/logo-white.png' } },
  };
}
