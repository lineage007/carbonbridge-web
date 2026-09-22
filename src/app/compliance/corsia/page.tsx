import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shell, Hero, Body, Section, P, H3, Bullets, Callout, KeyDates, Faq, Cta, Sources, bg,
  faqJsonLd, articleJsonLd, type FaqItem, type KeyDate,
} from '../_components/Explainer';

const URL = 'https://carbonbridge.ae/compliance/corsia';
const REVIEWED = '19 September 2026';

export const metadata: Metadata = {
  title: 'CORSIA for Gulf airlines and their suppliers: the 2027 phase explained',
  description:
    'ICAO\'s Carbon Offsetting and Reduction Scheme for International Aviation becomes mandatory for most States on 1 January 2027. Who has to offset, how the requirement is calculated against the 85%-of-2019 baseline, which carbon credits count, the 31 January 2028 deadline, and what an airline, a lessor or a fuel supplier in the Gulf should do now.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'article',
    url: URL,
    title: 'CORSIA for Gulf airlines and their suppliers: the 2027 phase explained',
    description:
      'Who offsets, how the requirement is calculated, which credits count, and the dates through 2028. A plain-language explainer for Gulf aviation.',
    siteName: 'CarbonBridge',
    locale: 'en_AE',
  },
};

const keyDates: KeyDate[] = [
  { date: '2016', what: 'ICAO Assembly adopts CORSIA. The rules sit in Annex 16, Volume IV to the Chicago Convention.' },
  { date: '1 Jan 2019', what: 'Monitoring, reporting and verification of CO₂ on international flights begins for every operator above the threshold, whether or not its State takes part in offsetting.' },
  { date: '2021 → 2023', what: 'Pilot phase. Offsetting applied only on routes between volunteering States. Requirements were very small because traffic collapsed in 2020 and 2021.', note: 'Units for this period had to be cancelled by 31 January 2025.' },
  { date: '2024 → 2026', what: 'First phase. Still voluntary for States; the baseline changed to 85% of 2019 emissions, so requirements are real for the first time. 2026 is the last year of this compliance period.' },
  { date: '1 Jan 2027', what: 'Second phase begins. Participation becomes mandatory for all States with international aviation activity above the thresholds, with exemptions for least-developed countries, small island and landlocked developing States, and States with very small traffic shares unless they volunteer.' },
  { date: '31 Jan 2028', what: 'Deadline for operators to cancel eligible emissions units covering the 2024 to 2026 compliance period.', note: 'Each three-year period then repeats: 2027 to 2029, 2030 to 2032, 2033 to 2035.' },
  { date: '2030 → 2035', what: 'The calculation shifts from a purely sector-wide growth factor to a blend that includes each operator\'s own growth, so efficient carriers pay proportionately less.' },
];

