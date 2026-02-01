import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Break-Even Calc - Free Online Tool | Tools24Now',
  description: 'Find out exactly how much you need to sell to cover your costs and start making a profit.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Break-Even Calc | Tools24Now',
    description: 'Find out exactly how much you need to sell to cover your costs and start making a profit.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
