import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Timestamp Converter - Free Online Tool | Tools24Now',
  description: 'Convert Unix timestamps to human-readable dates and vice-versa. A lifesaver for debugging.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Timestamp Converter | Tools24Now',
    description: 'Convert Unix timestamps to human-readable dates and vice-versa. A lifesaver for debugging.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
