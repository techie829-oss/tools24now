import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'UUID Generator - Free Online Tool | Tools24Now',
  description: 'Generate unique identifiers (UUID v1 & v4) for your development projects and databases.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'UUID Generator | Tools24Now',
    description: 'Generate unique identifiers (UUID v1 & v4) for your development projects and databases.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
