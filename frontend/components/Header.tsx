'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Image, Link2, Minimize2, FolderSync, FileText, Ruler, ChevronDown, Menu, X, Scissors, FileType, RefreshCw, Maximize2, Crop, Wand2, RotateCw, Stamp, Briefcase, Calculator, PieChart, TrendingUp, QrCode, Lock, Type, Fingerprint, Binary, Code, Hash, FileCode, Palette, ArrowRightLeft, FileUser, UtensilsCrossed, Barcode, Table as TableIcon, Receipt, Clock, Timer, Cake, Network, Globe, Search, Shield, Server, History, Calendar, Award, Users, Home, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRecentTools } from '../hooks/useRecentTools';

// Tool Categories
const PDF_TOOLS = [
    { name: 'PDF to Images', href: '/pdf-to-images', icon: Image },
    { name: 'Image to PDF', href: '/image-to-pdf', icon: Image },
    { name: 'Merge PDF', href: '/merge-pdf', icon: Link2 },
    { name: 'Compress PDF', href: '/compress-pdf', icon: Minimize2 },
    { name: 'Organize PDF', href: '/organize-pdf', icon: FolderSync },
    { name: 'OCR PDF', href: '/ocr-pdf', icon: FileText },
    { name: 'Deskew PDF', href: '/deskew-pdf', icon: Ruler },
    { name: 'Split PDF', href: '/split-pdf', icon: Scissors },
    { name: 'PDF to Word', href: '/pdf-to-word', icon: FileType },
    { name: 'Table Extractor', href: '/table-extractor', icon: TableIcon },
];

const IMAGE_TOOLS = [
    { name: 'Image Converter', href: '/image-converter', icon: RefreshCw },
    { name: 'Image Compressor', href: '/image-compressor', icon: Minimize2 },
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
    { name: 'Resume Builder', href: '/resume-builder', icon: FileUser },
    { name: 'QR Menu Generator', href: '/qr-menu-generator', icon: UtensilsCrossed },
    { name: 'Barcode Generator', href: '/barcode-generator', icon: Barcode },
    { name: 'Receipt Scanner', href: '/receipt-scanner', icon: Receipt },
];

const UTILITY_TOOLS = [
    { name: 'QR Code Generator', href: '/qr-generator', icon: QrCode },
    { name: 'File Metadata', href: '/file-metadata', icon: FileText },
    { name: 'Password Generator', href: '/password-generator', icon: Lock },
    { name: 'Text Case Converter', href: '/text-case-converter', icon: Type },
    { name: 'Word Counter', href: '/word-counter', icon: FileText },
    { name: 'UUID Generator', href: '/uuid-generator', icon: Fingerprint },
];

const DEVELOPER_TOOLS = [
    { name: 'Base64 Converter', href: '/base64-converter', icon: Binary },
    { name: 'JSON <-> XML', href: '/json-xml-converter', icon: ArrowRightLeft },
    { name: 'JSON Formatter', href: '/json-formatter', icon: Code },
    { name: 'Hash Generator', href: '/hash-generator', icon: Hash },
    { name: 'Markdown Editor', href: '/markdown-editor', icon: FileCode },
    { name: 'SSL Checker', href: '/ssl-checker', icon: Lock },
    { name: 'Header Inspector', href: '/header-inspector', icon: Server },
    { name: 'Regex Tester', href: '/regex-tester', icon: FileCode },
];

const DESIGN_TOOLS = [
    { name: 'Color Tools', href: '/color-tools', icon: Palette },
    { name: 'Unit Converter', href: '/unit-converter', icon: ArrowRightLeft },
];

const DATE_TOOLS = [
    { name: 'Timestamp Converter', href: '/timestamp-converter', icon: Clock },
    { name: 'Time Difference', href: '/time-difference', icon: Timer },
    { name: 'Age Calculator', href: '/age-calculator', icon: Cake },
];

const NETWORK_TOOLS = [
    { name: 'My IP Address', href: '/my-ip', icon: Network },
    { name: 'DNS Lookup', href: '/dns-lookup', icon: Search },
    { name: 'Subnet Calculator', href: '/subnet-calculator', icon: Calculator },
];

const EDUCATION_TOOLS = [
    { name: 'Timetable Generator', href: '/timetable-generator', icon: Calendar },
    { name: 'Student ID Generator', href: '/student-id-generator', icon: FileUser },
    { name: 'Fee Receipt Generator', href: '/fee-receipt-generator', icon: Receipt },
    { name: 'Exam Marks Calculator', href: '/exam-marks-calculator', icon: Calculator },
    { name: 'Grade Converter', href: '/grade-converter', icon: Award },
    { name: 'Attendance Calculator', href: '/attendance-calculator', icon: Users },
    { name: 'Hostel Allocation', href: '/hostel-allocation', icon: Home },
    { name: 'Library Fine', href: '/library-fine-calculator', icon: BookOpen },
];

const ALL_TOOLS = [
    ...PDF_TOOLS, ...IMAGE_TOOLS, ...BUSINESS_TOOLS, ...EDUCATION_TOOLS, ...UTILITY_TOOLS,
    ...DEVELOPER_TOOLS, ...DESIGN_TOOLS, ...NETWORK_TOOLS, ...DATE_TOOLS
];



