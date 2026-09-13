import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shell, Hero, Body, Section, P, H3, Bullets, Callout, KeyDates, Faq, Cta, Sources, bg,
  faqJsonLd, articleJsonLd, type FaqItem, type KeyDate,
} from '../_components/Explainer';

const URL = 'https://carbonbridge.ae/compliance/uae-nrcc';
const REVIEWED = '14 September 2026';

export const metadata: Metadata = {
  title: 'UAE NRCC and the Climate Change Law: who must report, and when',
  description:
    'The UAE National Register for Carbon Credits (Cabinet Resolution No. 67 of 2024) and Federal Decree-Law No. 11 of 2024 explained: the 500,000 tCO2e registration threshold, what the 30 May 2026 date actually was, MRV obligations, penalties, and what UAE companies should do now.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'article',
    url: URL,
    title: 'UAE NRCC and the Climate Change Law: who must report, and when',
    description:
      'The National Register for Carbon Credits and the Climate Change Law explained for UAE companies: thresholds, dates, MRV, penalties, and what to do now.',
    siteName: 'CarbonBridge',
    locale: 'en_AE',
  },
};

const keyDates: KeyDate[] = [
  { date: '28 Dec 2024', what: 'Cabinet Resolution No. 67 of 2024 concerning the National Register for Carbon Credits takes effect.', note: 'Establishes the NRCC under the Ministry of Climate Change and Environment (MOCCAE).' },
  { date: '30 May 2025', what: 'Federal Decree-Law No. 11 of 2024 on the Reduction of Climate Change Effects enters into force.', note: 'Applies to all emissions sources in the UAE, including free zones.' },
  { date: '28 Jun 2025', what: 'End of the six-month period for entities at or above 500,000 tCO2e a year to regularise their position under the NRCC resolution.' },
  { date: '15 Oct 2025', what: 'MOCCAE launches the Integrated Emissions Quantification Tool (IEQT), the national MRV platform, at GITEX Global.' },
  { date: '30 May 2026', what: 'End of the one-year period the Decree-Law gave existing sources to adjust their position.', note: 'A transitional date, not a recurring annual filing deadline. Reporting deadlines come from the authority that designates you.' },
  { date: 'From 2027', what: 'Abu Dhabi facility-level MRV moves to mandatory third-party verification for 2026 data, on the emirate’s own calendar-year cycle.' },
];

const faqs: FaqItem[] = [
  {
    q: 'What is the UAE NRCC?',
    a: 'The National Register for Carbon Credits is the federal register created by Cabinet Resolution No. 67 of 2024 and overseen by the Ministry of Climate Change and Environment. It is the national infrastructure for registering emitters, recording verified emissions, and registering and tracking carbon credits and the platforms that trade them. It is a register, not an emissions trading scheme: there is no cap and no allowance price.',
  },
  {
    q: 'Who has to register with the NRCC?',
    a: 'Registration is mandatory for entities whose combined Scope 1 and Scope 2 emissions reach 500,000 tonnes of CO2-equivalent a year, and for platforms that trade carbon credits. Entities below the threshold may register voluntarily. Mandatory registrants report annually using Greenhouse Gas Protocol methods and have the report verified by an accredited third party.',
  },
  {
    q: 'Was 30 May 2026 a filing deadline?',
    a: 'No. It was the end of the one-year period that Federal Decree-Law No. 11 of 2024 gave existing emissions sources to adjust their position after the law took effect on 30 May 2025. Actual reporting periods, formats and deadlines are set by MOCCAE or the competent emirate or free-zone authority when it designates an entity as a source. Treat any date you have not received in writing from that authority as unconfirmed.',
  },
  {
    q: 'Does the Climate Change Law apply to companies in free zones?',
    a: 'Yes. The Decree-Law applies to all public and private legal persons and individual enterprises whose activities release greenhouse gases in the UAE, and it states expressly that this includes free zones. Financial free zones such as DIFC and ADGM are not carved out.',
  },
  {
    q: 'What are the penalties?',
    a: 'Under the Decree-Law, administrative fines run from AED 50,000 to AED 2,000,000 per violation, doubled for a repeat violation within two years. Under the NRCC resolution, fines rise through AED 500,000, AED 1,000,000 and AED 2,000,000 for first, second and subsequent violations, and a trading platform’s registration can be suspended or cancelled.',
  },
  {
    q: 'Do I need to buy carbon credits to comply?',
    a: 'Not as such. The obligations are to measure, report and reduce. Carbon offsetting is listed among the reduction measures a source may use, alongside energy efficiency, clean energy, carbon capture and others, but the law sets no offset quota and buying credits does not replace reporting. Where credits are used, their quality, registry and retirement evidence are what a verifier will ask to see.',
  },
];

