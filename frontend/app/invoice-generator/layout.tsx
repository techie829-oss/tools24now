import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Invoice Generator - Free Online Tool | Tools24Now',
  description: 'Create clean, professional invoices in minutes. Add your logo, calculate taxes, and download as PDF.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Invoice Generator | Tools24Now',
    description: 'Create clean, professional invoices in minutes. Add your logo, calculate taxes, and download as PDF.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
