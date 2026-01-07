'use client';

import Link from 'next/link';
import {
  Images, Link2, Minimize2, FolderSync, ScanEye, Ruler, Scissors, FileType,
  RefreshCw, Maximize2, Crop, Wand2, RotateCw, Stamp,
  FileText, Calculator, PieChart, TrendingUp, FileUser, UtensilsCrossed, Barcode, Table as TableIcon,
  QrCode, Lock, Type, Fingerprint, Binary, Code, Hash, FileCode, Palette, ArrowRightLeft,
  Clock, Timer, Cake, Network, Search, Server, Receipt, SearchCode, Shield, CheckCircle, Zap, Lock as LockIcon,
  Calendar, Award, Users, Home as HomeIcon, BookOpen, GraduationCap,
  ScrollText, Briefcase, Landmark, Coins, Target, Percent, BarChart3, Building2
} from 'lucide-react';

// --- Tool Data ---

const pdfTools = [
  { title: 'PDF to Images', description: 'Extract pages as high-quality PNG images', href: '/pdf-to-images', icon: Images, available: true },
  { title: 'Image to PDF', description: 'Combine images into a single PDF file', href: '/image-to-pdf', icon: Images, available: true },
  { title: 'Merge PDF', description: 'Combine multiple PDFs into one document', href: '/merge-pdf', icon: Link2, available: true },
  { title: 'Compress PDF', description: 'Reduce file size while optimizing quality', href: '/compress-pdf', icon: Minimize2, available: true },
  { title: 'Organize PDF', description: 'Sort, add and delete PDF pages', href: '/organize-pdf', icon: FolderSync, available: true },
  { title: 'OCR PDF', description: 'Convert scanned documents to searchable text', href: '/ocr-pdf', icon: ScanEye, available: true },
  { title: 'Deskew PDF', description: 'Automatically straighten skewed documents', href: '/deskew-pdf', icon: Ruler, available: true },
  { title: 'Split PDF', description: 'Extract selected pages from your PDF', href: '/split-pdf', icon: Scissors, available: true },
  { title: 'PDF to Word', description: 'Convert PDF to editable Word documents', href: '/pdf-to-word', icon: FileType, available: true },
  { title: 'Table Extractor', description: 'Extract tables from PDF to CSV/Excel', href: '/table-extractor', icon: TableIcon, available: true },
];

const imageTools = [
  { title: 'Image Converter', description: 'Convert between JPG, PNG, WebP formats', href: '/image-converter', icon: RefreshCw, available: true },
  { title: 'Image Compressor', description: 'Reduce file size with quality control', href: '/image-compressor', icon: Minimize2, available: true },
  { title: 'Image Resizer', description: 'Resize by dimensions, percentage, or presets', href: '/image-resizer', icon: Maximize2, available: true },
  { title: 'Image Cropper', description: 'Crop with aspect ratios or coordinates', href: '/image-cropper', icon: Crop, available: true },
  { title: 'Image Filters', description: 'Apply filters with live preview', href: '/image-filters', icon: Wand2, available: true },
  { title: 'Image Rotate & Flip', description: 'Rotate and flip images with one click', href: '/image-rotate', icon: RotateCw, available: true },
  { title: 'Image Watermark', description: 'Add text or logo watermarks to protect images', href: '/image-watermark', icon: Stamp, available: true },
];

const businessTools = [
  { title: 'Invoice Generator', description: 'Create professional invoices with GST', href: '/invoice-generator', icon: FileText, available: true },
  { title: 'Quote / Estimate', description: 'Create and download quotes instantly', href: '/quote-generator', icon: ScrollText, available: true },
  { title: 'Proforma Invoice', description: 'Generate proforma invoices for exports', href: '/proforma-invoice', icon: FileText, available: true },
  { title: 'Purchase Order', description: 'Create standardized Purchase Orders', href: '/purchase-order', icon: Briefcase, available: true },
  { title: 'Cash Receipt', description: 'Generate payment receipts quickly', href: '/cash-receipt', icon: Receipt, available: true },
  { title: 'Quick Resume Builder', description: 'Create a clean resume PDF in minutes', href: '/resume-builder', icon: FileUser, available: true },
  { title: 'Business Name Gen', description: 'Generate creative business names', href: '/business-name-generator', icon: Building2, available: true },
  { title: 'QR Menu Generator', description: 'Create digital menus for restaurants', href: '/qr-menu-generator', icon: UtensilsCrossed, available: true },
  { title: 'Barcode Generator', description: 'Generate custom barcodes for products', href: '/barcode-generator', icon: Barcode, available: true },
  { title: 'Receipt Scanner', description: 'Scan and extract data from receipts', href: '/receipt-scanner', icon: Receipt, available: true },
];

