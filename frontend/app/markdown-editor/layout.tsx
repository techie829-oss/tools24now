import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Markdown Editor - Free Online Tool | Tools24Now',
  description: 'Write Markdown with a live preview. The perfect distraction-free environment for docs and notes.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Markdown Editor | Tools24Now',
    description: 'Write Markdown with a live preview. The perfect distraction-free environment for docs and notes.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
