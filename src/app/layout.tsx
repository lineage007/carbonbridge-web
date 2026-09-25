import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { default: "CarbonBridge | Carbon Credit Marketplace for MENA", template: "%s | CarbonBridge" },
  description: "An institutional carbon credit marketplace for MENA. Discover, compare and purchase verified carbon credits, with indicative price benchmarks, compliance guides for UAE NRCC, EU CBAM and CORSIA, and portfolio tools.",
  metadataBase: new URL("https://carbonbridge.ae"),
  keywords: ["carbon credits UAE", "carbon marketplace MENA", "carbon offset Dubai", "NRCC compliance", "EU CBAM", "voluntary carbon market", "verified carbon credits", "carbon trading platform", "ESG UAE", "sustainability marketplace", "carbon credit broker UAE", "carbon neutral Dubai"],
  authors: [{ name: "CarbonBridge", url: "https://carbonbridge.ae" }],
  creator: "CarbonBridge",
  openGraph: {
    type: "website",
    siteName: "CarbonBridge",
    locale: "en_AE",
    url: "https://carbonbridge.ae",
    title: "CarbonBridge | Carbon Credit Marketplace for MENA",
    description: "An institutional carbon credit marketplace for MENA. Verified projects, indicative price benchmarks and compliance guides for NRCC and CBAM, built for corporates, funds and governments.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CarbonBridge, carbon credit marketplace for MENA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CarbonBridge | Carbon Credit Marketplace for MENA",
    description: "Discover, compare and purchase verified carbon credits, with compliance guides for NRCC and CBAM.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// JSON-LD structured data for SEO + AEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'CarbonBridge',
      url: 'https://carbonbridge.ae',
      logo: 'https://carbonbridge.ae/logo-white.png',
      description: "An institutional carbon credit marketplace for MENA, connecting corporates, funds and governments with verified carbon offset projects across the Middle East, North Africa and beyond.",
      foundingDate: '2026',
      areaServed: ['AE', 'SA', 'QA', 'BH', 'KW', 'OM', 'EG', 'MA'],
      contactPoint: { '@type': 'ContactPoint', email: 'info@carbonbridge.ae', contactType: 'sales' },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      name: 'CarbonBridge',
      url: 'https://carbonbridge.ae',
    },
    {
      '@type': 'WebApplication',
      name: 'CarbonBridge Marketplace',
      url: 'https://carbonbridge.ae/marketplace',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Browse and purchase verified carbon credits from projects across MENA and globally, with indicative price benchmarks, project comparison, portfolio management and compliance tracking for UAE NRCC and EU CBAM.',
      featureList: [
        'Verified carbon credit marketplace',
        'Indicative carbon credit price benchmarks',
        'Project comparison tools',
        'Portfolio management',
        'UAE NRCC compliance tracking',
        'EU CBAM readiness tools',
        'Carbon credit insurance',
        'Forward contract trading',
        'RFQ (Request for Quote) system',
        'Data analytics and market insights',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is CarbonBridge?', acceptedAnswer: { '@type': 'Answer', text: "CarbonBridge is an institutional carbon credit marketplace for MENA. It connects corporates, investment funds and government entities with verified carbon offset projects, with indicative price benchmarks, compliance guides for UAE NRCC and EU CBAM, and portfolio management." } },
        { '@type': 'Question', name: 'What is the UAE NRCC?', acceptedAnswer: { '@type': 'Answer', text: 'The National Register for Carbon Credits (NRCC), created by Cabinet Resolution No. 67 of 2024 and overseen by the UAE Ministry of Climate Change and Environment, is the federal register of large emitters, verified emissions and carbon credits. Registration is mandatory for entities emitting 500,000 tCO2e or more a year and for carbon-credit trading platforms. CarbonBridge sources verified credits and provides tools to track NRCC-related obligations; see carbonbridge.ae/compliance/uae-nrcc.' } },
        { '@type': 'Question', name: 'How does EU CBAM affect UAE businesses?', acceptedAnswer: { '@type': 'Answer', text: 'The EU Carbon Border Adjustment Mechanism (CBAM) entered its definitive period on 1 January 2026; certificate sales begin on 1 February 2027 and the first annual declaration, covering 2026 imports, is due by 30 September 2027. EU importers of UAE aluminium, steel, cement and fertiliser pay for the verified emissions embedded in those goods. Carbon credits cannot be surrendered against CBAM. CarbonBridge helps UAE exporters understand their exposure; see carbonbridge.ae/compliance/eu-cbam.' } },
        { '@type': 'Question', name: 'What types of carbon credits are available?', acceptedAnswer: { '@type': 'Answer', text: 'CarbonBridge offers verified carbon credits from renewable energy, mangrove restoration, direct air capture, clean cookstove, and regenerative agriculture projects. All credits are verified by standards including Verra VCS, Gold Standard, and the UAE Carbon Registry.' } },
        { '@type': 'Question', name: 'Who can use CarbonBridge?', acceptedAnswer: { '@type': 'Answer', text: 'CarbonBridge serves corporates seeking carbon neutrality, investment funds trading carbon as an asset class, government entities meeting national commitments, and project developers listing verified credits for sale.' } },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <CookieConsent />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
