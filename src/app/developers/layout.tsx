import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer API',
  description: 'REST API for point-of-sale carbon offsetting. Request early access.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
