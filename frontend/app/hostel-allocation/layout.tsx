import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Hostel Allocation - Free Online Tool | Tools24Now',
  description: 'Manage hostel room assignments efficiently. Organize students into rooms without conflict.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Hostel Allocation | Tools24Now',
    description: 'Manage hostel room assignments efficiently. Organize students into rooms without conflict.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
