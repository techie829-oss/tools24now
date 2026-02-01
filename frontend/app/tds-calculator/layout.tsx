import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'TDS Calculator - Free Online Tool | Tools24Now',
  description: 'Compute Tax Deducted at Source (TDS) correctly for salaries, rent, and professional fees.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'TDS Calculator | Tools24Now',
    description: 'Compute Tax Deducted at Source (TDS) correctly for salaries, rent, and professional fees.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
