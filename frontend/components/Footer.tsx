export default function Footer() {
    return (
        <footer className="bg-slate-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
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
                            <li><a href="/invoice-generator" className="hover:text-white transition-colors">Invoice Generator</a></li>
                            <li><a href="/gst-calculator" className="hover:text-white transition-colors">GST Calculator</a></li>
                            <li><a href="/emi-calculator" className="hover:text-white transition-colors">EMI Calculator</a></li>
                            <li><a href="/profit-margin" className="hover:text-white transition-colors">Profit Margin</a></li>
                        </ul>
                    </div>

                    {/* Utility Tools */}
                    <div>
                        <h3 className="font-semibold mb-4 text-purple-400">Utility Tools</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/qr-generator" className="hover:text-white transition-colors">QR Generator</a></li>
                            <li><a href="/password-generator" className="hover:text-white transition-colors">Password Gen</a></li>
                            <li><a href="/text-case-converter" className="hover:text-white transition-colors">Case Converter</a></li>
                            <li><a href="/word-counter" className="hover:text-white transition-colors">Word Counter</a></li>
                            <li><a href="/uuid-generator" className="hover:text-white transition-colors">UUID Gen</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                    © 2026 Tools24Now. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
