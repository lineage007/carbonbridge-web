import type { Metadata } from 'next';
import { LISTINGS } from '@/data/credits';
import CreditDetail from './CreditDetail';

// Listings are a fixed illustrative set, so every page is built ahead and any other id is a real 404
// (it used to render "Credit not found" with status 200 and the homepage title).
export const dynamicParams = false;

export function generateStaticParams() {
  return LISTINGS.map(l => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const credit = LISTINGS.find(c => c.id === id);
  if (!credit) return {};
  const description = `Example listing, not a live offer. ${credit.creditType} credits, ${credit.registry}, vintage ${credit.vintage}. ${credit.description}`.slice(0, 300);
  return {
    title: credit.projectName,
    description,
    openGraph: { title: `${credit.projectName} | CarbonBridge`, description },
  };
}

export default function Page() {
  return <CreditDetail />;
}
