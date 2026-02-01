import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Grade Converter - Free Online Tool | Tools24Now',
  description: 'Convert marks or percentages into letter grades or GPA scores based on standard scales.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Grade Converter | Tools24Now',
    description: 'Convert marks or percentages into letter grades or GPA scores based on standard scales.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
