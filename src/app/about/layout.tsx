import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CarbonBridge',
  description: 'About CarbonBridge: the mission, the approach and the team behind an institutional carbon credit marketplace for MENA.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
