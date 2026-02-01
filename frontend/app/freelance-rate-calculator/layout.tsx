import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Freelance Rate - Free Online Tool | Tools24Now',
  description: 'Not sure what to charge? Calculate your ideal hourly rate based on your income goals and expenses.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Freelance Rate | Tools24Now',
    description: 'Not sure what to charge? Calculate your ideal hourly rate based on your income goals and expenses.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
