import type { Metadata } from 'next';
import ResumeBuilderClient from './ResumeBuilderClient';

export const metadata: Metadata = {
    title: 'Free Resume Builder - Professional Templates | Tools24Now',
    description: 'Build a professional resume with our free online builder. Choose from modern templates, export to PDF, and land your dream job.',
    keywords: ['resume builder', 'cv maker', 'free resume templates', 'pdf resume', 'job application'],
    alternates: {
        canonical: '/resume-builder',
    },
};

export default function ResumeBuilderPage() {
    return <ResumeBuilderClient />;
}
