import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Subnet Calculator - Free Online Tool | Tools24Now',
  description: 'Calculate IP ranges, masks, and subnets easily. Essential for network planning and setup.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Subnet Calculator | Tools24Now',
    description: 'Calculate IP ranges, masks, and subnets easily. Essential for network planning and setup.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
