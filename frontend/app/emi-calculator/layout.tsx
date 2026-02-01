import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'EMI Calculator - Free Online Tool | Tools24Now',
  description: 'Plan your loans better. Calculate your monthly EMI and total interest for home, car, or personal loans.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'EMI Calculator | Tools24Now',
    description: 'Plan your loans better. Calculate your monthly EMI and total interest for home, car, or personal loans.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
