import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://tools24now.site'),
  alternates: {
    canonical: './',
  },
  title: {
    default: 'Tools24Now - Free Professional PDF, Image & Business Tools',
    template: '%s | Tools24Now',
  },
  description: 'Free, fast, and secure online tools. Convert PDF to Word, compress images, generate invoices, calculate GST, and more. No signup required.',
  keywords: ['pdf tools', 'image converter', 'invoice generator', 'gst calculator', 'business tools', 'free online tools', 'pdf to word', 'resume builder'],
  authors: [{ name: 'Tools24Now Team' }],
  creator: 'Tools24Now',
  publisher: 'Tools24Now',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico', // Ideally we'd resize this but for now reusing
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools24now.site',
    title: 'Tools24Now - All-in-One Digital Tool Suite',
    description: 'Access 50+ free premium tools: PDF editors, Image optimizers, Business document generators, and Financial calculators.',
    siteName: 'Tools24Now',
    images: [
      {
        url: '/og-image.png', // We should ensure this exists or use a default
        width: 1200,
        height: 630,
        alt: 'Tools24Now Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools24Now - Professional File & Business Tools',
    description: 'Free online tools for everyone. PDF, Images, Finance, and Developer utilities.',
    // images: ['/twitter-image.png'],
    creator: '@tools24now',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7E0M8J2YWN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7E0M8J2YWN');
          `}
        </Script>
      </body>
    </html>
  );
}
