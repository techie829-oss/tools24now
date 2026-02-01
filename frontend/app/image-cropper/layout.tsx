import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Cropper - Free Online Tool | Tools24Now',
  description: 'Trim the edges or focus on the best part of your photo. straightforward cropping with custom aspect ratios.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Cropper | Tools24Now',
    description: 'Trim the edges or focus on the best part of your photo. straightforward cropping with custom aspect ratios.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
