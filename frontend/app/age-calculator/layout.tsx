import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Age Calculator - Free Online Tool | Tools24Now',
  description: 'Find out your exact age in years, months, and days. Also calculate days until your next birthday.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Age Calculator | Tools24Now',
    description: 'Find out your exact age in years, months, and days. Also calculate days until your next birthday.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
