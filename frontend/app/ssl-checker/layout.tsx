import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'SSL Checker - Free Online Tool | Tools24Now',
  description: 'Diagnose SSL certificate issues. Check expiration dates and verify the security chain of any domain.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'SSL Checker | Tools24Now',
    description: 'Diagnose SSL certificate issues. Check expiration dates and verify the security chain of any domain.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
