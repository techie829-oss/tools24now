import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Quick Resume Builder - Free Online Tool | Tools24Now',
  description: 'Build a standout resume that gets you hired. Choose a template, fill in your details, and download.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Quick Resume Builder | Tools24Now',
    description: 'Build a standout resume that gets you hired. Choose a template, fill in your details, and download.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
