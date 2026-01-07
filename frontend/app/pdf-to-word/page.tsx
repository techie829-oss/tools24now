import type { Metadata } from 'next';
import PdfToWordClient from './PdfToWordClient';

export const metadata: Metadata = {
    title: 'PDF to Word Converter - Free Online Tool | Tools24Now',
    description: 'Convert PDF files to editable Word documents (.docx) instantly. Best free online PDF to Word converter. No signup required.',
    keywords: ['pdf to word', 'convert pdf to docx', 'editable pdf', 'online pdf converter', 'free pdf tools'],
    alternates: {
        canonical: '/pdf-to-word',
    },
};

export default function PdfToWordPage() {
    return <PdfToWordClient />;
}
