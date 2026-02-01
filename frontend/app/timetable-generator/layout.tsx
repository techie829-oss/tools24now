import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Timetable Generator - Free Online Tool | Tools24Now',
  description: 'Create clear weekly schedules for schools or personal study. Print and stay organized.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'Timetable Generator | Tools24Now',
    description: 'Create clear weekly schedules for schools or personal study. Print and stay organized.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
