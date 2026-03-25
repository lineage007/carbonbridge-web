import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer API',
  description: 'REST API for point-of-sale carbon offsetting. Real-time retirement and certificate generation from /bin/zsh.05 per call.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
