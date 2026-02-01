import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Base64 Converter - Free Online Tool | Tools24Now',
  description: 'Encode and decode data to Base64 format. Simple, fast, and handled entirely in your browser.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Base64 Converter | Tools24Now',
    description: 'Encode and decode data to Base64 format. Simple, fast, and handled entirely in your browser.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
