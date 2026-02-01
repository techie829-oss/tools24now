import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Exam Marks Calculator - Free Online Tool | Tools24Now',
  description: 'Sum up marks and calculate percentages quickly. Avoid math errors during grading season.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Exam Marks Calculator | Tools24Now',
    description: 'Sum up marks and calculate percentages quickly. Avoid math errors during grading season.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
