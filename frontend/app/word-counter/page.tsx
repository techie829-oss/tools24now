'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Clock, Mic, FileText, AlignLeft } from 'lucide-react';

export default function WordCounter() {
    const [text, setText] = useState('');
    const [stats, setStats] = useState({
        words: 0,
        chars: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0
    });

    useEffect(() => {
        const trimmed = text.trim();
        if (!trimmed) {
            setStats({
                words: 0,
                chars: 0,
                charsNoSpaces: 0,
                sentences: 0,
                paragraphs: 0,
                readingTime: 0,
                speakingTime: 0
            });
            return;
        }

        // Stats Logic
        const words = trimmed.split(/\s+/).length;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(Boolean).length;
        const paragraphs = text.split(/\n+/).filter(Boolean).length;

        // Time estimates (minutes)
        const readingTime = Math.ceil(words / 200); // Avg reading speed 200 wpm
        const speakingTime = Math.ceil(words / 130); // Avg speaking speed 130 wpm

        setStats({
            words,
            chars,
            charsNoSpaces,
            sentences,
            paragraphs,
            readingTime,
            speakingTime
        });
    }, [text]);

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        Word Counter
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Analyze your text with real-time statistics and insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Column */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[600px]">
                        <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Editor</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setText('')}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Clear Text"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Copy Text"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Start typing or paste your text here to see stats..."
                            className="flex-1 w-full p-8 text-lg text-gray-800 bg-white border-none resize-none focus:ring-0 leading-relaxed overflow-y-auto"
                            autoFocus
                        />
                    </div>

                    {/* Stats Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Primary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <span className="block text-4xl font-bold text-blue-600 mb-1">{stats.words}</span>
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Words</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <span className="block text-4xl font-bold text-purple-600 mb-1">{stats.chars}</span>
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Characters</span>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <AlignLeft className="w-5 h-5 text-gray-500" /> Details
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <StatRow label="Sentences" value={stats.sentences} />
                                <StatRow label="Paragraphs" value={stats.paragraphs} />
                                <StatRow label="Chars (no spaces)" value={stats.charsNoSpaces} />
                            </div>
                        </div>

                        {/* Time Estimates */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-500" /> Reading Time
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <FileText className="w-5 h-5" />
                                        <span>Silent Reading</span>
                                    </div>
                                    <span className="font-bold text-gray-900">~ {stats.readingTime} min</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mic className="w-5 h-5" />
                                        <span>Speaking</span>
                                    </div>
                                    <span className="font-bold text-gray-900">~ {stats.speakingTime} min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2 last:pb-0">
            <span className="text-gray-600">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
        </div>
    );
}
