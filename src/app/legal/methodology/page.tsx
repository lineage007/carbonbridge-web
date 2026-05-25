export const metadata = {
  title: 'Listing Vetting Methodology | CarbonBridge',
  description:
    'How CarbonBridge evaluates and approves carbon credit listings on the marketplace.',
};

const fr = "'Fraunces', Georgia, serif";
const bg = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: fr, fontSize: '20px', color: '#1B3A2D', marginBottom: '12px' }}>{title}</h2>
      <div style={{ fontFamily: bg, fontSize: '14px', color: '#4A4035', lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
      <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: '#1B3A2D', color: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: bg, fontSize: '14px', fontWeight: 700 }}>{n}</div>
      <div>
        <p style={{ fontFamily: bg, fontSize: '14px', fontWeight: 600, color: '#1A1714', marginBottom: '6px' }}>{title}</p>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#5A5048', lineHeight: 1.7 }}>{children}</p>
      </div>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#92400E', borderRadius: '6px', padding: '6px 14px', fontFamily: bg, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Beta — Methodology in Development
        </div>
        <h1 style={{ fontFamily: fr, fontSize: '32px', fontWeight: 700, color: '#1A1714', marginBottom: '10px' }}>
          How We Vet Listings
        </h1>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#8A7E70', marginBottom: '8px' }}>
          Last updated: May 2026 · CarbonBridge Ltd
        </p>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#5A5048', lineHeight: 1.7 }}>
          This page describes CarbonBridge's current listing approval process. Our methodology is evolving as we develop more robust technical integrations with carbon registries. We are committed to honest disclosure of what we check and what we do not yet check.
        </p>
      </div>

      {/* Honest capability statement */}
      <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '20px 24px', marginBottom: '36px' }}>
        <p style={{ fontFamily: bg, fontSize: '14px', color: '#78350F', fontWeight: 600, marginBottom: '6px' }}>
          Current Limitations (Beta Phase)
        </p>
        <ul style={{ fontFamily: bg, fontSize: '13px', color: '#92400E', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
          <li>Registry verification is currently manual — admin staff cross-check project IDs against public Verra, Gold Standard, ACR, and CAR registry search pages.</li>
          <li>Programmatic registry API integration (automated verification of project status, available volumes, and retirement history) is on the next-sprint roadmap, not yet live.</li>
          <li>Volume claimed by sellers is not independently audited against registry account balances in this beta phase.</li>
          <li>We do not yet conduct automated sanctions screening — this is a prerequisite for full ADGM/FSRA authorisation and is being implemented with a third-party KYC vendor.</li>
        </ul>
      </div>

      <Section title="Registry Eligibility">
        <p style={{ marginBottom: '12px' }}>
          CarbonBridge accepts listings from four internationally recognised voluntary carbon registries:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {[
            { name: 'Verra VCS', url: 'https://registry.verra.org', note: 'Verified Carbon Standard — world\'s largest voluntary registry' },
            { name: 'Gold Standard', url: 'https://registry.goldstandard.org', note: 'SDG-verified credits with co-benefit certification' },
            { name: 'ACR (American Carbon Registry)', url: 'https://acrcarbon.org', note: 'CORSIA-eligible offset credits and TREES standard' },
            { name: 'CAR (Climate Action Reserve)', url: 'https://thereserve2.apx.com', note: 'North American forestry and methane protocols' },
          ].map(r => (
            <div key={r.name} style={{ background: '#F5F0E8', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontFamily: bg, fontSize: '13px', fontWeight: 600, color: '#1B3A2D', marginBottom: '4px' }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1B3A2D', textDecoration: 'none' }}>{r.name} ↗</a>
              </p>
              <p style={{ fontFamily: bg, fontSize: '12px', color: '#6B6259' }}>{r.note}</p>
            </div>
          ))}
        </div>
        <p>
          We do not currently accept listings from non-internationally recognised registries, proprietary corporate schemes, or unverified project developers. Any listing without a valid registry project ID is rejected.
        </p>
      </Section>

      <Section title="Current Vetting Process (Manual Review)">
        <Step n={1} title="Seller Identity Verification">
          Sellers must create a verified account, provide company name, country of incorporation, and accept our seller terms. Seller accounts are manually reviewed by CarbonBridge staff before approval. During the beta phase, we are onboarding a limited number of known project developers and brokers.
        </Step>
        <Step n={2} title="Registry Cross-Check">
          When a seller submits a listing with a registry project ID, our team manually searches the corresponding registry (Verra, Gold Standard, ACR, or CAR) to verify: (a) the project ID exists, (b) the project is in active or registered status, (c) the credit type and methodology match the listing, and (d) the listed vintage year has been verified.
        </Step>
        <Step n={3} title="Volume Plausibility Check">
          We review the seller's claimed available volume against the total credits issued to the project in the registry. We do not yet have API access to verify the seller's actual registry account balance — this check is qualitative only.
        </Step>
        <Step n={4} title="Compliance Eligibility Tagging">
          We tag listings for CORSIA, NRCC, CBAM, and SBTi BVCM eligibility based on: (a) the registry and methodology's known eligibility under each framework, (b) seller-provided documentation, and (c) publicly available guidance from ICAO, UAE MoCC, and EU. These tags are informational and subject to change as regulatory frameworks evolve.
        </Step>
        <Step n={5} title="Price Reasonableness Review">
          Listing prices are compared against public voluntary carbon market price indices (Ecosystem Marketplace, BloombergNEF, MSCI Carbon Markets). Listings with prices significantly outside observed market ranges are queried with the seller before approval.
        </Step>
        <Step n={6} title="Admin Approval or Rejection">
          An approved CarbonBridge administrator reviews the vetting package and approves or rejects the listing. Approved listings appear on the marketplace with a pending status until any required documentation is uploaded.
        </Step>
      </Section>

      <Section title="Quality Rating Methodology">
        <p style={{ marginBottom: '12px' }}>
          CarbonBridge assigns internal quality ratings (AAA to B) based on a weighted assessment of:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
          <li style={{ marginBottom: '6px' }}><strong>Additionality (25%):</strong> Evidence that the project would not have occurred without carbon finance.</li>
          <li style={{ marginBottom: '6px' }}><strong>Permanence (25%):</strong> Duration of carbon storage and buffer pool adequacy.</li>
          <li style={{ marginBottom: '6px' }}><strong>Leakage Risk (20%):</strong> Potential for displaced emissions outside the project boundary.</li>
          <li style={{ marginBottom: '6px' }}><strong>Methodology Integrity (20%):</strong> Rigour of the approved methodology and verification body independence.</li>
          <li style={{ marginBottom: '6px' }}><strong>Co-benefits (10%):</strong> Verified community, biodiversity, and social co-benefits (CCB standard, VCMI, SDG verification).</li>
        </ul>
        <p>
          These ratings are indicative and reflect CarbonBridge's assessment at the time of listing approval. They are not investment grades or regulatory certifications. Third-party quality assessments from ICVCM (CCP label) are noted separately where applicable.
        </p>
      </Section>

      <Section title="ICVCM Core Carbon Principles (CCP) Label">
        <p>
          The Integrity Council for the Voluntary Carbon Market (ICVCM) issues CCP labels to credits meeting its Core Carbon Principles standard. CarbonBridge displays the CCP label on listings where the relevant project has been assessed by ICVCM. The CCP label is determined by ICVCM, not CarbonBridge. For the current status of CCP assessments, see{' '}
          <a href="https://icvcm.org" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A96E' }}>icvcm.org ↗</a>.
        </p>
      </Section>

      <Section title="What We Are Building Next">
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Verra API integration for automated project status and vintage verification</li>
          <li style={{ marginBottom: '8px' }}>KYC/KYB vendor integration (shortlist: Sumsub, Onfido, Persona) for automated sanctions screening and business verification</li>
          <li style={{ marginBottom: '8px' }}>Seller registry account balance verification (requiring registry API access or direct seller authorisation)</li>
          <li style={{ marginBottom: '8px' }}>Automated CORSIA eligibility checking against ICAO approved list updates</li>
          <li style={{ marginBottom: '8px' }}>Independent third-party audit of platform vetting methodology (prerequisite for ADGM/FSRA authorisation)</li>
        </ul>
      </Section>

      <div style={{ background: '#F5F0E8', borderRadius: '12px', padding: '24px', marginTop: '32px' }}>
        <p style={{ fontFamily: bg, fontSize: '13px', color: '#6B6259', lineHeight: 1.7 }}>
          Questions about listing vetting? Contact{' '}
          <a href="mailto:listings@carbonbridge.ae" style={{ color: '#C9A96E', fontWeight: 500 }}>listings@carbonbridge.ae</a>.
          For compliance and ADGM/FSRA status:{' '}
          <a href="mailto:compliance@carbonbridge.ae" style={{ color: '#C9A96E', fontWeight: 500 }}>compliance@carbonbridge.ae</a>.
        </p>
      </div>
    </div>
  );
}
