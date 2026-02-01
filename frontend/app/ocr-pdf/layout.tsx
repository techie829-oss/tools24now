import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'OCR PDF - Free Online Tool | Tools24Now',
  description: 'Extract text from scanned PDFs and images. Make your documents searchable and editable with our advanced OCR.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'OCR PDF | Tools24Now',
    description: 'Extract text from scanned PDFs and images. Make your documents searchable and editable with our advanced OCR.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
