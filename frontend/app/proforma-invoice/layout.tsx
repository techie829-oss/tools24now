import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Proforma Invoice - Free Online Tool | Tools24Now',
  description: 'Generate preliminary invoices for shipments and customs. conform to international trade standards.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Proforma Invoice | Tools24Now',
    description: 'Generate preliminary invoices for shipments and customs. conform to international trade standards.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
