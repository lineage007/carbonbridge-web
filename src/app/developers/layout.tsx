import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer API',
  description: 'Planned REST API for point-of-sale carbon offsetting. Not yet available.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
