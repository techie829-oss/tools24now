import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Merge PDF - Free Online Tool | Tools24Now',
  description: 'Combine multiple PDF files into one organized document. Drag and drop to rearrange pages exactly how you want them.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Merge PDF | Tools24Now',
    description: 'Combine multiple PDF files into one organized document. Drag and drop to rearrange pages exactly how you want them.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
