import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CarbonBridge',
  description: 'Learn about CarbonBridge — the team, mission, and regulatory framework behind MENA\'s first carbon credit marketplace.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
