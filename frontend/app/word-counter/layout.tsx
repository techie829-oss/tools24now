import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Word Counter - Free Online Tool | Tools24Now',
  description: 'Count words, characters, and reading time. perfect for writers, students, and SEO optimization.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Word Counter | Tools24Now',
    description: 'Count words, characters, and reading time. perfect for writers, students, and SEO optimization.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
