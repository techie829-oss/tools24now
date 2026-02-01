import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Unit Converter - Free Online Tool | Tools24Now',
  description: 'Convert length, weight, volume, and more. A handy universal converter for detailed work.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Unit Converter | Tools24Now',
    description: 'Convert length, weight, volume, and more. A handy universal converter for detailed work.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
