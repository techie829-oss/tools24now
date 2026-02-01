'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Link2, Minimize2, FileText, Calculator, QrCode, Search, X, Receipt,
  Lock as LockIcon, Zap, CheckCircle
} from 'lucide-react';
import {
  pdfTools, imageTools, businessTools, financeTools,
  utilityTools, developerTools, designTools, networkTools,
  educationTools, dateTools, allTools
} from '@/lib/tools-data';


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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = allTools.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            {/* Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl leading-5 bg-white shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg transition-shadow"
                  placeholder="Search for tools (e.g. Invoice, PDF, QR...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </button>
                )}
              </div>
            </div>

            {!searchQuery && (
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  href="#pdf-tools"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Explore Tools
                </Link>
              </div>
            )}

            {!searchQuery && (
              /* Quick Stats */
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
            )}
          </div>
        </div>
      </div>

      {searchQuery ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[500px]">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search Results for "{searchQuery}"
          </h2>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTools.map((tool) => {
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
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
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
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tools found</h3>
              <p className="text-gray-500 mt-2">Try searching for something else like "PDF" or "Invoice"</p>
            </div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
