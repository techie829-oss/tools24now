import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Filters - Free Online Tool | Tools24Now',
  description: 'Enhance your photos with beautiful preset filters. Give your images a professional touch in one click.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Filters | Tools24Now',
    description: 'Enhance your photos with beautiful preset filters. Give your images a professional touch in one click.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
