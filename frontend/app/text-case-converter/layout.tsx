import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Text Case Converter - Free Online Tool | Tools24Now',
  description: 'Fix capitalization issues in a click. Convert text to lowercase, UPPERCASE, Title Case, and more.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Text Case Converter | Tools24Now',
    description: 'Fix capitalization issues in a click. Convert text to lowercase, UPPERCASE, Title Case, and more.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
