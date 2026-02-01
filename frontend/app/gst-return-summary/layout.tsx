import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'GST Returns - Free Online Tool | Tools24Now',
  description: 'Get a quick summary for your GSTR-1 and GSTR-3B filings. Simplify your monthly tax compliance.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'GST Returns | Tools24Now',
    description: 'Get a quick summary for your GSTR-1 and GSTR-3B filings. Simplify your monthly tax compliance.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
