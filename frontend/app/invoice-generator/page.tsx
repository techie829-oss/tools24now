import type { Metadata } from 'next';
import InvoiceGeneratorClient from './InvoiceGeneratorClient';

export const metadata: Metadata = {
    title: 'Free Invoice Generator - Professional GST Invoices | Tools24Now',
    description: 'Create professional invoices (GST/Non-GST) in seconds. Download as PDF. Calculate taxes, discounts, and totals automatically.',
    keywords: ['invoice generator', 'free invoice maker', 'gst invoice', 'online billing software', 'proforma invoice'],
    alternates: {
        canonical: '/invoice-generator',
    },
};

export default function InvoiceGeneratorPage() {
    return <InvoiceGeneratorClient />;
}
