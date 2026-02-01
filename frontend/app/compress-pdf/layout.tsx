import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Compress PDF - Free Online Tool | Tools24Now',
  description: 'Shrink your PDF file size without losing quality. Make your documents email-friendly and faster to upload.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Compress PDF | Tools24Now',
    description: 'Shrink your PDF file size without losing quality. Make your documents email-friendly and faster to upload.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
