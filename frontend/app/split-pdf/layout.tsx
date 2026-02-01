import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Split PDF - Free Online Tool | Tools24Now',
  description: 'Separate one big PDF into smaller files, or extract just the specific pages you need.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Split PDF | Tools24Now',
    description: 'Separate one big PDF into smaller files, or extract just the specific pages you need.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
