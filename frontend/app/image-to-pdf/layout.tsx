import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image to PDF - Free Online Tool | Tools24Now',
  description: 'Turn your photos and images into a single, professional PDF document in seconds. Great for portfolios and receipts.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Image to PDF | Tools24Now',
    description: 'Turn your photos and images into a single, professional PDF document in seconds. Great for portfolios and receipts.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
