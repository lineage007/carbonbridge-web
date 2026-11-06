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
  const full = `Example listing, not a live offer. ${credit.creditType} credits, ${credit.registry}, vintage ${credit.vintage}. ${credit.description}`;
  // Search results show about 160 characters; cut at a word boundary.
  const description = full.length <= 160 ? full : full.slice(0, full.lastIndexOf(' ', 157)) + '...';
  return {
    title: credit.projectName,
    description,
    // A page-level openGraph replaces the layout's, so repeat the shared fields and image.
    openGraph: {
      type: 'website',
      url: `/credits/${credit.id}`,
      title: `${credit.projectName} | CarbonBridge`,
      description,
      siteName: 'CarbonBridge',
      locale: 'en_AE',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CarbonBridge, carbon credit marketplace for MENA' }],
    },
  };
}

export default function Page() {
  return <CreditDetail />;
}
