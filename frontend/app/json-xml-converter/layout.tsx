import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'JSON <-> XML - Free Online Tool | Tools24Now',
  description: 'Convert data between JSON and XML formats seamlessly. Great for API integration tasks.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'JSON <-> XML | Tools24Now',
    description: 'Convert data between JSON and XML formats seamlessly. Great for API integration tasks.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
