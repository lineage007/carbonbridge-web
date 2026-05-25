export const metadata = {
  title: 'Voluntary Carbon Market Risk Disclosure | CarbonBridge',
  description:
    'Honest disclosure of risks involved in purchasing voluntary carbon credits on CarbonBridge. Beta marketplace — pilot transactions only.',
};

const fr = "'Fraunces', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1B3A2D', marginBottom: '12px', lineHeight: 1.3 }}>{title}</h2>
      <div style={{ fontFamily: bg, fontSize: '14px', color: '#4A4035', lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

export default function RiskDisclosurePage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#92400E', borderRadius: '6px', padding: '6px 14px', fontFamily: bg, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Beta — Pilot Transactions Only
        </div>
        <h1 style={{ fontFamily: fr, fontSize: '32px', fontWeight: 700, color: '#1A1714', marginBottom: '10px' }}>
          Voluntary Carbon Market Risk Disclosure
        </h1>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#8A7E70', marginBottom: '8px' }}>
          Last updated: May 2026 · CarbonBridge Ltd, Abu Dhabi Global Market (ADGM)
        </p>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#5A5048', lineHeight: 1.7 }}>
          CarbonBridge operates a beta marketplace for voluntary carbon credits. This disclosure explains the material risks you accept when transacting on this platform. Please read it carefully before purchasing or listing credits.
        </p>
      </div>

      {/* Beta status banner */}
      <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '20px 24px', marginBottom: '36px' }}>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#78350F', fontWeight: 600, marginBottom: '6px' }}>
          Platform Status: Beta Marketplace — Pilot Transactions Only
        </p>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>
          CarbonBridge is currently operating as a beta marketplace. We are conducting pilot transactions under the oversight of our management team. We are in the process of applying for authorisation from the Abu Dhabi Global Market Financial Services Regulatory Authority (ADGM/FSRA). Until ADGM/FSRA authorisation is granted, this platform is not a licensed financial services provider. No credit or investment services are provided under FSRA authorisation at this time.
        </p>
      </div>

      <Section title="1. Regulatory Status">
        <p style={{ marginBottom: '12px' }}>
          CarbonBridge Ltd is incorporated in the Abu Dhabi Global Market (ADGM). We are currently operating as a technology platform facilitating the introduction of buyers and sellers of voluntary carbon credits. We have initiated the ADGM/FSRA authorisation process but have not yet received a Financial Services Permission (FSP).
        </p>
        <p>
          Until authorisation is granted, CarbonBridge does not provide regulated financial services or investment advice. You should independently assess whether purchasing carbon credits is appropriate for your compliance, sustainability, or investment objectives. If you are transacting in carbon credits for regulatory compliance purposes (NRCC, CORSIA, CBAM), consult qualified legal and compliance advisors.
        </p>
      </Section>

      <Section title="2. Voluntary Carbon Market Risks">
        <p style={{ marginBottom: '12px' }}><strong>Credit Quality and Integrity Risk:</strong> Voluntary carbon credits vary significantly in quality. Projects may use different methodologies, baseline assumptions, and additionality tests. A credit representing 1 tonne CO₂e on paper may represent varying real-world climate impact depending on the underlying project quality, permanence, and monitoring rigour.</p>

        <p style={{ marginBottom: '12px' }}><strong>Permanence Risk:</strong> Carbon stored in forests and soils can be released if fires, disease, drought, or illegal clearing destroy the project area. Projects mitigate this with buffer pools, but permanent loss of sequestered carbon cannot be fully guaranteed for nature-based projects.</p>

        <p style={{ marginBottom: '12px' }}><strong>Additionality Risk:</strong> A credit is only valid if the underlying emissions reductions would not have occurred without the carbon finance. If a project's additionality claims are later found to be insufficient, the credits may be invalidated or face market repricing.</p>

        <p style={{ marginBottom: '12px' }}><strong>Leakage Risk:</strong> Protecting one area of forest may displace deforestation pressure to another area. High-quality methodologies include leakage accounting, but residual leakage risk exists.</p>

        <p><strong>Regulatory Recognition Risk:</strong> Not all voluntary credits are eligible for all compliance purposes. CORSIA eligibility (aviation), NRCC eligibility (UAE national), CBAM relevance (EU importers), and SBTi BVCM qualification each have specific criteria. Regulatory requirements change. We do not guarantee that credits labelled as compliance-eligible will be accepted by regulators at the time of surrender.</p>
      </Section>

      <Section title="3. Registry and Transfer Risks">
        <p style={{ marginBottom: '12px' }}><strong>Registry Delays:</strong> Carbon credit retirements and transfers on Verra, Gold Standard, ACR, and CAR registries are executed manually. Settlement timelines may vary from 1 to 10 business days depending on registry procedures and seller operations.</p>

        <p style={{ marginBottom: '12px' }}><strong>Double-Counting Risk:</strong> The voluntary carbon market does not have a globally unified registry. Jurisdictional credits may be subject to corresponding adjustments under Article 6 of the Paris Agreement — if a host country government has claimed the underlying emission reduction for its NDC, the same credit cannot be used by a buyer for voluntary claims. We disclose Article 6 status where known, but this field is evolving.</p>

        <p><strong>Seller Default Risk:</strong> If a seller fails to transfer credits after payment, CarbonBridge will initiate dispute resolution. We do not currently offer insurance on all transactions. Optional insurance products are available for eligible orders at checkout.</p>
      </Section>

      <Section title="4. Price and Market Risks">
        <p style={{ marginBottom: '12px' }}>
          The voluntary carbon market is illiquid compared to regulated financial markets. Prices can change significantly based on market sentiment, regulatory developments, and project-specific events. Historical price data displayed on the platform is indicative only and does not guarantee future prices.
        </p>
        <p>
          CarbonBridge is not a carbon exchange and does not guarantee price discovery, best execution, or liquidity for any transaction. Large orders (above 100,000 tCO₂e) are handled via bilateral negotiation and do not transact at the listed spot price.
        </p>
      </Section>

      <Section title="5. KYC / AML Obligations">
        <p>
          As part of operating a marketplace for carbon credits — which are financial instruments under evolving regulatory frameworks — CarbonBridge conducts Know Your Customer (KYC) and Know Your Business (KYB) checks on buyers and sellers. We reserve the right to refuse or cancel transactions if due diligence checks cannot be completed to our satisfaction or if a party appears on OFAC, UN, or EU sanctions lists. Transaction monitoring is conducted on an ongoing basis.
        </p>
      </Section>

      <Section title="6. Platform-Specific Risks">
        <p style={{ marginBottom: '12px' }}><strong>Beta Software:</strong> CarbonBridge is currently in beta. Software may contain bugs, errors, or unexpected behaviours. We recommend transacting in limited volumes during the pilot phase.</p>

        <p style={{ marginBottom: '12px' }}><strong>Stripe Payments (Test Mode):</strong> Payment processing is currently in test mode. Live card transactions require additional setup. Bank transfer instructions are issued manually for each transaction.</p>

        <p><strong>Data Accuracy:</strong> Listing data including available volumes, prices, and compliance eligibility is provided by sellers and sourced from public registry records. CarbonBridge does not independently verify every data point. Buyers should verify project details directly with the relevant registry before transacting significant volumes.</p>
      </Section>

      <Section title="7. No Investment Advice">
        <p>
          Nothing on this platform constitutes investment advice, financial advice, tax advice, or legal advice. CarbonBridge provides factual information about carbon credit projects and facilitates introductions between buyers and sellers. You are solely responsible for your purchasing decisions and any use of purchased credits for compliance, reporting, or commercial purposes.
        </p>
      </Section>

      <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '24px', marginTop: '32px' }}>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B6259', lineHeight: 1.7 }}>
          For questions about this disclosure or platform status, contact{' '}
          <a href="mailto:legal@carbonbridge.ae" style={{ color: '#C9A96E', fontWeight: 500 }}>legal@carbonbridge.ae</a>.
          For ADGM/FSRA authorisation enquiries:{' '}
          <a href="mailto:compliance@carbonbridge.ae" style={{ color: '#C9A96E', fontWeight: 500 }}>compliance@carbonbridge.ae</a>.
        </p>
      </div>
    </div>
  );
}
