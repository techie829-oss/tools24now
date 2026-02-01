import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Watermark - Free Online Tool | Tools24Now',
  description: 'Protect your creative work. Add your logo or custom text watermark to images before sharing them online.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Watermark | Tools24Now',
    description: 'Protect your creative work. Add your logo or custom text watermark to images before sharing them online.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
