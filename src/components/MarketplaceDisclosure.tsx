'use client';

/**
 * MarketplaceDisclosure — inline ADGM/FSRA authorisation disclosure.
 *
 * Renders at the point of action (browse / transact / retire), not as a
 * global banner. Text is phase-specific so buyers see exactly what applies
 * to the action they are about to take.
 *
 * Props:
 *   phase: 'browsing' | 'transacting' | 'retiring'
 */

const DISCLOSURE_LINK = '/legal/risk-disclosure';

interface MarketplaceDisclosureProps {
  phase: 'browsing' | 'transacting' | 'retiring';
}

const PHASE_TEXT: Record<
  MarketplaceDisclosureProps['phase'],
  { heading: string; body: string; allowed: string[] }
> = {
  browsing: {
    heading: 'Information only — not a financial service',
    body: 'CarbonBridge does not currently hold an ADGM/FSRA Financial Services Permission. Browsing and comparing credit listings is permitted. Prices shown are indicative benchmarks from public registry data, not binding quotes. Authorisation application in progress.',
    allowed: [
      'Browsing credit listings',
      'Comparing project details and quality ratings',
      'Viewing indicative price benchmarks',
      'Downloading project documentation',
    ],
  },
  transacting: {
    heading: 'Pilot transactions only — authorisation pending',
    body: 'CarbonBridge does not currently hold an ADGM/FSRA Financial Services Permission. Operations are limited to pilot transactions under bilateral purchase agreements with accredited counterparties. No credits will be transferred until a signed Purchase Agreement is in place and payment is confirmed. Authorisation application in progress.',
    allowed: [
      'Executing bilateral purchase agreements with eligible counterparties',
      'Initiating bank transfer payments per Purchase Agreement terms',
      'Receiving legally binding Purchase Agreement documents',
      'Accessing order status and transaction history',
    ],
  },
  retiring: {
    heading: 'Registry retirement is manual — not automated',
    body: 'CarbonBridge does not currently hold an ADGM/FSRA Financial Services Permission. Registry retirement calls (Verra, Gold Standard, ACR) are executed manually by CarbonBridge staff after receiving your retirement request. Automated registry integration is pending ADGM authorisation and registry partner agreements. Certificate processing time is 1–3 business days.',
    allowed: [
      'Submitting retirement requests for completed purchases',
      'Receiving retirement certificates after manual registry execution',
      'Downloading certificates for compliance reporting',
    ],
  },
};

const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export function MarketplaceDisclosure({ phase }: MarketplaceDisclosureProps) {
  const { heading, body, allowed } = PHASE_TEXT[phase];

  return (
    <aside
      role="note"
      aria-label="Regulatory disclosure"
      style={{
        fontFamily: bg,
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderLeft: '3px solid rgba(245, 158, 11, 0.6)',
        borderRadius: '8px',
        padding: '14px 16px',
        fontSize: '12px',
        color: '#6B6259',
        lineHeight: 1.6,
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: '#92400E',
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        Regulatory disclosure
      </p>
      <p style={{ fontWeight: 600, color: '#1A1714', marginBottom: '6px', fontSize: '13px' }}>
        {heading}
      </p>
      <p style={{ marginBottom: '8px' }}>{body}</p>
      <p style={{ fontWeight: 600, color: '#1A1714', marginBottom: '4px' }}>
        Operations currently permitted:
      </p>
      <ul style={{ paddingLeft: '16px', margin: '0 0 8px' }}>
        {allowed.map((item) => (
          <li key={item} style={{ marginBottom: '2px' }}>
            {item}
          </li>
        ))}
      </ul>
      <a
        href={DISCLOSURE_LINK}
        style={{ color: '#C9A96E', textDecoration: 'underline', fontSize: '11px' }}
      >
        Full risk disclosure ↗
      </a>
    </aside>
  );
}
