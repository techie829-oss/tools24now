import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github, Mail } from 'lucide-react';
export default function Footer() {
    return (
        <footer className="bg-slate-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                            </svg>
                            <span className="font-bold">Tools24Now</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Making file manipulation easy, fast, and secure for everyone.
                        </p>
                    </div>

                    {/* PDF Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-indigo-400">PDF Tools</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/pdf-to-images" className="hover:text-white transition-colors">PDF to Images</a></li>
                            <li><a href="/merge-pdf" className="hover:text-white transition-colors">Merge PDF</a></li>
                            <li><a href="/compress-pdf" className="hover:text-white transition-colors">Compress PDF</a></li>
                            <li><a href="/ocr-pdf" className="hover:text-white transition-colors">OCR PDF</a></li>
                            <li><a href="/table-extractor" className="hover:text-white transition-colors">Table Extractor</a></li>
                        </ul>
                    </div>

                    {/* Image Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-emerald-400">Image Tools</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/image-converter" className="hover:text-white transition-colors">Image Converter</a></li>
                            <li><a href="/image-resizer" className="hover:text-white transition-colors">Image Resizer</a></li>
                            <li><a href="/image-filters" className="hover:text-white transition-colors">Image Filters</a></li>
                            <li><a href="/image-watermark" className="hover:text-white transition-colors">Watermark</a></li>
                        </ul>
                    </div>

                    {/* Business Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-blue-400">Business</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/invoice-generator" className="hover:text-white transition-colors">Invoice</a></li>
                            <li><a href="/resume-builder" className="hover:text-white transition-colors">Resume</a></li>
                            <li><a href="/qr-menu-generator" className="hover:text-white transition-colors">QR Menu</a></li>
                            <li><a href="/barcode-generator" className="hover:text-white transition-colors">Barcode</a></li>
                            <li><a href="/receipt-scanner" className="hover:text-white transition-colors">Receipt Scanner</a></li>
                        </ul>
                    </div>

                    {/* Utility Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-purple-400">Utility</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/qr-generator" className="hover:text-white transition-colors">QR Code</a></li>
                            <li><a href="/password-generator" className="hover:text-white transition-colors">Password</a></li>
                            <li><a href="/text-case-converter" className="hover:text-white transition-colors">Text Case</a></li>
                        </ul>
                    </div>

                    {/* Developer Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-orange-400">Developer</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/base64-converter" className="hover:text-white transition-colors">Base64</a></li>
                            <li><a href="/json-formatter" className="hover:text-white transition-colors">JSON</a></li>
                            <li><a href="/hash-generator" className="hover:text-white transition-colors">Hash</a></li>
                            <li><a href="/ssl-checker" className="hover:text-white transition-colors">SSL Checker</a></li>
                            <li><a href="/header-inspector" className="hover:text-white transition-colors">Headers</a></li>
                            <li><a href="/regex-tester" className="hover:text-white transition-colors">Regex</a></li>
                        </ul>
                    </div>

                    {/* Design Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-pink-400">Design</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/color-tools" className="hover:text-white transition-colors">Colors</a></li>
                            <li><a href="/unit-converter" className="hover:text-white transition-colors">Units</a></li>
                            <li><a href="/markdown-editor" className="hover:text-white transition-colors">Markdown</a></li>
                        </ul>
                    </div>

                    {/* Date Tools */}
                    <div>
                        <h4 className="font-bold mb-3 text-rose-300">Date & Time</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/timestamp-converter" className="hover:text-white">Timestamp Converter</a></li>
                            <li><a href="/time-difference" className="hover:text-white">Time Difference</a></li>
                            <li><a href="/age-calculator" className="hover:text-white">Age Calculator</a></li>
                        </ul>

                        <h4 className="font-bold mt-6 mb-3 text-orange-300">Network</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/my-ip" className="hover:text-white">My IP Address</a></li>
                            <li><a href="/dns-lookup" className="hover:text-white">DNS Lookup</a></li>
                            <li><a href="/subnet-calculator" className="hover:text-white">Subnet Calculator</a></li>
                        </ul>
                    </div>

                    {/* Security Tools */}

                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                    © 2026 Tools24Now. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
