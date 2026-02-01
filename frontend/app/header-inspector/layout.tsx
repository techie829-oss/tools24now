import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Header Inspector - Free Online Tool | Tools24Now',
  description: 'View the HTTP headers returned by any website. Debug caching, cookies, and server info.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Header Inspector | Tools24Now',
    description: 'View the HTTP headers returned by any website. Debug caching, cookies, and server info.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
