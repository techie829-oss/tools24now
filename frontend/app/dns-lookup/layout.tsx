import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'DNS Lookup - Free Online Tool | Tools24Now',
  description: 'Query DNS records (A, MX, NS, TXT) for any domain. Troubleshoot website connectivity issues.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'DNS Lookup | Tools24Now',
    description: 'Query DNS records (A, MX, NS, TXT) for any domain. Troubleshoot website connectivity issues.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
