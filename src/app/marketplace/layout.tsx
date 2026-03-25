import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace — Carbon Credit Listings',
  description: 'Browse verified carbon credits from Verra, Gold Standard, and ACR. Filter by type, geography, vintage, and quality.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
