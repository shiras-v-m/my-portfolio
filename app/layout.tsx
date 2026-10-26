import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://shiras.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Shiras VM | Full-Stack Developer in Dubai',
    template: '%s | Shiras VM',
  },
  description:
    'Explore the portfolio of Shiras VM, a full-stack developer in Dubai, UAE, building responsive web applications with React, Next.js, Node.js, APIs and modern databases.',
  applicationName: 'Shiras VM Portfolio',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Shiras VM Portfolio',
    title: 'Shiras VM | Full-Stack Developer in Dubai',
    description:
      'Full-stack web development portfolio featuring CarAlert, SocialSouq and web application projects built with React, Next.js and backend technologies.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Shiras VM — Full-Stack Developer portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiras VM | Full-Stack Developer in Dubai',
    description: 'Full-stack developer building responsive web applications with React, Next.js and Node.js.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  icons: { icon: '/shiras-code-logo.png', shortcut: '/shiras-code-logo.png', apple: '/shiras-code-logo.png' },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Shiras VM',
  url: siteUrl,
  jobTitle: 'Full-Stack Developer',
  email: 'mailto:shiras.vm@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
  sameAs: ['https://github.com/shiras-v-m', 'https://www.linkedin.com/in/shiras-vm'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </body>
    </html>
  );
}
