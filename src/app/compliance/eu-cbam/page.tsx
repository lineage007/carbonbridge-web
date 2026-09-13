import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shell, Hero, Body, Section, P, H3, Bullets, Callout, KeyDates, Faq, Cta, Sources, bg,
  faqJsonLd, articleJsonLd, type FaqItem, type KeyDate,
} from '../_components/Explainer';

const URL = 'https://carbonbridge.ae/compliance/eu-cbam';
const REVIEWED = '14 September 2026';

export const metadata: Metadata = {
  title: 'EU CBAM for UAE and GCC exporters: what changed in 2026',
  description:
    'The EU Carbon Border Adjustment Mechanism entered its definitive period on 1 January 2026. Who pays, which goods are covered, the 2026–2027 dates, why voluntary carbon credits cannot be used against CBAM, and what a Gulf producer can do about the cost.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'article',
    url: URL,
    title: 'EU CBAM for UAE and GCC exporters: what changed in 2026',
    description:
      'Who pays, which goods are covered, the 2026–2027 dates, and why carbon credits cannot be surrendered against CBAM. A plain-language explainer for Gulf producers.',
    siteName: 'CarbonBridge',
    locale: 'en_AE',
  },
};

const keyDates: KeyDate[] = [
  { date: '1 Oct 2023', what: 'Transitional period began: quarterly CBAM reports by EU importers, no payment.', note: 'Ended 31 December 2025.' },
  { date: '1 Jan 2026', what: 'Definitive period began. Only authorised CBAM declarants may import CBAM goods above the threshold; embedded emissions for 2026 imports now carry a cost.' },
  { date: '31 Mar 2026', what: 'Cut-off for importers who applied for authorisation in time to keep importing while their application was decided.' },
  { date: '1 Feb 2027', what: 'Sale of CBAM certificates begins through the EU CBAM registry. Certificates cover emissions embedded in goods imported from 1 January 2026.' },
  { date: '30 Sep 2027', what: 'First annual CBAM declaration due, covering calendar-year 2026 imports, with the matching certificates surrendered.', note: 'Moved from 31 May by the 2025 simplification regulation. Repeats every year.' },
  { date: '2026 → 2034', what: 'The share of embedded emissions actually charged rises each year as free allocation under the EU ETS is withdrawn for the same sectors, reaching 100% in 2034.' },
];

const faqs: FaqItem[] = [
  {
    q: 'Does a UAE exporter pay CBAM directly?',
    a: 'No. The legal obligation sits with the importer in the EU, who must be an authorised CBAM declarant, buy certificates and file the annual declaration. In practice the cost is negotiated back into the price the exporter receives, and the exporter controls the single biggest input: verified data on the emissions embedded in each product.',
  },
  {
    q: 'Which UAE exports are affected?',
    a: 'CBAM covers cement, iron and steel, aluminium, fertilisers, electricity and hydrogen, together with listed precursors and some downstream products such as certain steel and aluminium articles. For the Gulf the exposed flows are principally primary aluminium and aluminium products, steel, and nitrogen fertilisers shipped to EU customers.',
  },
  {
    q: 'Can carbon credits be used to reduce a CBAM bill?',
    a: 'No. Voluntary carbon credits such as Verra VCUs or Gold Standard credits cannot be surrendered against CBAM and are not deducted from it. The only deduction the Regulation allows is for a carbon price effectively paid in the country where the goods were produced. Anyone offering you credits to "offset your CBAM liability" is describing something the mechanism does not permit.',
  },
  {
    q: 'What is the 50-tonne threshold?',
    a: 'Under the October 2025 simplification regulation, an EU importer that brings in no more than 50 tonnes of CBAM goods (other than electricity and hydrogen) in a calendar year is outside the mechanism altogether. The threshold is per importer, not per exporter, so a Gulf producer with many small EU customers may find some of them exempt and the large ones fully in scope.',
  },
  {
    q: 'How is the certificate price set?',
    a: 'CBAM certificate prices are derived from the price of EU Emissions Trading System allowances, averaged over a period fixed in the Regulation. The cost of a shipment is therefore the verified embedded emissions, less any free-allocation adjustment for that year, multiplied by a price that moves with the EU carbon market.',
  },
  {
    q: 'Do indirect (electricity) emissions count?',
    a: 'It depends on the product. For iron and steel, aluminium and hydrogen, only direct emissions from the production process are charged in the current phase. For cement and fertilisers, indirect emissions from the electricity consumed are included as well. The Commission has signalled that indirect emissions for the remaining sectors are a matter for a later review.',
  },
];

