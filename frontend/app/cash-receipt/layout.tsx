import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cash Receipt - Free Online Tool | Tools24Now',
  description: 'Issue instant receipts for cash payments. Keep your financial records accurate and professional.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Cash Receipt | Tools24Now',
    description: 'Issue instant receipts for cash payments. Keep your financial records accurate and professional.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
