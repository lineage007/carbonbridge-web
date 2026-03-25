import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Join CarbonBridge as a buyer or seller. Access verified carbon credits, integrated insurance, and compliance tools.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
