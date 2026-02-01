import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Valuation Calc - Free Online Tool | Tools24Now',
  description: 'Get a rough estimate of what your startup or small business might be worth today.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Valuation Calc | Tools24Now',
    description: 'Get a rough estimate of what your startup or small business might be worth today.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
