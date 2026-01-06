'use client';

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Download, Layers } from 'lucide-react';

export default function UuidGenerator() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(10);
    const [hyphens, setHyphens] = useState(true);
    const [uppercase, setUppercase] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        generate();
    }, []);

    const generate = () => {
        const newUuids = [];
        for (let i = 0; i < count; i++) {
            let uuid = crypto.randomUUID();
            if (!hyphens) uuid = uuid.replace(/-/g, '');
            if (uppercase) uuid = uuid.toUpperCase();
            newUuids.push(uuid);
        }
        setUuids(newUuids);
        setCopied(false);
    };

    const handleCopy = async () => {
        if (uuids.length === 0) return;
        await navigator.clipboard.writeText(uuids.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (uuids.length === 0) return;
        const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uuids-${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                        UUID Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Generate version 4 UUIDs in bulk. Secure, unique, and client-side.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-4">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-1 bg-gray-50 p-6 border-r border-gray-200 space-y-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={count}
                                    onChange={(e) => setCount(Number(e.target.value))}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-900">Format</label>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hyphens}
                                    onChange={(e) => setHyphens(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-gray-700">Hyphens</span>
                            </label>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={uppercase}
                                    onChange={(e) => setUppercase(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-gray-700">Uppercase</span>
                            </label>
                        </div>

                        <button
                            onClick={generate}
                            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-200"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Regenerate
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="lg:col-span-3 p-0 flex flex-col h-[600px]">
                        <div className="flex-1 p-6 overflow-y-auto bg-white">
                            <pre className="font-mono text-gray-700 whitespace-pre-wrap leading-loose text-lg">
                                {uuids.join('\n')}
                            </pre>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-gray-500 font-medium">{uuids.length} UUIDs generated</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 shadow-sm rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download .txt
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center px-6 py-2 rounded-lg font-semibold transition-all ${copied
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-900 text-white hover:bg-black'
                                        }`}
                                >
                                    {copied ? 'Copied' : 'Copy All'}
                                    <Copy className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