const faqs: FaqItem[] = [
  {
    q: 'Which airlines have to offset under CORSIA?',
    a: 'Any aircraft operator whose international flights emit more than 10,000 tonnes of CO₂ a year, flying aircraft above 5,700 kg maximum take-off mass, on routes between two States that are both participating in the scheme. From 1 January 2027 that covers most international routes worldwide, because participation becomes mandatory for all but the exempted States. Humanitarian, medical and firefighting flights are excluded, as are new entrants for a limited period.',
  },
  {
    q: 'How is an airline\'s offsetting requirement calculated?',
    a: 'ICAO publishes a sector growth factor each year: the percentage by which international aviation emissions on covered routes exceed the baseline of 85% of 2019 emissions. An operator multiplies its own verified emissions on covered routes by that factor to get its requirement. Through 2029 the factor is entirely sectoral; from 2030 a share of the operator\'s own growth is blended in, rising to 70% for 2033 to 2035. The State of the operator confirms the figure, and the operator has until 31 January after the end of each three-year period to cancel matching units.',
  },
  {
    q: 'Can any carbon credit be used for CORSIA?',
    a: 'No. Only "CORSIA eligible emissions units" count: credits issued by a programme ICAO has approved for the relevant phase, from eligible activity and vintage windows, with a letter of authorisation from the host country confirming a corresponding adjustment so the reduction is not also counted towards that country\'s own climate target. A Verra or Gold Standard credit without that authorisation is a perfectly good voluntary credit and worth nothing for a CORSIA filing.',
  },
  {
    q: 'What about sustainable aviation fuel?',
    a: 'CORSIA eligible fuels, meaning sustainable aviation fuels and lower-carbon aviation fuels that meet ICAO\'s sustainability criteria, reduce an operator\'s offsetting requirement in proportion to the verified emissions reduction they deliver. For most Gulf carriers the constraint is supply, not eligibility, which is why offsets remain the main compliance route through this decade.',
  },
  {
    q: 'Does the UAE take part?',
    a: 'The UAE has been a volunteering State since the pilot phase, and UAE operators have been monitoring, reporting and verifying their international CO₂ under CORSIA since 2019 through the General Civil Aviation Authority. From 2027 participation is no longer a choice for any Gulf State above the traffic thresholds.',
  },
  {
    q: 'Why does this matter to a company that is not an airline?',
    a: 'Three reasons. Demand: the first phase alone is expected to require on the order of a hundred million tonnes of eligible units, from a supply that was still very thin in 2025, so eligible credits trade at a premium and project developers with host-country authorisation have a distinct buyer. Contracts: lessors, fuel suppliers, ground handlers and corporate travel buyers are being asked about CORSIA exposure and eligible fuel. And claims: a corporate that buys credits an airline could have used for compliance should understand what it is and is not entitled to say about them.',
  },
];

const sources = [
  { label: 'ICAO — Carbon Offsetting and Reduction Scheme for International Aviation (CORSIA)', href: 'https://www.icao.int/environmental-protection/CORSIA/Pages/default.aspx' },
  { label: 'ICAO — CORSIA Eligible Emissions Units (approved programmes and unit eligibility by phase)', href: 'https://www.icao.int/environmental-protection/CORSIA/Pages/CORSIA-Emissions-Units.aspx' },
  { label: 'ICAO — CORSIA States for Chapter 3 State Pairs (participating States by year)', href: 'https://www.icao.int/environmental-protection/CORSIA/Pages/state-pairs.aspx' },
  { label: 'UAE General Civil Aviation Authority — environment and CORSIA', href: 'https://www.gcaa.gov.ae/' },
];

