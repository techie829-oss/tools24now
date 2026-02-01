import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Password Generator - Free Online Tool | Tools24Now',
  description: 'Create unbreakable passwords instantly. Customize length and complexity to stay secure online.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Password Generator | Tools24Now',
    description: 'Create unbreakable passwords instantly. Customize length and complexity to stay secure online.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
