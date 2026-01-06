'use client';

import React, { useState } from 'react';
import { Network, Server, Globe, ArrowRight, Code, Copy, Check, MousePointer } from 'lucide-react';
import { ApiService } from '@/lib/api';

interface HeaderInfo {
    status_code: number;
    url: string;
    headers: Record<string, string>;
    redirects: string[];
}

export default function HeaderInspectorPage() {
    const [url, setUrl] = useState('');
    const [userAgent, setUserAgent] = useState('');
    const [result, setResult] = useState<HeaderInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await ApiService.checkHeaders(url.trim(), userAgent);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to check HTTP headers');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(JSON.stringify(result.headers, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-3">
                        <Server className="w-10 h-10 text-blue-600" />
                        HTTP Header Inspector
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Analyze response headers, status codes, and redirect chains.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <form onSubmit={handleCheck} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Target URL</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all text-lg font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">User Agent (Optional)</label>
                            <div className="relative">
                                <MousePointer className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Default (Tools24Now/1.0)"
                                    value={userAgent}
                                    onChange={(e) => setUserAgent(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all font-mono text-sm text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed py-3 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <ArrowRight className="w-5 h-5" />}
                                {loading ? 'Analyzing...' : 'Inspect Headers'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 font-medium mb-8">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Bar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-2 rounded-lg font-bold text-xl ${result.status_code >= 200 && result.status_code < 300 ? 'bg-green-100 text-green-700' :
                                        result.status_code >= 300 && result.status_code < 400 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {result.status_code}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 font-bold uppercase">Final URL</div>
                                    <div className="font-mono text-gray-800 break-all">{result.url}</div>
                                </div>
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied JSON' : 'Copy JSON'}
                            </button>
                        </div>

                        {/* Redirect Chain */}
                        {result.redirects.length > 0 && (
                            <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-6">
                                <h3 className="text-yellow-800 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Network className="w-4 h-4" /> Redirect Chain
                                </h3>
                                <div className="space-y-2">
                                    {result.redirects.map((url, i) => (
                                        <div key={i} className="flex items-center gap-2 text-yellow-900 font-mono text-sm break-all">
                                            <span className="text-yellow-400">↳</span>
                                            {url}
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 text-green-700 font-mono text-sm font-bold break-all">
                                        <span className="text-green-500">↳</span>
                                        {result.url}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Headers Table */}
                        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-slate-300 font-mono text-sm">
                            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                                <Code className="w-5 h-5 text-blue-400" />
                                <span className="font-bold text-white">Response Headers</span>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {Object.entries(result.headers).map(([key, value]) => (
                                    <div key={key} className="flex flex-col md:flex-row md:items-start group hover:bg-slate-800/50 transition-colors">
                                        <div className="w-full md:w-1/3 px-6 py-3 text-blue-400 font-bold break-all md:border-r md:border-slate-800/50">
                                            {key}
                                        </div>
                                        <div className="w-full md:w-2/3 px-6 py-3 break-all text-slate-300">
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
