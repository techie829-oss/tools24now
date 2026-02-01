import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'GST Split Calc - Free Online Tool | Tools24Now',
  description: 'Figure out the base price and tax amount from a total inclusive figure. Essential for billing.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'GST Split Calc | Tools24Now',
    description: 'Figure out the base price and tax amount from a total inclusive figure. Essential for billing.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
