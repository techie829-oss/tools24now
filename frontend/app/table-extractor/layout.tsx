import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Table Extractor - Free Online Tool | Tools24Now',
  description: 'Pull data tables straight out of PDFs and into Excel or CSV. No more manual data entry errors.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Table Extractor | Tools24Now',
    description: 'Pull data tables straight out of PDFs and into Excel or CSV. No more manual data entry errors.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
