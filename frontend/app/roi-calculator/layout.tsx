import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'ROI Calculator - Free Online Tool | Tools24Now',
  description: 'Evaluate your investment returns. See if a project or marketing campaign is worth your money.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'ROI Calculator | Tools24Now',
    description: 'Evaluate your investment returns. See if a project or marketing campaign is worth your money.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
