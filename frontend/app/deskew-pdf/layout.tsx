import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Deskew PDF - Free Online Tool | Tools24Now',
  description: 'Fix crooked scanned documents automatically. Straighten your pages for a professional, polished look.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Deskew PDF | Tools24Now',
    description: 'Fix crooked scanned documents automatically. Straighten your pages for a professional, polished look.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
