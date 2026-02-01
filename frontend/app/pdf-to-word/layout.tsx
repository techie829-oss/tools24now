import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'PDF to Word - Free Online Tool | Tools24Now',
  description: 'Convert PDFs into editable Word documents. Keep your formatting intact and stop retyping everything.. Fast, secure, and free online tool. No signup required.',
  openGraph: {
    title: 'PDF to Word | Tools24Now',
    description: 'Convert PDFs into editable Word documents. Keep your formatting intact and stop retyping everything.',
  }
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