export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();
    const { recentTools, addRecentTool } = useRecentTools();

    // Track usage
    useEffect(() => {
        if (pathname && pathname !== '/') {
            // Check if current path is a tool
            const isTool = ALL_TOOLS.some(t => t.href === pathname);
            if (isTool) {
                addRecentTool(pathname);
            }
        }
    }, [pathname]);

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsMenuOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsMenuOpen(false);
        }, 200);
    };

    // Prepare Recent Tools Data
    const recentToolsData = recentTools
        .map(href => ALL_TOOLS.find(t => t.href === href))
        .filter(Boolean) as typeof PDF_TOOLS;

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
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className="flex items-center text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                            >
                                All Tools
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>

                            {/* Mega Menu Dropdown */}
                            {isMenuOpen && (
                                <div
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    className="fixed left-0 right-0 top-16 w-full bg-white border-b border-gray-200 shadow-xl py-6 z-40 max-h-[85vh] overflow-y-auto"
                                >
                                    <div className="max-w-[95rem] mx-auto px-6 lg:px-8">
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">

                                            {/* Recently Used (Dynamic) - Spans 1 column but stands out */}
                                            {recentToolsData.length > 0 && (
                                                <div className="col-span-1 bg-indigo-50/50 rounded-lg p-3 border border-indigo-100 h-fit">
                                                    <h3 className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-2 uppercase tracking-wider">
                                                        <History className="w-3 h-3" /> Recent
                                                    </h3>
                                                    <div className="space-y-0.5">
                                                        {recentToolsData.map((tool) => (
                                                            <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-white hover:shadow-sm transition-all group">
                                                                <tool.icon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 mr-2" />
                                                                <span className="text-xs text-gray-700 group-hover:text-gray-900 font-bold truncate">{tool.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* PDF Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-indigo-600 mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> PDF Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {PDF_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-indigo-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Image Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2">
                                                    <Image className="w-4 h-4" /> Image Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {IMAGE_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-emerald-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Business Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" /> Business Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {BUSINESS_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-blue-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Utility Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-purple-600 mb-3 flex items-center gap-2">
                                                    <Wand2 className="w-4 h-4" /> Utility Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {UTILITY_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-purple-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Developer Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2">
                                                    <Code className="w-4 h-4" /> Developer Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {DEVELOPER_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-orange-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Design Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-pink-600 mb-3 flex items-center gap-2">
                                                    <Palette className="w-4 h-4" /> Design Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {DESIGN_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-pink-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Education Tools Column */}
                                            <div>
                                                <h3 className="text-sm font-bold text-teal-600 mb-3 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" /> Education Tools
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {EDUCATION_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-teal-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Network Tools Column */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-semibold text-gray-900 tracking-wider bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100 uppercase flex items-center gap-2">
                                                    <Network className="w-3 h-3 text-orange-600" />
                                                    Network
                                                </h3>
                                                <ul className="space-y-1">
                                                    {NETWORK_TOOLS.map((tool) => (
                                                        <li key={tool.name} className="group/item">
                                                            <Link href={tool.href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 group-hover/item:translate-x-1 transition-all p-1 -ml-1 rounded hover:bg-orange-50">
                                                                <div className="p-1 bg-gray-50 rounded group-hover/item:bg-white group-hover/item:shadow-sm transition-all text-gray-400 group-hover/item:text-orange-500 border border-transparent group-hover/item:border-orange-100">
                                                                    <tool.icon size={14} />
                                                                </div>
                                                                <span className="font-medium text-xs">{tool.name}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Date Tools */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-semibold text-gray-900 tracking-wider bg-rose-50 w-fit px-1.5 py-0.5 rounded border border-rose-100 uppercase flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-rose-600" />
                                                    Date & Time
                                                </h3>
                                                <div className="space-y-0.5">
                                                    {DATE_TOOLS.map((tool) => (
                                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMenuOpen(false)} className="flex items-center px-2 py-1.5 rounded hover:bg-cyan-50 transition-colors group">
                                                            <tool.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-600 mr-2" />
                                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{tool.name}</span>
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
                    <button
                        className="md:hidden text-gray-700 p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 z-50 bg-white overflow-y-auto pb-20">
                    <div className="px-4 py-6 space-y-8">

                        {/* Recently Used (Mobile) */}
                        {recentToolsData.length > 0 && (
                            <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                                <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <History className="w-4 h-4" /> Recent
                                </h3>
                                <div className="space-y-2">
                                    {recentToolsData.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-2 rounded hover:bg-white hover:shadow-sm transition-all">
                                            <tool.icon className="w-4 h-4 text-indigo-500 mr-3" />
                                            <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-indigo-600 mb-3 uppercase tracking-wider">PDF Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {PDF_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-emerald-600 mb-3 uppercase tracking-wider">Image Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {IMAGE_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider">Business Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {BUSINESS_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-purple-600 mb-3 uppercase tracking-wider">Utility Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {UTILITY_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-orange-600 mb-3 uppercase tracking-wider">Developer Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {DEVELOPER_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-pink-600 mb-3 uppercase tracking-wider">Design Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {DESIGN_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-orange-600 mb-3 uppercase tracking-wider bg-orange-50 w-fit px-2 py-1 rounded">Network</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {NETWORK_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-rose-600 mb-3 uppercase tracking-wider bg-rose-50 w-fit px-2 py-1 rounded">Date & Time</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {DATE_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50">
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
