'use client';

import React, { useState, useEffect } from 'react';
import { Network, MapPin, Globe, Server, Shield, Copy, Check, Info, Loader2 } from 'lucide-react';

interface IPData {
    ip: string;
    city: string;
    region: string;
    country_name: string;
    org: string; // ISP
    asn: string;
    postal: string;
    timezone: string;
    latitude: number;
    longitude: number;
    currency: string;
    country_calling_code: string;
}

export default function MyIPPage() {
    const [data, setData] = useState<IPData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchIPData();
    }, []);

    const fetchIPData = async () => {
        try {
            // Using ipapi.co for detailed info (approx 1000 free requests/day)
            // Fallback strategy can be implemented later if needed
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error('Failed to fetch IP data');
            }
            const jsonData = await response.json();
            setData(jsonData);
        } catch (err) {
            console.error(err);
            setError('Unable to fetch IP details. Ad-blockers might be interfering.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (data?.ip) {
            navigator.clipboard.writeText(data.ip);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-3">
                        <Network className="w-10 h-10 text-blue-600" />
                        My IP Address
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Detailed analysis of your public IP address and connection.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 animate-pulse">Scanning network...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                        <div className="text-red-500 font-bold text-xl mb-2">Network Error</div>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchIPData}
                            className="mt-6 px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : data ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Hero IP Card */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white text-center sm:text-left relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10 hidden sm:block">
                                    <Globe className="w-64 h-64 transform rotate-12" />
                                </div>

                                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <div className="text-blue-100 font-medium uppercase tracking-wider text-sm mb-2">Your IPv4 Address</div>
                                        <div className="text-5xl sm:text-6xl font-black tracking-tight font-mono">
                                            {data.ip}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-blue-100 bg-blue-800/30 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm font-medium">Secured Connection</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={copyToClipboard}
                                        className="bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all p-4 rounded-2xl flex flex-col items-center gap-2 min-w-[100px] border border-white/10 backdrop-blur-md group"
                                    >
                                        {copied ? <Check className="w-8 h-8 text-green-400" /> : <Copy className="w-8 h-8 text-white group-hover:text-blue-100" />}
                                        <span className="text-xs font-bold uppercase">{copied ? 'Copied' : 'Copy IP'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                                {/* Location */}
                                <div className="p-8 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Location</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-gray-800">{data.city}</div>
                                        <div className="text-gray-500">{data.region}, {data.country_name}</div>
                                        <div className="text-xs text-gray-400 mt-2 font-mono">{data.postal || 'N/A'}</div>
                                    </div>
                                </div>

                                {/* Network */}
                                <div className="p-8 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <Server className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">ISP / Network</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold text-gray-800 line-clamp-2">{data.org}</div>
                                        <div className="text-gray-500 font-mono text-sm">{data.asn}</div>
                                    </div>
                                </div>

                                {/* System Info */}
                                <div className="p-8 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Details</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex justify-between">
                                            <span>Timezone</span>
                                            <span className="font-medium text-gray-900">{data.timezone}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Currency</span>
                                            <span className="font-medium text-gray-900">{data.currency}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Calling Code</span>
                                            <span className="font-medium text-gray-900">{data.country_calling_code}</span>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        {/* Map Placeholder (could be replaced with Leaflet/Google Maps later) */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-1 overflow-hidden">
                            <div className="bg-gray-100 w-full h-64 md:h-80 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                <MapPin className="w-12 h-12 text-gray-400 mb-2 group-hover:-translate-y-2 transition-transform duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                                    <p className="text-gray-500 font-medium">Map visualization requires API Key</p>
                                </div>
                                <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-lg text-xs font-mono text-gray-600 shadow-sm border border-gray-200">
                                    Lat: {data.latitude}, Long: {data.longitude}
                                </div>
                            </div>
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    );
}
