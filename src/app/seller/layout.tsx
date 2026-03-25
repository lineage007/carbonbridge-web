import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller Dashboard',
  description: 'Manage your carbon credit listings, track orders, and monitor revenue on CarbonBridge.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
