import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Salary Calculator - Free Online Tool | Tools24Now',
  description: 'Know your actual take-home pay. Estimate your in-hand salary from your CTC breakdown.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Salary Calculator | Tools24Now',
    description: 'Know your actual take-home pay. Estimate your in-hand salary from your CTC breakdown.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
