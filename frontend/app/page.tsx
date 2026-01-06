import Link from 'next/link';
import { Images, Link2, Minimize2, FolderSync, ScanEye, Ruler, Scissors, FileType, RefreshCw, Maximize2, Crop, Wand2, RotateCw, Stamp } from 'lucide-react';

// Icon mapping for PDF tools
const pdfToolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'PDF to Images': Images,
  'Merge PDF': Link2,
  'Compress PDF': Minimize2,
  'Organize PDF': FolderSync,
  'OCR PDF': ScanEye,
  'Deskew PDF': Ruler,
  'Split PDF': Scissors,
  'PDF to Word': FileType,
};

// Icon mapping for Image tools
const imageToolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Image Converter': RefreshCw,
  'Image Compressor': Minimize2,
  'Image Resizer': Maximize2,
  'Image Cropper': Crop,
  'Image Filters': Wand2,
  'Image Rotate & Flip': RotateCw,
  'Image Watermark': Stamp,
};

export default function Home() {
  const pdfTools = [
    {
      title: 'PDF to Images',
      description: 'Extract pages as high-quality PNG images',
      href: '/pdf-to-images',
      available: true,
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one document',
      href: '/merge-pdf',
      available: true,
    },
    {
      title: 'Compress PDF',
      description: 'Reduce file size while optimizing quality',
      href: '/compress-pdf',
      available: true,
    },
    {
      title: 'Organize PDF',
      description: 'Sort, add and delete PDF pages',
      href: '/organize-pdf',
      available: true,
    },
    {
      title: 'OCR PDF',
      description: 'Convert scanned documents to searchable text',
      href: '/ocr-pdf',
      available: true,
    },
    {
      title: 'Deskew PDF',
      description: 'Automatically straighten skewed documents',
      href: '/deskew-pdf',
      available: true,
    },
    {
      title: 'Split PDF',
      description: 'Extract selected pages from your PDF',
      href: '/split-pdf',
      available: true,
    },
    {
      title: 'PDF to Word',
      description: 'Convert PDF to editable Word documents',
      href: '/pdf-to-word',
      available: true,
    },
  ];

  const imageTools = [
    {
      title: 'Image Converter',
      description: 'Convert between JPG, PNG, WebP formats',
      href: '/image-converter',
      available: true,
    },
    {
      title: 'Image Compressor',
      description: 'Reduce file size with quality control',
      href: '/image-compressor',
      available: true,
    },
    {
      title: 'Image Resizer',
      description: 'Resize by dimensions, percentage, or presets',
      href: '/image-resizer',
      available: true,
    },
    {
      title: 'Image Cropper',
      description: 'Crop with aspect ratios or coordinates',
      href: '/image-cropper',
      available: true,
    },
    {
      title: 'Image Filters',
      description: 'Apply filters with live before/after preview',
      href: '/image-filters',
      available: true,
    },
    {
      title: 'Image Rotate & Flip',
      description: 'Rotate and flip images with one click',
      href: '/image-rotate',
      available: true,
    },
    {
      title: 'Image Watermark',
      description: 'Add text or logo watermarks to protect images',
      href: '/image-watermark',
      available: true,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="block text-gray-900">Free PDF & Image Tools</span>
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mt-2">
                Online, Fast & Secure
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Professional document and image processing tools. No software to install, no registration required.
              All processing happens securely in your browser.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="#pdf-tools"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                Browse Tools
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  100%
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Free to Use</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  🔒
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Privacy First</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  ⚡
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Lightning Fast</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Tools Section */}
      <div id="pdf-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            📄 PDF Tools
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Comprehensive PDF processing tools. No installation required.
          </p>
        </div>

        {/* PDF Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pdfTools.map((tool) => {
            const IconComponent = pdfToolIcons[tool.title];
            return (
              <Link
                key={tool.title}
                href={tool.available ? tool.href : '#'}
                className={`group relative bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 ${tool.available
                  ? 'hover:border-indigo-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
                  }`}
              >
                {!tool.available && (
                  <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    Soon
                  </span>
                )}

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                  {IconComponent && <IconComponent className="w-6 h-6 text-indigo-600" />}
                </div>

                {/* Tool Info */}
                <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm leading-snug">
                  {tool.description}
                </p>

                {/* Arrow Icon */}
                {tool.available && (
                  <div className="mt-3 flex items-center text-indigo-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Try now</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Image Tools Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🖼️ Image Tools
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Professional image processing and conversion tools.
            </p>
          </div>

          {/* Image Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {imageTools.map((tool) => {
              const IconComponent = imageToolIcons[tool.title];
              return (
                <Link
                  key={tool.title}
                  href={tool.available ? tool.href : '#'}
                  className={`group relative bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 ${tool.available
                    ? 'hover:border-emerald-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                    }`}
                >
                  {!tool.available && (
                    <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      Soon
                    </span>
                  )}

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                    {IconComponent && <IconComponent className="w-6 h-6 text-emerald-600" />}
                  </div>

                  {/* Tool Info */}
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-snug">
                    {tool.description}
                  </p>

                  {/* Arrow Icon */}
                  {tool.available && (
                    <div className="mt-3 flex items-center text-emerald-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Try now</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Tools Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            💼 Business Tools
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Professional tools for business operations and finance.
          </p>
        </div>

        {/* Business Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/invoice-generator"
            className="group relative bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Tool Info */}
            <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
              Invoice Generator
            </h3>
            <p className="text-gray-600 text-sm leading-snug">
              Create professional invoices with GST, QR codes, and more.
            </p>

            {/* Arrow Icon */}
            <div className="mt-3 flex items-center text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Try now</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/gst-calculator"
            className="group relative bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Tool Info */}
            <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
              GST Calculator
            </h3>
            <p className="text-gray-600 text-sm leading-snug">
              Calculate inclusive & exclusive GST instantly.
            </p>

            {/* Arrow Icon */}
            <div className="mt-3 flex items-center text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Try now</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/emi-calculator"
            className="group relative bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>

            {/* Tool Info */}
            <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
              EMI Calculator
            </h3>
            <p className="text-gray-600 text-sm leading-snug">
              Calculate loan EMIs with amortization.
            </p>

            {/* Arrow Icon */}
            <div className="mt-3 flex items-center text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Try now</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/profit-margin"
            className="group relative bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            {/* Tool Info */}
            <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
              Profit Margin
            </h3>
            <p className="text-gray-600 text-sm leading-snug">
              Calculate margins, markups & optimal pricing.
            </p>

            {/* Arrow Icon */}
            <div className="mt-3 flex items-center text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Try now</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Why Choose Tools24Now?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Secure & Private</h3>
              <p className="text-gray-600">
                Your files are processed securely. We don't store or share your data. All processing happens in your browser.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized processing engines deliver results in seconds. No waiting, no queues, just instant results.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Completely Free</h3>
              <p className="text-gray-600">
                All tools are 100% free with no hidden costs. No registration required, no premium plans, just free tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
