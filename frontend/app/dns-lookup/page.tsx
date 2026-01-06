'use client';

import React, { useState } from 'react';
import { Search, Globe, Server, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { ApiService } from '@/lib/api';

const RECORD_TYPES = [
    { value: 'ALL', label: 'ALL (Fetch All Records)' },
    { value: 'A', label: 'A (IPv4 Address)' },
    { value: 'AAAA', label: 'AAAA (IPv6 Address)' },
    { value: 'MX', label: 'MX (Mail Exchange)' },
    { value: 'NS', label: 'NS (Name Server)' },
    { value: 'TXT', label: 'TXT (Text Record)' },
    { value: 'CNAME', label: 'CNAME (Alias)' },
    { value: 'SOA', label: 'SOA (Start of Authority)' },
];

export default function DNSLookupPage() {
    const [domain, setDomain] = useState('');
    const [recordType, setRecordType] = useState('A');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);
        setHasSearched(true);

        try {
            const data = await ApiService.dnsLookup(domain.trim(), recordType);
            setResults(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch DNS records');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center gap-3">
                        <Globe className="w-10 h-10 text-teal-600" />
                        DNS Lookup
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Instantly check DNS records for any domain name.
                    </p>
                </div>

                {/* Search Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <form onSubmit={handleLookup} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Domain Name</label>
                            <input
                                type="text"
                                placeholder="example.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all text-lg font-medium"
                                required
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Record Type</label>
                            <div className="relative">
                                <select
                                    value={recordType}
                                    onChange={(e) => setRecordType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 appearance-none text-lg font-medium cursor-pointer"
                                >
                                    {RECORD_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <Server className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[52px]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                {loading ? 'Querying...' : 'Lookup'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-bold text-lg mb-1">Lookup Failed</h3>
                                <p className="text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && hasSearched && results.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">No Records Found</h3>
                            <p className="text-gray-500">No {recordType} records were found for <span className="font-mono font-medium">{domain}</span>.</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Results for {domain}
                                </h3>
                                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                                    {results.length} Record{results.length !== 1 ? 's' : ''} Found
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {results.map((record, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1 font-mono text-sm sm:text-base break-all text-gray-800">
                                            {recordType === 'MX' && record.preference !== undefined && (
                                                <span className="inline-block mr-3 bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-bold text-xs" title="Priority">
                                                    {record.preference}
                                                </span>
                                            )}
                                            {record.value}
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5" title="Time to Live">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>TTL: {record.ttl}s</span>
                                            </div>
                                            <div className="font-bold text-gray-300 w-8 text-center">{record.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                {!hasSearched && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-4">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Real-time Check</h3>
                            <p className="text-gray-500 text-sm">Queries are performed directly against authoritative servers for live data.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <Server className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Multiple Types</h3>
                            <p className="text-gray-500 text-sm">Support for A, AAAA, MX, NS, TXT, and CNAME records.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">MX Priorities</h3>
                            <p className="text-gray-500 text-sm">Automatically parses and displays mail server priority levels.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
