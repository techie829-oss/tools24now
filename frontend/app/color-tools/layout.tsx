import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Color Tools - Free Online Tool | Tools24Now',
  description: 'All the color help you need. Pick colors, convert between HEX/RGB/HSL, and generate palettes.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Color Tools | Tools24Now',
    description: 'All the color help you need. Pick colors, convert between HEX/RGB/HSL, and generate palettes.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
