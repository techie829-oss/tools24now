import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github, Mail, Shield, Globe, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0f172a] text-gray-300 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-6">
                            <Logo className="w-10 h-10" theme="dark" textClassName="text-2xl font-bold" />
                        </div>
                        <p className="text-sm text-gray-400 mb-8 max-w-sm leading-relaxed">
                            A comprehensive suite of free, professional-grade online tools for developers, designers, and business professionals. Secure, fast, and always free.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-gray-400">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-100 hover:text-black transition-all text-gray-400">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="mailto:support@tools24now.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-gray-400">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links 1 */}
                    <div>
                        <h3 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Popular Tools</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/pdf-to-word" className="hover:text-blue-400 transition-colors">PDF to Word</Link></li>
                            <li><Link href="/image-compressor" className="hover:text-blue-400 transition-colors">Image Compressor</Link></li>
                            <li><Link href="/invoice-generator" className="hover:text-blue-400 transition-colors">Invoice Generator</Link></li>
                            <li><Link href="/gst-calculator" className="hover:text-blue-400 transition-colors">GST Calculator</Link></li>
                            <li><Link href="/resume-builder" className="hover:text-blue-400 transition-colors">Resume Builder</Link></li>
                            <li><Link href="/qr-generator" className="hover:text-blue-400 transition-colors">QR Code Maker</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links 2 */}
                    <div>
                        <h3 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Categories</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/#pdf-tools" className="hover:text-blue-400 transition-colors">PDF Tools</Link></li>
                            <li><Link href="/#image-tools" className="hover:text-blue-400 transition-colors">Image Tools</Link></li>
                            <li><Link href="/#business-tools" className="hover:text-blue-400 transition-colors">Business & Finance</Link></li>
                            <li><Link href="/#developer-tools" className="hover:text-blue-400 transition-colors">Developer Utilities</Link></li>
                            <li><Link href="/#education-tools" className="hover:text-blue-400 transition-colors">Education</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Globe className="w-4 h-4" /> About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Mail className="w-4 h-4" /> Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Shield className="w-4 h-4" /> Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Shield className="w-4 h-4" /> Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {currentYear} Tools24Now. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
