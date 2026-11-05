import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace: Carbon Credit Listings',
  description: 'Browse illustrative carbon credit listings modelled on Verra, Gold Standard and ACR projects. Filter by type, geography, vintage and quality. Listings are examples, not live offers.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
