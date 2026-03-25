import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Access your CarbonBridge dashboard — marketplace, portfolio, and carbon management tools.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
