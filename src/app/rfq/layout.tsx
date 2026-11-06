import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a quote',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
