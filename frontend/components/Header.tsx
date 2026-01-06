'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Image, Link2, Minimize2, FolderSync, FileText, Ruler, ChevronDown, Menu, Scissors, FileType, RefreshCw, Maximize2, Crop, Wand2, RotateCw, Stamp, Briefcase, Calculator, PieChart, TrendingUp, QrCode, Lock, Type, Fingerprint } from 'lucide-react';

// Tool Categories
const PDF_TOOLS = [
    { name: 'PDF to Images', href: '/pdf-to-images', icon: Image },
    { name: 'Merge PDF', href: '/merge-pdf', icon: Link2 },
    { name: 'Compress PDF', href: '/compress-pdf', icon: Minimize2 },
    { name: 'Organize PDF', href: '/organize-pdf', icon: FolderSync },
    { name: 'OCR PDF', href: '/ocr-pdf', icon: FileText },
    { name: 'Deskew PDF', href: '/deskew-pdf', icon: Ruler },
    { name: 'Split PDF', href: '/split-pdf', icon: Scissors },
    { name: 'PDF to Word', href: '/pdf-to-word', icon: FileType },
];

const IMAGE_TOOLS = [
    { name: 'Image Converter', href: '/image-converter', icon: RefreshCw },
    { name: 'Image Resizer', href: '/image-resizer', icon: Maximize2 },
    { name: 'Image Cropper', href: '/image-cropper', icon: Crop },
    { name: 'Image Filters', href: '/image-filters', icon: Wand2 },
    { name: 'Image Rotate', href: '/image-rotate', icon: RotateCw },
    { name: 'Watermark', href: '/image-watermark', icon: Stamp },
];

const BUSINESS_TOOLS = [
    { name: 'Invoice Generator', href: '/invoice-generator', icon: FileText },
    { name: 'GST Calculator', href: '/gst-calculator', icon: Calculator },
    { name: 'EMI Calculator', href: '/emi-calculator', icon: PieChart },
    { name: 'Profit Margin', href: '/profit-margin', icon: TrendingUp },
];

const UTILITY_TOOLS = [
    { name: 'QR Code Generator', href: '/qr-generator', icon: QrCode },
    { name: 'Password Generator', href: '/password-generator', icon: Lock },
    { name: 'Text Case Converter', href: '/text-case-converter', icon: Type },
    { name: 'Word Counter', href: '/word-counter', icon: FileText },
    { name: 'UUID Generator', href: '/uuid-generator', icon: Fingerprint },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                            <path d="M14 2v6h6" />
                        </svg>
                        <span className="text-xl font-bold text-gray-900">Tools24Now</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {/* Tools Mega Menu */}
                        <div className="relative group">
                            <button
                                onMouseEnter={() => setIsMenuOpen(true)}
                                onMouseLeave={() => setIsMenuOpen(false)}
                                className="flex items-center text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                            >
                                All Tools
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>

                            {/* Mega Menu Dropdown (Compact 3-Column) */}
                            {isMenuOpen && (
                                <div
                                    onMouseEnter={() => setIsMenuOpen(true)}
                                    onMouseLeave={() => setIsMenuOpen(false)}
                                    className="fixed left-0 right-0 top-16 w-full bg-white border-b border-gray-200 shadow-xl py-6 z-40"
                                >
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="grid grid-cols-4 gap-8">

                                            {/* PDF Tools Column */}
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> PDF Tools
                                                </h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {PDF_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded hover:bg-indigo-50 transition-colors group">
                                                            <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 mr-2" />
                                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Image Tools Column */}
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Image className="w-4 h-4" /> Image Tools
                                                </h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {IMAGE_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded hover:bg-indigo-50 transition-colors group">
                                                            <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 mr-2" />
                                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Business Tools Column */}
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" /> Business Tools
                                                </h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {BUSINESS_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded hover:bg-indigo-50 transition-colors group">
                                                            <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 mr-2" />
                                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Utility Tools Column */}
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Wand2 className="w-4 h-4" /> Utility Tools
                                                </h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {UTILITY_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded hover:bg-indigo-50 transition-colors group">
                                                            <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-purple-600 mr-2" />
                                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                            Home
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-gray-700">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}