const financeTools = [
  { title: 'GST Calculator', description: 'Calculate inclusive & exclusive GST instantly', href: '/gst-calculator', icon: Calculator, available: true },
  { title: 'GST Returns', description: 'Estimate GSTR-1 and GSTR-3B summaries', href: '/gst-return-summary', icon: FileText, available: true },
  { title: 'GST Split Calc', description: 'Find Base and Tax from Total Amount', href: '/gst-split-calculator', icon: Percent, available: true },
  { title: 'TDS Calculator', description: 'Calculate TDS for various sections', href: '/tds-calculator', icon: Landmark, available: true },
  { title: 'Salary Calculator', description: 'Estimate In-Hand Salary from CTC', href: '/salary-calculator', icon: Coins, available: true },
  { title: 'Freelance Rate', description: 'Calculate hourly rates for freelancers', href: '/freelance-rate-calculator', icon: Clock, available: true },
  { title: 'Break-Even Calc', description: 'Find sales volume to cover costs', href: '/break-even-calculator', icon: Target, available: true },
  { title: 'Profit Margin', description: 'Calculate margins, markups & optimal pricing', href: '/profit-margin', icon: TrendingUp, available: true },
  { title: 'ROI Calculator', description: 'Calculate Return on Investment', href: '/roi-calculator', icon: TrendingUp, available: true },
  { title: 'Valuation Calc', description: 'Estimate your company valuation', href: '/company-valuation', icon: BarChart3, available: true },
  { title: 'EMI Calculator', description: 'Calculate loan EMIs with amortization', href: '/emi-calculator', icon: PieChart, available: true },
];

const utilityTools = [
  { title: 'QR Code Generator', description: 'Create QR codes for URLs, text, wifi', href: '/qr-generator', icon: QrCode, available: true },
  { title: 'File Metadata', description: 'View and edit PDF/Image metadata', href: '/file-metadata', icon: FileText, available: true },
  { title: 'Password Generator', description: 'Generate strong, secure passwords', href: '/password-generator', icon: Lock, available: true },
  { title: 'Text Case Converter', description: 'Convert text to UPPER, lower, Title Case', href: '/text-case-converter', icon: Type, available: true },
  { title: 'Word Counter', description: 'Count words, characters, text statistics', href: '/word-counter', icon: FileText, available: true },
  { title: 'UUID Generator', description: 'Generate random UUIDs (v1, v4)', href: '/uuid-generator', icon: Fingerprint, available: true },
];

