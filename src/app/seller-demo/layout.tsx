import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller dashboard (demonstration)',
  // Demonstration screen, only linked from the other demo screens: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
