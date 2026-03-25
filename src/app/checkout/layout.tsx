import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your carbon credit purchase with optional integrated insurance coverage.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
