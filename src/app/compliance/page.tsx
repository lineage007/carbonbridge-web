import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell, Hero, Body, Section, P, Bullets, Cta, Eyebrow, fr, bg, mono } from './_components/Explainer';

const URL = 'https://carbonbridge.ae/compliance';
const REVIEWED = '19 September 2026';

export const metadata: Metadata = {
  title: 'Carbon compliance explainers for the Gulf: CORSIA, EU CBAM, UAE NRCC',
  description:
    'Plain-language explainers on the three carbon regimes a Gulf business is most likely to meet: ICAO\'s CORSIA for international aviation, the EU\'s Carbon Border Adjustment Mechanism for exporters, and the UAE National Register for Carbon Credits. Who is caught, what it costs, which dates matter, and where carbon credits do and do not help.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    title: 'Carbon compliance explainers for the Gulf: CORSIA, EU CBAM, UAE NRCC',
    description:
      'Who is caught, what it costs, which dates matter, and where carbon credits do and do not help. Three explainers for Gulf businesses.',
    siteName: 'CarbonBridge',
    locale: 'en_AE',
  },
};

interface Explainer {
  href: string;
  eyebrow: string;
  title: string;
  summary: string;
  creditsRole: string;
  nextDate: string;
  reviewed: string;
}

const explainers: Explainer[] = [
  {
    href: '/compliance/corsia',
    eyebrow: 'International aviation',
    title: 'CORSIA: the 2027 mandatory phase',
    summary:
      'Who has to offset, the 85%-of-2019 baseline, how the requirement is calculated, which credits are eligible and why most are not, and the 31 January 2028 deadline for the 2024 to 2026 period.',
    creditsRole: 'Credits are the compliance instrument, if eligible',
    nextDate: '1 Jan 2027 · units due 31 Jan 2028',
    reviewed: '19 Sep 2026',
  },
  {
    href: '/compliance/eu-cbam',
    eyebrow: 'Exports to the European Union',
    title: 'EU CBAM: what changed in 2026',
    summary:
      'The importer files and the exporter sets the bill. Covered goods, the 50-tonne threshold, certificate sales from February 2027, the first declaration in September 2027, and why voluntary credits cannot be surrendered.',
    creditsRole: 'Credits cannot be used',
    nextDate: '1 Feb 2027 · first declaration 30 Sep 2027',
    reviewed: '14 Sep 2026',
  },
  {
    href: '/compliance/uae-nrcc',
    eyebrow: 'UAE federal register',
    title: 'UAE NRCC and the Climate Change Law',
    summary:
      'Cabinet Resolution 67 of 2024 and Federal Decree-Law 11 of 2024: the three tiers of obligation, who must register, what the end of the adjustment period on 30 May 2026 did and did not mean, and the penalties.',
    creditsRole: 'Registered credits, for designated entities',
    nextDate: 'In force',
    reviewed: '14 Sep 2026',
  },
];

function Card({ e }: { e: Explainer }) {
  return (
    <Link
      href={e.href}
      style={{
        display: 'block',
        background: '#fff',
        border: '1px solid #E8E2D6',
        borderRadius: '16px',
        padding: '26px 26px 22px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Eyebrow>{e.eyebrow}</Eyebrow>
      <h2 style={{ fontFamily: fr, fontSize: '24px', fontWeight: 600, color: '#1A1714', lineHeight: 1.2, marginBottom: '10px' }}>{e.title}</h2>
      <p style={{ fontFamily: bg, fontSize: '14.5px', color: '#3D3830', lineHeight: 1.7, marginBottom: '16px' }}>{e.summary}</p>
      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: '14px', rowGap: '6px', margin: 0, fontFamily: bg, fontSize: '13px' }}>
        <dt style={{ color: '#8B8178' }}>Carbon credits</dt>
        <dd style={{ margin: 0, color: '#1B3A2D', fontWeight: 600 }}>{e.creditsRole}</dd>
        <dt style={{ color: '#8B8178' }}>Next date</dt>
        <dd style={{ margin: 0, fontFamily: mono, color: '#1B3A2D' }}>{e.nextDate}</dd>
        <dt style={{ color: '#8B8178' }}>Reviewed</dt>
        <dd style={{ margin: 0, fontFamily: mono, color: '#8B8178' }}>{e.reviewed}</dd>
      </dl>
      <span style={{ display: 'inline-block', marginTop: '18px', fontFamily: bg, fontSize: '13px', fontWeight: 700, color: '#2D5A3F' }}>Read the explainer →</span>
    </Link>
  );
}

export default function ComplianceIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Carbon compliance explainers for the Gulf',
    url: URL,
    description: metadata.description as string,
    inLanguage: 'en-AE',
    publisher: { '@type': 'Organization', name: 'CarbonBridge', url: 'https://carbonbridge.ae' },
    hasPart: explainers.map((e) => ({ '@type': 'Article', name: e.title, url: `https://carbonbridge.ae${e.href}` })),
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero
        eyebrow="Compliance explainers"
        title={<>Three carbon regimes.<br />Three different answers.</>}
        standfirst="A Gulf business can be inside all three of these at once, and carbon credits play a different role in each: the compliance instrument for aviation under CORSIA, useless against the EU's border charge, and a registered asset under the UAE's own law. These pages say which is which, in plain language, with the primary sources linked."
        reviewed={REVIEWED}
      />

      <Body>
        <div style={{ display: 'grid', gap: '18px', marginBottom: '56px' }}>
          {explainers.map((e) => (
            <Card key={e.href} e={e} />
          ))}
        </div>

        <Section id="how-to-read" eyebrow="How to use these" title="Start from the question, not the regulation">
          <Bullets
            items={[
              <><strong>&quot;We export aluminium, steel, cement or fertiliser to Europe.&quot;</strong> Read <Link href="/compliance/eu-cbam" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>EU CBAM</Link> first. Your customer pays; your verified emissions data sets what they pay; no credit reduces it.</>,
              <><strong>&quot;We operate, lease, fuel or supply international flights.&quot;</strong> Read <Link href="/compliance/corsia" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>CORSIA</Link>. The obligation is real from 2027 for everyone, and only host-country-authorised credits satisfy it.</>,
              <><strong>&quot;We are a large UAE emitter, or we trade credits in the UAE.&quot;</strong> Read <Link href="/compliance/uae-nrcc" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>UAE NRCC</Link>. Registration, reporting and the federal register are already in force.</>,
              <><strong>&quot;We have a net-zero or carbon-neutral commitment.&quot;</strong> None of the three regimes is your obligation, and none of them forbids voluntary credits. What matters is that a credit bought for a voluntary claim is never presented as compliance, and that a claim follows a recognised framework.</>,
            ]}
          />
          <P>
            Each explainer carries a review date, a not-advice notice and links to the primary text. When a date or threshold
            changes, the page is updated and the review date moves; if the review date is old, check the source before relying on it.
          </P>
        </Section>

        <Cta
          title="Not sure which of these applies to you?"
          text="Tell us what you make, where you sell it and how it travels. We will say which regime is your problem, which is your customer's, and where verified credits legitimately fit."
        />
      </Body>
    </Shell>
  );
}
