import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'GST Calculator - Free Online Tool | Tools24Now',
  description: 'Calculate GST amounts accurately. Add or remove tax from your prices with this simple Indian GST calculator.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'GST Calculator | Tools24Now',
    description: 'Calculate GST amounts accurately. Add or remove tax from your prices with this simple Indian GST calculator.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
