import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carbon Management',
  description: 'Track Scope 1-3 emissions, manage compliance obligations, and optimise your carbon credit portfolio.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
