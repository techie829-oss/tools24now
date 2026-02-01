import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Barcode Generator - Free Online Tool | Tools24Now',
  description: 'Create custom barcodes for your inventory and products. Supports UPC, EAN, Code128, and more.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Barcode Generator | Tools24Now',
    description: 'Create custom barcodes for your inventory and products. Supports UPC, EAN, Code128, and more.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
