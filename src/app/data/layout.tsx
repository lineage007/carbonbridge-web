import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Data & Credit Ratings',
  description: 'Independent carbon credit quality ratings against ICVCM CCP criteria. Price benchmarks, vintage analysis, and compliance mapping.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
