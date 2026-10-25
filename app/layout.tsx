import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { media, site } from '@/src/content';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3400'),
  title: site.title,
  description: site.description,
  // Local study build: keep it out of search indexes.
  robots: { index: false, follow: false },
  openGraph: { title: site.title, description: site.description, images: [{ url: media.ogImage, width: 1200, height: 630 }] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f1633',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/media/fonts/dammitsansv0.3-bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/media/fonts/rubik-latin-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/media/fonts/rubik-latin-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
