import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CarbonBridge',
  description: 'Founded in the UAE with operations in Australia. Operators with deep experience across carbon markets and institutional finance.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
