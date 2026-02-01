import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Compressor - Free Online Tool | Tools24Now',
  description: 'Reduce image file sizes dramatically without visible quality loss. Speed up your website and save storage space.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image Compressor | Tools24Now',
    description: 'Reduce image file sizes dramatically without visible quality loss. Speed up your website and save storage space.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
