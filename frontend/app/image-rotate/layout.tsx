import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Rotate & Flip - Free Online Tool | Tools24Now',
  description: 'Fix upside-down or sideways photos instantly. Rotate and flip images to get the right orientation.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Rotate & Flip | Tools24Now',
    description: 'Fix upside-down or sideways photos instantly. Rotate and flip images to get the right orientation.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
