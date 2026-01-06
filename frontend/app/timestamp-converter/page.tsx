'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Calendar, ArrowRight, Copy, Check } from 'lucide-react';

export default function TimestampConverter() {
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
    const [unixInput, setUnixInput] = useState<string>('');
    const [humanOutput, setHumanOutput] = useState<string>('');
    const [dateInput, setDateInput] = useState<string>('');
    const [unixOutput, setUnixOutput] = useState<string>('');
    const [copied, setCopied] = useState<string | null>(null);

    // Live update for current timestamp
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleUnixConvert = (val: string) => {
        setUnixInput(val);
        if (!val) {
            setHumanOutput('');
            return;
        }

        try {
            const ts = parseInt(val);
            // Detect if milliseconds (usually 13 digits) or seconds (10 digits)
            const date = new Date(val.length > 11 ? ts : ts * 1000);
            if (!isNaN(date.getTime())) {
                setHumanOutput(date.toLocaleString());
            } else {
                setHumanOutput('Invalid Timestamp');
            }
        } catch (e) {
            setHumanOutput('Invalid Timestamp');
        }
    };

    const handleDateConvert = (val: string) => {
        setDateInput(val);
        if (!val) {
            setUnixOutput('');
            return;
        }
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            setUnixOutput(Math.floor(date.getTime() / 1000).toString());
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        Timestamp Converter
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Convert Unix timestamps to human-readable dates and vice versa.
                    </p>
                </div>

                {/* Current Timestamp Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 p-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Unix Timestamp</h2>
                    <div className="text-5xl font-mono font-bold text-indigo-600 mb-4 tracking-wider">
                        {currentTimestamp}
                    </div>
                    <div className="text-gray-400 text-sm">
                        {new Date().toLocaleString()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Unix to Date */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Unix to Human</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unix Timestamp</label>
                                <input
                                    type="number"
                                    value={unixInput}
                                    onChange={(e) => handleUnixConvert(e.target.value)}
                                    placeholder="e.g. 1672531200"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                                />
                                <p className="text-xs text-gray-400 mt-1">Supports seconds (10 digits) and milliseconds (13 digits)</p>
                            </div>

                            <div className="flex justify-center">
                                <ArrowRight className="text-gray-300 w-6 h-6 rotate-90 md:rotate-0" />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative group">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Result</label>
                                <div className="text-lg font-medium text-gray-900 break-words min-h-[1.75rem]">
                                    {humanOutput || '—'}
                                </div>
                                {humanOutput && (
                                    <button
                                        onClick={() => copyToClipboard(humanOutput, 'human')}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-purple-600 bg-white shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        {copied === 'human' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date to Unix */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Human to Unix</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={dateInput}
                                    onChange={(e) => handleDateConvert(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="flex justify-center">
                                <ArrowRight className="text-gray-300 w-6 h-6 rotate-90 md:rotate-0" />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative group">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Unix Timestamp</label>
                                <div className="text-lg font-mono font-medium text-gray-900 break-all min-h-[1.75rem]">
                                    {unixOutput || '—'}
                                </div>
                                {unixOutput && (
                                    <button
                                        onClick={() => copyToClipboard(unixOutput, 'unix')}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 bg-white shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        {copied === 'unix' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
