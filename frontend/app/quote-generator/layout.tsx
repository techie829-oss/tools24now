import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Quote / Estimate - Free Online Tool | Tools24Now',
  description: 'Send impressive quotes to clients quickly. Win more business with professional-looking estimates.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Quote / Estimate | Tools24Now',
    description: 'Send impressive quotes to clients quickly. Win more business with professional-looking estimates.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
