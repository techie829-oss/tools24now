import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Fee Receipt Generator - Free Online Tool | Tools24Now',
  description: 'Generate automated fee receipts for tuition and school payments. Keep accounts transparent.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Fee Receipt Generator | Tools24Now',
    description: 'Generate automated fee receipts for tuition and school payments. Keep accounts transparent.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
