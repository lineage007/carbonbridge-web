import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonBridge — MENA's Carbon Credit Marketplace",
  description: "The first self-serve carbon credit marketplace with integrated insurance, data analytics, and compliance tools. Built for the MENA compliance wave.",
  keywords: "carbon credits, carbon marketplace, MENA, UAE, NRCC, CBAM, CORSIA, carbon offset, Verra, VCU, sustainability",
  openGraph: {
    title: "CarbonBridge — MENA's Carbon Credit Marketplace",
    description: "Discover, compare, purchase, and insure verified carbon credits. Built for the Gulf compliance wave.",
    url: "https://carbonbridge.ae",
    siteName: "CarbonBridge",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[var(--parchment)] text-[var(--ink)]">{children}</body>
    </html>
  );
}
