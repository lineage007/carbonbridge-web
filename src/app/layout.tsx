import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: { default: "CarbonBridge — MENA's Carbon Credit Marketplace", template: "%s | CarbonBridge" },
  description: "MENA's first institutional carbon credit marketplace. Discover, compare, purchase, and insure verified carbon credits with real-time pricing, compliance tools, and portfolio management. UAE NRCC and EU CBAM ready.",
  metadataBase: new URL("https://carbonbridge.ae"),
  keywords: ["carbon credits UAE", "carbon marketplace MENA", "carbon offset Dubai", "NRCC compliance", "EU CBAM", "voluntary carbon market", "verified carbon credits", "carbon trading platform", "ESG UAE", "sustainability marketplace", "carbon credit broker UAE", "carbon neutral Dubai"],
  authors: [{ name: "CarbonBridge", url: "https://carbonbridge.ae" }],
  creator: "CarbonBridge",
  openGraph: {
    type: "website",
    siteName: "CarbonBridge",
    locale: "en_AE",
    url: "https://carbonbridge.ae",
    title: "CarbonBridge — Where Carbon Credits Meet Institutional Trust",
    description: "MENA's first carbon credit marketplace. Verified projects, real-time pricing, compliance tools for NRCC & CBAM. Built for corporates, funds, and governments.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CarbonBridge — MENA Carbon Credit Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CarbonBridge — MENA's Carbon Credit Marketplace",
    description: "Discover, compare, and purchase verified carbon credits. NRCC & CBAM compliance built in.",
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
      description: "MENA's first institutional carbon credit marketplace. Connecting corporates, funds, and governments with verified carbon offset projects across the Middle East, North Africa, and beyond.",
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
      description: 'Browse and purchase verified carbon credits from projects across MENA and globally. Real-time pricing, project comparison, portfolio management, and compliance tracking for UAE NRCC and EU CBAM.',
      featureList: [
        'Verified carbon credit marketplace',
        'Real-time carbon credit pricing',
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
        { '@type': 'Question', name: 'What is CarbonBridge?', acceptedAnswer: { '@type': 'Answer', text: "CarbonBridge is MENA's first institutional carbon credit marketplace. We connect corporates, investment funds, and government entities with verified carbon offset projects, offering real-time pricing, compliance tools for UAE NRCC and EU CBAM, and portfolio management." } },
        { '@type': 'Question', name: 'What is the UAE NRCC?', acceptedAnswer: { '@type': 'Answer', text: 'The UAE National Registry of Carbon Credits (NRCC) is a mandatory carbon reporting framework for large UAE emitters. The first compliance deadline is May 30, 2026. CarbonBridge provides tools to track and manage NRCC compliance.' } },
        { '@type': 'Question', name: 'How does EU CBAM affect UAE businesses?', acceptedAnswer: { '@type': 'Answer', text: 'The EU Carbon Border Adjustment Mechanism (CBAM) takes effect January 1, 2027. UAE exporters of aluminium, steel, cement, and fertiliser to the EU must purchase equivalent carbon credits. CarbonBridge helps UAE businesses prepare for CBAM compliance.' } },
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
        </AuthProvider>
      </body>
    </html>
  );
}
