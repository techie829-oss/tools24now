import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Hash Generator - Free Online Tool | Tools24Now',
  description: 'Generate secure hash values (MD5, SHA-256) for your text strings. Check data integrity.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Hash Generator | Tools24Now',
    description: 'Generate secure hash values (MD5, SHA-256) for your text strings. Check data integrity.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
