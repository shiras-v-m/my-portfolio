import type { Metadata } from 'next';

const pageUrl = 'https://shiras.dev/propose/';
const description = 'Create a personalized proposal website for someone special. Choose a romantic theme, write your own message, add an optional photo, then share your proposal link on WhatsApp.';

export const metadata: Metadata = {
  title: 'Free Romantic Proposal Link Generator',
  description,
  alternates: { canonical: pageUrl },
  keywords: [
    'proposal website',
    'proposal link generator',
    'romantic proposal page',
    'personalized proposal link',
    'share proposal on WhatsApp',
    'cute proposal website',
  ],
  openGraph: {
    type: 'website',
    url: pageUrl,
    siteName: 'Shiras VM',
    title: 'Create a Personalized Proposal Page 💗',
    description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Create a personalized romantic proposal page on shiras.dev' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create a Personalized Proposal Page 💗',
    description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Romantic Proposal Link Generator',
  url: pageUrl,
  description,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires a modern web browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  creator: { '@type': 'Person', name: 'Shiras VM', url: 'https://shiras.dev/' },
};

export default function ProposalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
    </>
  );
}
