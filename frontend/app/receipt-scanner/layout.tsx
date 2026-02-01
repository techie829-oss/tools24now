import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Receipt Scanner - Free Online Tool | Tools24Now',
  description: 'Digitize your paper receipts. Extract date, amount, and merchant info automatically for expense tracking.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Receipt Scanner | Tools24Now',
    description: 'Digitize your paper receipts. Extract date, amount, and merchant info automatically for expense tracking.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
