import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: { default: "CarbonBridge — MENA's Carbon Credit Marketplace", template: "%s | CarbonBridge" },
  description: "Where carbon credits meet institutional trust. Discover, compare, purchase, and insure verified carbon credits with integrated data analytics and compliance tools.",
  metadataBase: new URL("https://carbonbridge.ae"),
  openGraph: { type: "website", siteName: "CarbonBridge", locale: "en_AE" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
