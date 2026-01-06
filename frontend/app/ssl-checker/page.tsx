'use client';

import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle, CheckCircle, XCircle, Search, Calendar, Globe, Server, Hash, FileText } from 'lucide-react';
import { ApiService } from '@/lib/api';

interface SSLInfo {
    valid: boolean;
    domain: string;
    issuer: string;
    subject: string;
    valid_from: string;
    valid_to: string;
    days_remaining: number;
    version: number;
    serial_number: string;
    error?: string;
}

export default function SSLCheckerPage() {
    const [domain, setDomain] = useState('');
    const [port, setPort] = useState(443);
    const [result, setResult] = useState<SSLInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await ApiService.sslCheck(domain.trim(), port);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to check SSL certificate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center gap-3">
                        <Lock className="w-10 h-10 text-emerald-600" />
                        SSL Certificate Checker
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Verify SSL/TLS certificate validity, expiry, and chain details instantly.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Hostname</label>
                            <input
                                type="text"
                                placeholder="example.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all text-lg font-medium"
                                required
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Port</label>
                            <input
                                type="number"
                                placeholder="443"
                                value={port}
                                onChange={(e) => setPort(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all text-lg font-medium"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[52px]"
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Shield className="w-5 h-5" />}
                                {loading ? 'Checking...' : 'Check SSL'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 mb-8">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-red-800 font-bold text-lg mb-1">Check Failed</h3>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Card */}
                        <div className={`rounded-2xl p-8 shadow-lg border flex flex-col items-center justify-center text-center ${result.valid ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            {result.valid ? (
                                <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                    <CheckCircle className="w-16 h-16 text-emerald-600" />
                                </div>
                            ) : (
                                <div className="bg-red-100 p-4 rounded-full mb-4">
                                    <XCircle className="w-16 h-16 text-red-600" />
                                </div>
                            )}

                            <h2 className={`text-3xl font-bold mb-2 ${result.valid ? 'text-emerald-800' : 'text-red-800'}`}>
                                {result.valid ? 'Certificate is Valid' : 'Certificate is Invalid or Expired'}
                            </h2>

                            {result.valid ? (
                                <p className="text-emerald-700 font-medium text-lg">
                                    Secure connection established with <span className="font-bold">{result.domain}</span>
                                </p>
                            ) : (
                                <p className="text-red-700 font-medium text-lg">
                                    {result.error || 'This certificate is not trusted.'}
                                </p>
                            )}

                            {result.valid && (
                                <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-200 text-emerald-700 font-bold">
                                    <Calendar className="w-5 h-5" />
                                    {result.days_remaining} Days Remaining
                                </div>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Issued To */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-gray-500 uppercase tracking-wide text-xs font-bold mb-4 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Issued To
                                </h3>
                                <p className="text-xl font-bold text-gray-900 break-all">{result.subject}</p>
                                <p className="text-gray-400 text-sm mt-1">{result.domain}</p>
                            </div>

                            {/* Issued By */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-gray-500 uppercase tracking-wide text-xs font-bold mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Issued By
                                </h3>
                                <p className="text-xl font-bold text-gray-900 break-words">{result.issuer}</p>
                            </div>

                            {/* Validity Period */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-gray-500 uppercase tracking-wide text-xs font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Validity Period
                                </h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 text-sm">Valid From:</span>
                                    <span className="font-mono font-medium text-gray-900">{result.valid_from}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Valid To:</span>
                                    <span className="font-mono font-medium text-gray-900">{result.valid_to}</span>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-gray-500 uppercase tracking-wide text-xs font-bold mb-4 flex items-center gap-2">
                                    <Server className="w-4 h-4" /> Technical Details
                                </h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 text-sm">Version:</span>
                                    <span className="font-mono font-medium text-gray-900">v{result.version}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500 text-sm">Serial Number:</span>
                                    <span className="font-mono text-xs text-gray-600 break-all bg-gray-50 p-2 rounded border border-gray-100">
                                        {result.serial_number}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
