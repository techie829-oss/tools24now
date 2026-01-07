import type { Metadata } from 'next';
import CompanyValuationClient from './CompanyValuationClient';

export const metadata: Metadata = {
    title: 'Company Valuation Calculator - Estimate Startup Value | Tools24Now',
    description: 'Estimate your business worth using revenue and profit multipliers. Ideal for startups, SaaS, and small businesses. Free online calculator.',
    keywords: ['company valuation', 'business worth', 'startup valuation', 'revenue multiplier', 'ebitda multiple'],
    alternates: {
        canonical: '/company-valuation',
    },
};

export default function CompanyValuationPage() {
    return <CompanyValuationClient />;
}
