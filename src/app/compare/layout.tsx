import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Carbon Credits',
  description: 'Side-by-side comparison across quality, price, permanence, additionality, and compliance eligibility.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