export default function CorsiaPage() {
  const jsonLd = [
    articleJsonLd({
      url: URL,
      headline: 'CORSIA for Gulf airlines and their suppliers: the 2027 phase explained',
      description: metadata.description as string,
      published: '2026-09-19',
      modified: '2026-09-19',
    }),
    faqJsonLd(faqs),
  ];

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero
        eyebrow="Compliance explainer · CORSIA"
        title={<>Aviation&apos;s carbon scheme<br />goes mandatory in 2027</>}
        standfirst="CORSIA is the only global, sector-wide carbon offsetting obligation in force, and it is the one where verified carbon credits are the compliance instrument rather than a misunderstanding. This page sets out who has to offset, how the number is calculated, which credits count, the dates through 2028, and what a Gulf airline, lessor, fuel supplier or project developer should be doing now."
        reviewed={REVIEWED}
      />

      <Body>
        <Section id="what" eyebrow="The scheme" title="What CORSIA is, in one paragraph">
          <P>
            The Carbon Offsetting and Reduction Scheme for International Aviation was adopted by the International Civil
            Aviation Organization in 2016 and is written into Annex 16, Volume IV to the Chicago Convention. Its aim is to
            hold the net CO₂ emissions of international aviation at a baseline level, now set at 85% of 2019 emissions, while
            traffic grows. Airlines do that by buying and cancelling eligible carbon credits for the growth above the baseline,
            and by using eligible lower-carbon fuels, which reduce what they have to offset. Domestic flights are outside it;
            they belong to national policy.
          </P>
          <P>
            Unlike the EU&apos;s CBAM, where{' '}
            <Link href="/compliance/eu-cbam" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>carbon credits cannot be used at all</Link>,
            CORSIA is built on them. That makes it the compliance market a Gulf carbon marketplace was made for, and the one
            where eligibility rules matter more than anywhere else.
          </P>
        </Section>

        <Section id="who" eyebrow="Who is caught" title="Operators, routes and thresholds">
          <Bullets
            items={[
              <><strong>Operators.</strong> Any aircraft operator with international CO₂ emissions above 10,000 tonnes a year, flying aircraft over 5,700 kg maximum take-off mass. Humanitarian, medical and firefighting flights are excluded; a new entrant is exempt for its first years or until it reaches a share of sector emissions.</>,
              <><strong>Routes.</strong> Offsetting applies to flights between two States that are both in the scheme. Until the end of 2026 that is the volunteering States; from 1 January 2027 it is every State except those exempted, and the exempted States may opt in.</>,
              <><strong>Monitoring is universal.</strong> Every operator above the threshold has had to monitor, report and verify its international CO₂ since 2019, whether or not its routes carry an offsetting obligation. The verified emissions report goes to the operator&apos;s State each year.</>,
              <><strong>The Gulf.</strong> The UAE has volunteered since the pilot phase; the region&apos;s hub carriers fly almost entirely international networks, so from 2027 close to all of their traffic sits inside the scheme.</>,
            ]}
          />
        </Section>

        <Section id="dates" eyebrow="Timeline" title="The dates that matter">
          <KeyDates rows={keyDates} caption="Dates as set by Annex 16, Volume IV and ICAO Assembly resolutions. Confirm against ICAO's current CORSIA documents before relying on any of them for a filing." />
        </Section>

        <Section id="cost" eyebrow="The arithmetic" title="How the requirement is built">
          <Callout title="Operator's verified emissions on covered routes × sector growth factor" tone="forest">
            <strong>Verified emissions</strong> come from the operator&apos;s own monitoring plan and a third-party verifier, and
            only flights between participating States count. <strong>The sector growth factor</strong> is published by ICAO
            each year: the percentage by which covered international emissions exceed 85% of the 2019 level. Through 2029 the
            factor is purely sectoral, so a slow-growing airline offsets the same percentage as a fast-growing one; from 2030
            an operator&apos;s own growth is blended in, reaching 70% of the calculation for 2033 to 2035. <strong>Eligible fuel</strong>
            use is deducted from the total before units are cancelled.
          </Callout>
          <P>
            Two consequences follow. First, the requirement for the 2024 to 2026 period is already largely determined by
            traffic that has flown; what remains open is the price of the units and whether enough eligible supply exists
            by 31 January 2028. Second, because the factor is sectoral until 2030, an airline cannot reduce its 2024 to 2029
            obligation by growing slowly; it can only reduce it with eligible fuel or pay for it with eligible units.
          </P>
        </Section>

        <Section id="units" eyebrow="Eligibility" title="Which credits count, and why most do not">
          <P>
            ICAO&apos;s Technical Advisory Body assesses carbon-crediting programmes against the CORSIA Emissions Unit
            Eligibility Criteria and approves them for a given phase, sometimes with conditions. For the first phase the
            American Carbon Registry and Architecture for REDD+ Transactions were approved first, and other programmes,
            including Verra&apos;s VCS, Gold Standard, Climate Action Reserve and the Global Carbon Council, followed with
            full or conditional approval for defined scopes. Programme approval is only the first gate. A unit is eligible
            only if it also:
          </P>
          <Bullets
            items={[
              <>comes from an activity and vintage inside the window ICAO sets for that phase;</>,
              <>carries a <strong>letter of authorisation</strong> from the host country under Article 6 of the Paris Agreement, with a corresponding adjustment so the reduction is not also claimed against that country&apos;s national target;</>,
              <>is issued, tracked and cancelled in a registry the programme operates to CORSIA standards, with the cancellation attributed to the operator and the compliance period;</>,
              <>has not been used, retired or cancelled for any other purpose.</>,
            ]}
          />
          <Callout title="The letter of authorisation is the scarce ingredient.">
            Most credits in the voluntary market have no host-country authorisation and never will. That is why the supply of
            CORSIA-eligible units was still very thin in 2025, why the first authorised units traded at a clear premium to
            ordinary voluntary credits, and why a project developer who can obtain authorisation from a willing host government
            has something an airline will pay for. It is also why an airline should treat any offer of &quot;CORSIA-ready&quot;
            credits without a visible letter of authorisation and registry attribution as not ready at all.
          </Callout>
        </Section>

        <Section id="actions" eyebrow="What to do" title="Five moves for Gulf aviation and its suppliers">
          <H3>1. Airlines: quantify the 2024 to 2026 requirement now, not in 2027</H3>
          <P>The verified emissions for 2024 and 2025 exist; 2026 is a forecast. Apply the published growth factors, net off any eligible fuel, and you have a tonnage to procure before 31 January 2028. Procure in tranches; the eligible market is thin and a single late order moves the price.</P>
          <H3>2. Airlines: buy eligibility, not labels</H3>
          <P>Write the four eligibility conditions above into the purchase contract, require the letter of authorisation and the registry attribution as conditions of payment, and keep the evidence for the State&apos;s compliance check.</P>
          <H3>3. Project developers: pursue host-country authorisation</H3>
          <P>A programme-approved project without a letter of authorisation sells into the voluntary market. The same project with one sells to a compliance buyer with a deadline. Engage the host government early; the process is slow and political.</P>
          <H3>4. Lessors, fuel suppliers and corporate travel buyers: know your exposure</H3>
          <P>Aircraft leases increasingly carry environmental covenants; fuel supply agreements are being asked for eligible-fuel certification; large corporate travel accounts want to know what their carrier&apos;s compliance costs will do to fares. None of these needs a credit purchase, all of them need an informed answer.</P>
          <H3>5. Everyone: keep CORSIA claims separate from voluntary claims</H3>
          <P>A unit cancelled for an airline&apos;s compliance is spent; nobody else may claim it. A corporate that buys eligible units for its own net-zero claim is taking supply the airline needed and should say so honestly in its own reporting.</P>
        </Section>

        <Section id="carbonbridge" eyebrow="Where we fit" title="What CarbonBridge does and does not do here">
          <P>
            We do not verify emissions, calculate an operator&apos;s requirement or file with any civil aviation authority.
            What we do is source and screen credits against the CORSIA eligibility conditions, so a buyer sees the
            programme, the vintage, the host-country authorisation status and the registry attribution before committing,
            and a developer with authorised units reaches the buyers who need them.
          </P>
          <Bullets
            items={[
              <>Eligibility flags on every listing, so a credit bought for CORSIA is authorised and a credit bought for a voluntary claim is not mistaken for compliance stock.</>,
              <>Managed procurement in tranches for operators facing the 31 January 2028 deadline, including forward offtake from developers seeking authorisation.</>,
              <>Emissions and obligation tracking in <Link href="/carbon-management" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Carbon Management</Link>, where a CORSIA requirement sits next to any voluntary commitment.</>,
              <>Companion explainers on the other two regimes a Gulf group may face: <Link href="/compliance/eu-cbam" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>EU CBAM</Link> and <Link href="/compliance/uae-nrcc" style={{ color: '#1B3A2D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>the UAE National Register for Carbon Credits</Link>.</>,
            ]}
          />
        </Section>

        <Section id="faq" eyebrow="Questions" title="Frequently asked">
          <Faq items={faqs} />
        </Section>

        <Cta
          title="Facing a 2028 CORSIA deadline, or holding units that could meet one?"
          text="Tell us the operator, the compliance period and the tonnage, or the project and its authorisation status. We will say plainly what is eligible, what is not, and what the market for it looks like."
        />

        <Sources items={sources} />
        <p style={{ fontFamily: bg, fontSize: '12px', color: '#8B8178', lineHeight: 1.6, marginTop: '20px' }}>
          This page is general information about an international scheme whose rules are set by ICAO and implemented by each State&apos;s
          civil aviation authority, and it is not legal, regulatory or aviation-compliance advice. Thresholds, dates and eligibility
          are as published at the review date above; Annex 16, Volume IV, ICAO&apos;s CORSIA documents and your State&apos;s regulations control.
          Take advice on your own facts before relying on any of it for a filing or a contract.
        </p>
      </Body>
    </Shell>
  );
}
