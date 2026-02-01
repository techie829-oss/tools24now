import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Organize PDF - Free Online Tool | Tools24Now',
  description: 'Rearrange, rotate, or delete pages from your PDF. Get your document structure perfect in just a few clicks.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Organize PDF | Tools24Now',
    description: 'Rearrange, rotate, or delete pages from your PDF. Get your document structure perfect in just a few clicks.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
