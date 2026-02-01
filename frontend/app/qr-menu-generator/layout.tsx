import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'QR Menu Generator - Free Online Tool | Tools24Now',
  description: 'Contactless menus for your restaurant or cafe. Create a QR code that customers can scan to view your menu.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'QR Menu Generator | Tools24Now',
    description: 'Contactless menus for your restaurant or cafe. Create a QR code that customers can scan to view your menu.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