const sources = [
  { label: 'Regulation (EU) 2023/956 establishing a carbon border adjustment mechanism (EUR-Lex)', href: 'https://eur-lex.europa.eu/eli/reg/2023/956/oj' },
  { label: 'Regulation (EU) 2025/2083 amending the CBAM Regulation (simplification, 50-tonne threshold, revised timeline)', href: 'https://eur-lex.europa.eu/eli/reg/2025/2083/oj' },
  { label: 'European Commission — Carbon Border Adjustment Mechanism (guidance, default values, registry)', href: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en' },
];

export default function EuCbamPage() {
  const jsonLd = [
    articleJsonLd({
      url: URL,
      headline: 'EU CBAM for UAE and GCC exporters: what changed in 2026',
      description: metadata.description as string,
      published: '2026-09-14',
      modified: '2026-09-14',
    }),
    faqJsonLd(faqs),
  ];

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero
        eyebrow="Compliance explainer · EU CBAM"
        title={<>The EU carbon border charge,<br />explained for Gulf exporters</>}
        standfirst="The Carbon Border Adjustment Mechanism stopped being a reporting exercise on 1 January 2026. This page sets out who pays, which goods are caught, the dates that matter through 2027, what the mechanism refuses to accept, and the decisions a UAE or GCC producer can still take."
        reviewed={REVIEWED}
      />

      <Body>
        <Section id="what" eyebrow="The mechanism" title="What CBAM is, in one paragraph">
          <P>
            CBAM is a charge levied by the European Union on the greenhouse-gas emissions embedded in certain imported goods.
            It exists to put imports on the same carbon-cost footing as EU producers, who pay for their emissions through the
            EU Emissions Trading System (ETS). Regulation (EU) 2023/956 created it; Regulation (EU) 2025/2083, adopted in
            October 2025, simplified it and re-timed the first payments. Nothing about it is voluntary for goods in scope, and
            nothing about it can be settled with carbon credits.
          </P>
          <P>
            The goods covered are cement, iron and steel, aluminium, fertilisers, electricity and hydrogen, plus a list of
            precursors and downstream articles made from them. For the Gulf, the flows that matter are primary aluminium and
            aluminium products, steel, and nitrogen-based fertilisers sold into the EU.
          </P>
        </Section>

        <Section id="who-pays" eyebrow="Who pays" title="The importer files. The exporter sets the bill.">
          <P>
            The legal obligation belongs to the EU importer, who must be registered as an authorised CBAM declarant, buy CBAM
            certificates, and file an annual declaration. A producer in Jebel Ali or Ruwais never files anything with the EU.
          </P>
          <P>
            That is not the same as being unaffected. Three things flow back to the exporter:
          </P>
          <Bullets
            items={[
              <><strong>Price.</strong> The importer&apos;s certificate cost is a known, per-tonne number and will be negotiated into contracts, either as a lower price to the exporter or as an explicit CBAM line.</>,
              <><strong>Data.</strong> The declaration is built from installation-level embedded-emissions data. If the exporter cannot supply verified actual values, the importer falls back on default values published by the Commission, which are set conservatively and rarely flatter an efficient plant.</>,
              <><strong>Customer choice.</strong> Where two suppliers offer the same alloy at the same price, the one with lower verified embedded emissions is cheaper to import. Emissions intensity has become a commercial attribute.</>,
            ]}
          />
        </Section>

        <Section id="dates" eyebrow="Timeline" title="The dates that matter">
          <KeyDates rows={keyDates} caption="Dates as set by Regulation (EU) 2023/956 as amended by Regulation (EU) 2025/2083. Confirm against the Commission's current guidance before relying on any of them for a filing." />
          <P>
            The 2025 amendment also introduced a de minimis rule: an importer bringing in no more than 50 tonnes of CBAM goods
            (electricity and hydrogen excepted) in a calendar year is outside the mechanism. The threshold is per importer,
            so a Gulf producer with many small EU customers should expect a mixed picture, with the large accounts fully in scope.
          </P>
        </Section>

        <Section id="cost" eyebrow="The arithmetic" title="How the cost is built">
          <P>For each product line, the importer&apos;s certificate obligation is, in outline:</P>
          <Callout title="Embedded emissions × CBAM factor × certificate price" tone="forest">
            <strong>Embedded emissions</strong> are the verified direct emissions per tonne of product from the producing installation
            (plus indirect electricity emissions for cement and fertilisers). <strong>The CBAM factor</strong> is the share of those
            emissions actually charged in a given year, rising from a small fraction in 2026 to 100% in 2034 as EU producers lose
            their free ETS allocation. <strong>The certificate price</strong> tracks the EU ETS allowance price, averaged as the
            Regulation prescribes. A carbon price already effectively paid in the country of origin is deducted.
          </Callout>
          <P>
            Two consequences follow. First, the charge is small in 2026 and 2027 but is designed to grow every year; contracts
            signed today for multi-year supply should model the full schedule, not this year&apos;s factor. Second, the deduction for a
            carbon price paid at origin is the only lever a government can pull on behalf of its exporters. The UAE has a national
            carbon-credit register and a climate law, but at the date of this page it has not put in force a domestic carbon
            price that a CBAM declarant could claim as a deduction. That may change; the register itself is not a price.
          </P>
        </Section>

        <Section id="credits" eyebrow="A common misunderstanding" title="Carbon credits do not settle CBAM">
          <P>
            CarbonBridge is a marketplace for verified carbon credits, so we have an interest in being precise here. CBAM
            certificates are issued only by the EU registry and are not carbon credits. Voluntary credits, whether from Verra,
            Gold Standard, ACR or any national register, cannot be surrendered against a CBAM declaration and do not reduce the
            certificates an importer must buy.
          </P>
          <Callout title="If someone offers you credits to offset your CBAM bill, walk away.">
            The Regulation recognises one deduction: a carbon price effectively paid in the country of production. It does not
            recognise offsets. Credits still have a legitimate place in a Gulf producer&apos;s plan, for voluntary net-zero commitments,
            for customer-facing claims made under a recognised framework, or for CORSIA if the producer is an airline, but that is
            a separate decision with separate rules, and it should never be sold to you as CBAM relief.
          </Callout>
        </Section>

        <Section id="actions" eyebrow="What to do" title="Six moves for a UAE or GCC producer">
          <H3>1. Map exposure by customer, not by product</H3>
          <P>List EU customers, annual tonnage to each, and whether each is likely above the 50-tonne threshold. This tells you which relationships carry a CBAM conversation and which do not.</P>
          <H3>2. Produce installation-level embedded-emissions data</H3>
          <P>The Commission&apos;s methodology defines system boundaries, precursors and reporting periods. Build the calculation per installation and per product, and keep the evidence trail; the numbers will be verified.</P>
          <H3>3. Get the data verified by an accredited verifier</H3>
          <P>Actual values used in a declaration must be verified. An exporter that hands its customers a verified dataset removes their need to fall back on default values and removes a reason to look for another supplier.</P>
          <H3>4. Register the installation in the EU CBAM registry as a third-country operator</H3>
          <P>Operators outside the EU can register and share verified installation data directly with their importers through the registry, rather than re-sending spreadsheets to every customer.</P>
          <H3>5. Model the full 2026–2034 schedule in contracts</H3>
          <P>Decide, in writing, whether CBAM cost sits with the buyer, the seller or is shared, and how it is recalculated as the CBAM factor and the ETS price change. Silence in a supply agreement becomes a dispute in 2027.</P>
          <H3>6. Treat emissions intensity as a product specification</H3>
          <P>Where the production route allows it, lower direct emissions per tonne, and for cement and fertilisers, lower-carbon electricity, reduce the importer&apos;s bill directly. That is a decarbonisation case with an invoice attached.</P>
        </Section>

        <Section id="carbonbridge" eyebrow="Where we fit" title="What CarbonBridge does and does not do here">
          <P>
            We do not sell CBAM certificates; nobody outside the EU registry does. We do not file declarations for importers.
            What we do is help Gulf producers and their EU counterparties separate the two questions that keep being confused:
            what CBAM will actually cost, and what verified carbon credits are legitimately for.
          </P>
          <Bullets
            items={[
              <>Compliance mapping on every listing, so a credit bought for a voluntary commitment is never mistaken for CBAM relief.</>,
              <>Managed procurement for organisations that also carry CORSIA or voluntary net-zero obligations alongside their CBAM exposure.</>,
              <>Emissions and compliance tracking in <Link href="/carbon-management" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Carbon Management</Link>, where CBAM exposure sits next to the obligations credits can address.</>,
              <>A companion explainer on the UAE side of the ledger: <Link href="/compliance/uae-nrcc" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>the National Register for Carbon Credits and the Climate Change Law</Link>.</>,
            ]}
          />
        </Section>

        <Section id="faq" eyebrow="Questions" title="Frequently asked">
          <Faq items={faqs} />
        </Section>

        <Cta
          title="Working out what CBAM means for your exports?"
          text="Tell us the products and the EU customers involved. We will say plainly which parts are a CBAM problem, which parts a carbon-credit decision, and which parts neither."
        />

        <Sources items={sources} />
        <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6, marginTop: '20px' }}>
          This page is general information about a regulation that is still being implemented, and it is not legal, tax or customs advice.
          Dates and thresholds are as published at the review date above; the Regulation and the Commission&apos;s implementing acts control.
          Take advice on your own facts before relying on any of it for a filing or a contract.
        </p>
      </Body>
    </Shell>
  );
}
