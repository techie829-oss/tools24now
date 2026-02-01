import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'File Metadata - Free Online Tool | Tools24Now',
  description: 'Peek inside your files. View and edit hidden metadata for PDFs and images (EXIF data).. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'File Metadata | Tools24Now',
    description: 'Peek inside your files. View and edit hidden metadata for PDFs and images (EXIF data).',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
