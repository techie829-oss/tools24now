import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Resizer - Free Online Tool | Tools24Now',
  description: 'Resize images to the exact dimensions you need. Perfect for social media posts, banners, and profile pictures.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Resizer | Tools24Now',
    description: 'Resize images to the exact dimensions you need. Perfect for social media posts, banners, and profile pictures.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
