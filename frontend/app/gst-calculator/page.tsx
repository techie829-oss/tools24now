import type { Metadata } from 'next';
import GSTCalculatorClient from './GSTCalculatorClient';

export const metadata: Metadata = {
    title: 'GST Calculator India - Inclusive & Exclusive Tax | Tools24Now',
    description: 'Calculate GST amounts instantly. Switch between Inclusive and Exclusive tax. Accurate GST breakdown for 5%, 12%, 18%, and 28%.',
    keywords: ['gst calculator', 'gst india', 'calculate gst', 'tax calculator', 'inclusive gst', 'exclusive gst'],
    alternates: {
        canonical: '/gst-calculator',
    },
};

export default function GSTCalculatorPage() {
    return <GSTCalculatorClient />;
}