const sources = [
  { label: 'Cabinet Resolution No. (67) of 2024 concerning the National Register for Carbon Credits (UAE Legislation portal)', href: 'https://uaelegislation.gov.ae/en/legislations' },
  { label: 'Federal Decree-Law No. (11) of 2024 on the Reduction of Climate Change Effects (UAE Legislation portal)', href: 'https://uaelegislation.gov.ae/en/legislations' },
  { label: 'Ministry of Climate Change and Environment — climate change and MRV guidance', href: 'https://www.moccae.gov.ae/' },
];

export default function UaeNrccPage() {
  const jsonLd = [
    articleJsonLd({
      url: URL,
      headline: 'UAE NRCC and the Climate Change Law: who must report, and when',
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
        eyebrow="Compliance explainer · UAE NRCC"
        title={<>The UAE carbon register and climate law,<br />without the jargon</>}
        standfirst="Two federal instruments now govern how UAE companies measure, report and reduce their emissions. They are routinely confused with each other, and one widely quoted date was never the deadline it was made out to be. This page separates them, states who is in scope, and lists what to do next."
        reviewed={REVIEWED}
      />

      <Body>
        <Section id="two-instruments" eyebrow="Start here" title="Two instruments, two different jobs">
          <P>
            <strong>Federal Decree-Law No. 11 of 2024 on the Reduction of Climate Change Effects</strong> is the Climate Change Law.
            It entered into force on 30 May 2025 and applies to every &ldquo;source&rdquo; of greenhouse-gas emissions in the country,
            public or private, mainland or free zone. It obliges sources to measure their emissions, keep records for at least five
            years, report periodically to the Ministry of Climate Change and Environment (MOCCAE) in the form it prescribes, and
            implement reduction measures.
          </P>
          <P>
            <strong>Cabinet Resolution No. 67 of 2024 concerning the National Register for Carbon Credits</strong> created the NRCC.
            In force since 28 December 2024, it makes registration mandatory for large emitters and for carbon-credit trading
            platforms, sets an annual verified-reporting duty for them, and provides the register on which carbon credits and their
            transactions are recorded. It is the market-infrastructure half of the picture.
          </P>
          <Callout title="The NRCC is a register, not a carbon price." tone="forest">
            There is no national cap on emissions and no allowance that a UAE company must buy or surrender. The NRCC records
            emitters, verified emissions and credits. That matters for two reasons: a UAE company does not face an ETS-style bill,
            and, because the register is not a carbon price, it does not by itself give UAE exporters a deduction under the EU&apos;s
            border mechanism. See our <Link href="/compliance/eu-cbam" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>EU CBAM explainer</Link> for that side.
          </Callout>
        </Section>

        <Section id="scope" eyebrow="Who is in scope" title="Three tiers of obligation">
          <H3>Tier 1 — 500,000 tCO2e and above: NRCC registration is mandatory</H3>
          <P>
            An entity whose combined Scope 1 and Scope 2 emissions reach 500,000 tonnes of CO2-equivalent in a year must register
            on the NRCC, report annually using Greenhouse Gas Protocol methods, and have that report verified by an accredited
            third party. Existing entities had until 28 June 2025 to regularise. In the UAE this tier is dominated by power and
            water, oil and gas, aluminium, steel, cement, petrochemicals and aviation.
          </P>
          <H3>Tier 2 — designated sources under the Climate Change Law</H3>
          <P>
            The Decree-Law contains no size threshold of its own. Its MRV obligations attach once MOCCAE, or the competent emirate
            or free-zone authority for climate affairs, designates an entity as a source and tells it what to report, how and by
            when. Abu Dhabi already runs a facility-level scheme through the Environment Agency for facilities at or above 25,000
            tCO2e of Scope 1 emissions a year, on a calendar-year cycle with third-party verification becoming mandatory for 2026
            data. Other emirates and free zones are expected to follow with their own designations.
          </P>
          <H3>Tier 3 — everyone else</H3>
          <P>
            Any business that emits at all is a source in principle, and any entity may register with the NRCC voluntarily. Below
            the designation line the practical obligation today is to be able to produce a defensible Scope 1 and Scope 2
            inventory when a regulator, a lender, a listed customer or an EU importer asks for one. Most will ask before the
            ministry does.
          </P>
        </Section>

        <Section id="dates" eyebrow="Timeline" title="The dates that matter">
          <KeyDates rows={keyDates} caption="Dates as published in the Decree-Law, the Cabinet Resolution and MOCCAE announcements. Reporting deadlines for a specific entity come from its designating authority and are not listed here." />
        </Section>

        <Section id="may-2026" eyebrow="A correction" title="What 30 May 2026 was, and was not">
          <P>
            Much of the market, this site included, described 30 May 2026 as the first compliance deadline under the climate law.
            That is not what the law says. The Decree-Law gave existing sources one year from its entry into force to adjust their position;
            30 May 2026 was the end of that transitional year. It was not a universal annual filing date, and its passing did not
            create a retroactive reporting obligation for companies that have not been designated.
          </P>
          <P>
            What the date did do is close the grace period. From here on, a company that is designated as a source is expected to be
            ready, and a Tier 1 emitter that has not registered on the NRCC is late by more than a year. The correct question for
            any UAE company now is not &ldquo;did we miss May 2026&rdquo; but &ldquo;which authority designates us, on what cycle,
            and can we evidence our inventory when it does.&rdquo;
          </P>
        </Section>

        <Section id="penalties" eyebrow="Enforcement" title="Penalties">
          <Bullets
            items={[
              <><strong>Climate Change Law:</strong> administrative fines from AED 50,000 to AED 2,000,000 per violation, doubled for a repeat within two years, in addition to any other penalty in other laws.</>,
              <><strong>NRCC resolution:</strong> fines of up to AED 500,000 for a first violation, AED 1,000,000 for a second and AED 2,000,000 thereafter; a trading platform&apos;s registration may be suspended or cancelled.</>,
              <><strong>Records:</strong> emissions records must be retained for at least five years and produced on request.</>,
            ]}
          />
        </Section>

        <Section id="actions" eyebrow="What to do" title="Five moves for a UAE company">
          <H3>1. Establish which tier you are in, in writing</H3>
          <P>Compute combined Scope 1 and 2 against the 500,000 tCO2e line; check whether any facility sits in an emirate scheme; ask your free-zone authority whether it has designated sources. Record the answer and its date.</P>
          <H3>2. Build a Scope 1 and 2 inventory that a verifier would accept</H3>
          <P>Twelve months of fuel, fleet, refrigerant and process data for Scope 1; metered electricity and cooling for Scope 2; GHG Protocol boundaries; a named owner. The IEQT is the national tool for submission, and its structure is a reasonable template for the inventory itself.</P>
          <H3>3. Line up an accredited verifier before you need one</H3>
          <P>Tier 1 reporting is verified by law and emirate schemes are moving the same way. Verifier capacity in the UAE is finite and the first cycle will be crowded.</P>
          <H3>4. Write the reduction plan the law asks for</H3>
          <P>The Decree-Law expects sources to implement reduction measures and to report the ones planned and their expected results. Energy efficiency and clean-energy procurement come first; offsetting is a listed measure, not a substitute for the plan.</P>
          <H3>5. If you buy credits, buy evidence with them</H3>
          <P>Registry, methodology, vintage, quality rating and a retirement certificate in your organisation&apos;s name are what a verifier, an auditor or a customer will ask for. Credits without that trail are a liability on a compliance file.</P>
        </Section>

        <Section id="carbonbridge" eyebrow="Where we fit" title="What CarbonBridge does and does not do here">
          <P>
            We do not file reports with MOCCAE, and we are not a verifier. MOCCAE&apos;s own guidance and your designating
            authority&apos;s instructions control what you report and when. What we do is supply the part of the compliance file that a
            register expects to be clean: verified carbon credits from recognised standards, compliance-eligibility mapping on every
            listing, retirement certificates on demand, and a <Link href="/carbon-management" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Carbon Management</Link> workspace
            in which emissions, targets, credits and obligations sit in one place.
          </P>
        </Section>

        <Section id="faq" eyebrow="Questions" title="Frequently asked">
          <Faq items={faqs} />
        </Section>

        <Cta
          title="Not sure which tier you are in?"
          text="Send us your sector, headcount and a rough sense of your energy use. We will tell you plainly whether the NRCC threshold is in play, what an emirate scheme would ask for, and where credits do and do not help."
        />

        <Sources items={sources} />
        <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6, marginTop: '20px' }}>
          This page is general information about legislation whose implementing decisions are still being issued, and it is not legal
          advice. Thresholds, dates and penalties are as published at the review date above; the Decree-Law, the Cabinet Resolution and
          MOCCAE&apos;s implementing decisions control. Take advice on your own facts before relying on any of it.
        </p>
      </Body>
    </Shell>
  );
}
