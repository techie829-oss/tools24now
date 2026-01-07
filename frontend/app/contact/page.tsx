import { Mail, MessageCircle, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | Tools24Now',
    description: 'Get in touch with the Tools24Now team for support, feature requests, or partnerships.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-24 px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Contact Us</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Email Support */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
                        <p className="mt-4 text-gray-600 text-sm">
                            For general inquiries, bug reports, and assistance.
                        </p>
                        <a href="mailto:support@tools24now.com" className="mt-6 inline-block text-blue-600 font-semibold hover:text-blue-500">
                            support@tools24now.com
                        </a>
                    </div>

                    {/* Feature Request */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <MessageCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Feature Requests</h3>
                        <p className="mt-4 text-gray-600 text-sm">
                            Want a new tool? Let us know what we should build next.
                        </p>
                        <a href="mailto:feedback@tools24now.com" className="mt-6 inline-block text-green-600 font-semibold hover:text-green-500">
                            feedback@tools24now.com
                        </a>
                    </div>
                </div>

                {/* FAQ Section Placeholder */}
                <div className="mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900">Is Tools24Now completely free?</h3>
                            <p className="mt-2 text-gray-600">Yes, all our tools are free to use without any hidden charges or subscriptions.</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900">Are my files safe?</h3>
                            <p className="mt-2 text-gray-600">Most tools process files directly in your browser. Files uploaded to our server for processing (like OCR) are automatically deleted after 1 hour.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
