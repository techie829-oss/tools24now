import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Purchase Order - Free Online Tool | Tools24Now',
  description: 'Create official purchase orders for your suppliers. Track your spending and streamline your procurement.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Purchase Order | Tools24Now',
    description: 'Create official purchase orders for your suppliers. Track your spending and streamline your procurement.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
