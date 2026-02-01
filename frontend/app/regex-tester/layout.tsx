import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Regex Tester - Free Online Tool | Tools24Now',
  description: 'Test and debug your Regular Expressions. Ensure your patterns match exactly what you intend.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Regex Tester | Tools24Now',
    description: 'Test and debug your Regular Expressions. Ensure your patterns match exactly what you intend.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
