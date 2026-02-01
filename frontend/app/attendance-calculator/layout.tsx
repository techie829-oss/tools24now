import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Attendance Calculator - Free Online Tool | Tools24Now',
  description: 'Track attendance requirements. See exactly how many classes you can skip or need to attend.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Attendance Calculator | Tools24Now',
    description: 'Track attendance requirements. See exactly how many classes you can skip or need to attend.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
