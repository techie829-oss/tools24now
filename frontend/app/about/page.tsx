import { Shield, Zap, Users, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Tools24Now',
    description: 'Learn about our mission to provide free, secure, and fast online tools for everyone.',
};

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative py-24 px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">We Make Digital Tasks Simple</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Tools24Now is built with a single mission: to provide high-quality, professional-grade online tools for free. No subscriptions, no hidden fees, just pure utility.
                    </p>
                </div>
            </div>

            {/* Values Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3">
                        <div className="flex flex-col items-start">
                            <div className="rounded-xl bg-indigo-100 p-3 mb-4">
                                <Zap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                We leverage modern web technologies (WebAssembly, Client-side processing) to ensure your tasks are completed instantly, often without uploading files to a server.
                            </p>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="rounded-xl bg-purple-100 p-3 mb-4">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy First</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Your data security is paramount. For most tools (like Image Compressing, PDF Merging), files are processed locally in your browser and never leave your device.
                            </p>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="rounded-xl bg-blue-100 p-3 mb-4">
                                <Globe className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Accessible to All</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                We believe essential digital tools should be accessible to everyone, everywhere. That's why our platform is 100% free and mobile-friendly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team/Story Section */}
            <div className="bg-gray-50 py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Story</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Started as a small project to help students and freelancers with daily PDF tasks, Tools24Now has grown into a comprehensive suite of over 50 utilities. We are constantly expanding based on user feedback.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