const developerTools = [
  { title: 'Base64 Converter', description: 'Encode/Decode Base64 strings', href: '/base64-converter', icon: Binary, available: true },
  { title: 'JSON <-> XML', description: 'Convert between JSON and XML formats', href: '/json-xml-converter', icon: ArrowRightLeft, available: true },
  { title: 'JSON Formatter', description: 'Validate and format JSON data', href: '/json-formatter', icon: Code, available: true },
  { title: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256 hashes', href: '/hash-generator', icon: Hash, available: true },
  { title: 'Markdown Editor', description: 'Write and preview Markdown live', href: '/markdown-editor', icon: FileCode, available: true },
  { title: 'SSL Checker', description: 'Verify SSL certificate validity', href: '/ssl-checker', icon: Shield, available: true },
  { title: 'Header Inspector', description: 'Analyze HTTP headers', href: '/header-inspector', icon: Server, available: true },
  { title: 'Regex Tester', description: 'Test and debug regular expressions', href: '/regex-tester', icon: SearchCode, available: true },
];

const designTools = [
  { title: 'Color Tools', description: 'Pick, convert and generate color palettes', href: '/color-tools', icon: Palette, available: true },
  { title: 'Unit Converter', description: 'Convert common units of measurement', href: '/unit-converter', icon: ArrowRightLeft, available: true },
];

const networkTools = [
  { title: 'My IP Address', description: 'Check your public IP address info', href: '/my-ip', icon: Network, available: true },
  { title: 'DNS Lookup', description: 'Perform DNS record lookups', href: '/dns-lookup', icon: Search, available: true },
  { title: 'Subnet Calculator', description: 'Calculate IP subnets and ranges', href: '/subnet-calculator', icon: Calculator, available: true },
];

const educationTools = [
  { title: 'Timetable Generator', description: 'Design weekly class schedules', href: '/timetable-generator', icon: Calendar, available: true },
  { title: 'Student ID Generator', description: 'Create bulk student ID cards', href: '/student-id-generator', icon: FileUser, available: true },
  { title: 'Fee Receipt Generator', description: 'Generate school fee receipts', href: '/fee-receipt-generator', icon: Receipt, available: true },
  { title: 'Exam Marks Calculator', description: 'Calculate percentages and totals', href: '/exam-marks-calculator', icon: Calculator, available: true },
  { title: 'Grade Converter', description: 'Convert marks to grades (GPA)', href: '/grade-converter', icon: Award, available: true },
  { title: 'Attendance Calculator', description: 'Track student attendance %', href: '/attendance-calculator', icon: Users, available: true },
  { title: 'Hostel Allocation', description: 'Manage room allocations', href: '/hostel-allocation', icon: HomeIcon, available: true },
  { title: 'Library Fine', description: 'Calculate overdue book fines', href: '/library-fine-calculator', icon: BookOpen, available: true },
];

const dateTools = [
  { title: 'Timestamp Converter', description: 'Unix <-> Human Date conversion', href: '/timestamp-converter', icon: Clock, available: true },
  { title: 'Time Difference', description: 'Calculate duration between dates', href: '/time-difference', icon: Timer, available: true },
  { title: 'Age Calculator', description: 'Calculate exact age & birthdays', href: '/age-calculator', icon: Cake, available: true },
];

// --- Components ---

const ToolSection = ({ title, tools, bgClass }: { title: string, tools: typeof pdfTools, bgClass?: string }) => (
  <div className={`py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${bgClass || ''}`}>
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.title}
            href={tool.available ? tool.href : '#'}
            className={`group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 ${tool.available
              ? 'hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
              }`}
          >
            {!tool.available && (
              <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">Soon</span>
            )}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300 ${title.includes('PDF') ? 'bg-indigo-50 text-indigo-600' :
              title.includes('Image') ? 'bg-emerald-50 text-emerald-600' :
                title.includes('Business') ? 'bg-blue-50 text-blue-600' :
                  title.includes('Finance') ? 'bg-indigo-50 text-indigo-600' :
                    title.includes('Utility') ? 'bg-purple-50 text-purple-600' :
                      title.includes('Developer') ? 'bg-orange-50 text-orange-600' :
                        title.includes('Network') ? 'bg-slate-50 text-slate-600' :
                          'bg-pink-50 text-pink-600'
              }`}>
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {tool.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {tool.description}
            </p>
          </Link>
        );
      })}
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="block text-gray-900">All-in-One</span>
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mt-2">
                Online Tools
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              PDF, Image, Business & Developer tools — fast, secure, free.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="#pdf-tools"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                Explore Tools
              </Link>
            </div>
            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">100%</div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Free to Use</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">🔒</div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Privacy First</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">⚡</div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Lightning Fast</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Tools */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🔥</span> Most Used Tools
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { title: 'Merge PDF', icon: Link2, href: '/merge-pdf', color: 'bg-indigo-50 text-indigo-600' },
              { title: 'Compress PDF', icon: Minimize2, href: '/compress-pdf', color: 'bg-indigo-50 text-indigo-600' },
              { title: 'Image Compressor', icon: Minimize2, href: '/image-compressor', color: 'bg-emerald-50 text-emerald-600' },
              { title: 'Invoice Generator', icon: FileText, href: '/invoice-generator', color: 'bg-blue-50 text-blue-600' },
              { title: 'GST Calculator', icon: Calculator, href: '/gst-calculator', color: 'bg-blue-50 text-blue-600' },
              { title: 'QR Generator', icon: QrCode, href: '/qr-generator', color: 'bg-purple-50 text-purple-600' },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all group text-center"
              >
                <div className={`p-3 rounded-lg mb-2 ${tool.color} group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-gray-800">{tool.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div id="pdf-tools">
        <ToolSection title="📄 PDF Tools" tools={pdfTools} />
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50">
        <ToolSection title="🖼️ Image Tools" tools={imageTools} />
      </div>

      <ToolSection title="💼 Business Tools" tools={businessTools} />

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50">
        <ToolSection title="💰 Finance & Tax Tools" tools={financeTools} />
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50">
        <ToolSection title="🛠️ Utility Tools" tools={utilityTools} />
      </div>

      <ToolSection title="👨‍💻 Developer Tools" tools={developerTools} />

      <div className="bg-gradient-to-br from-pink-50 to-red-50">
        <ToolSection title="🎨 Design Tools" tools={designTools} />
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50">
        <ToolSection title="🌐 Network Tools" tools={networkTools} />
      </div>

      <div className="bg-gradient-to-br from-teal-50 to-green-50">
        <ToolSection title="🎓 Education Tools" tools={educationTools} />
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50">
        <ToolSection title="⏰ Date & Time Tools" tools={dateTools} />
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Why Professionals Choose Tools24Now</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">No subscriptions, no hidden fees, just powerful tools at your fingertips.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-indigo-500 transition-colors">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <LockIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Processing</h3>
              <p className="text-gray-400">Your files never leave your browser for most operations. Server-side tasks are deleted immediately after processing.</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-indigo-500 transition-colors">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Results</h3>
              <p className="text-gray-400">Powered by advanced algorithms and WebAssembly to deliver desktop-class performance in your browser.</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-indigo-500 transition-colors">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">No Limits</h3>
              <p className="text-gray-400">Process as many files as you need. No daily limits, no file size restrictions on client-side tools.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
