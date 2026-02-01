import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Name Gen - Free Online Tool | Tools24Now',
  description: 'Stuck on a name? unique, catchy business name ideas to jumpstart your new venture.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Business Name Gen | Tools24Now',
    description: 'Stuck on a name? unique, catchy business name ideas to jumpstart your new venture.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
