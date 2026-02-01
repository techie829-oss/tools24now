import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'My IP Address - Free Online Tool | Tools24Now',
  description: 'Instantly check your public IPv4 and IPv6 address, along with location and ISP details.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'My IP Address | Tools24Now',
    description: 'Instantly check your public IPv4 and IPv6 address, along with location and ISP details.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
