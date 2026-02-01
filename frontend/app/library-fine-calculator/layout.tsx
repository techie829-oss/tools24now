import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Library Fine - Free Online Tool | Tools24Now',
  description: 'Calculate overdue fines accurately based on days late and daily rates. Fair and fast.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Library Fine | Tools24Now',
    description: 'Calculate overdue fines accurately based on days late and daily rates. Fair and fast.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
