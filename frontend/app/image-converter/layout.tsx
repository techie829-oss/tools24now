import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Converter - Free Online Tool | Tools24Now',
  description: 'Switch between image formats like JPG, PNG, and WebP effortlessly. Keep compatibility high and file sizes low.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Converter | Tools24Now',
    description: 'Switch between image formats like JPG, PNG, and WebP effortlessly. Keep compatibility high and file sizes low.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
