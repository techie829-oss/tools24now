import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'PDF to Images - Free Online Tool | Tools24Now',
  description: 'Instantly convert PDF pages into high-quality JPG or PNG images. Perfect for sharing on social media or using in presentations.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'PDF to Images | Tools24Now',
    description: 'Instantly convert PDF pages into high-quality JPG or PNG images. Perfect for sharing on social media or using in presentations.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
