import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Student ID Generator - Free Online Tool | Tools24Now',
  description: 'Design and print professional student ID cards in bulk. fast and easy for admin staff.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Student ID Generator | Tools24Now',
    description: 'Design and print professional student ID cards in bulk. fast and easy for admin staff.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
