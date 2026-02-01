import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'QR Code Generator - Free Online Tool | Tools24Now',
  description: 'Create custom QR codes for websites, WiFi access, text, and more. Download in high resolution.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'QR Code Generator | Tools24Now',
    description: 'Create custom QR codes for websites, WiFi access, text, and more. Download in high resolution.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
