import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Time Difference - Free Online Tool | Tools24Now',
  description: 'Calculate the exact duration between two dates or times. Breakdown by years, months, and days.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Time Difference | Tools24Now',
    description: 'Calculate the exact duration between two dates or times. Breakdown by years, months, and days.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
