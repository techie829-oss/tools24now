import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'JSON Formatter - Free Online Tool | Tools24Now',
  description: 'Beautify your messy JSON code. Validate syntax and make it readable with proper indentation.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'JSON Formatter | Tools24Now',
    description: 'Beautify your messy JSON code. Validate syntax and make it readable with proper indentation.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
