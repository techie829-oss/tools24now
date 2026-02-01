import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Profit Margin - Free Online Tool | Tools24Now',
  description: 'Calculate your gross and net profit margins. Set the right prices to ensure your business grows.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Profit Margin | Tools24Now',
    description: 'Calculate your gross and net profit margins. Set the right prices to ensure your business grows.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
