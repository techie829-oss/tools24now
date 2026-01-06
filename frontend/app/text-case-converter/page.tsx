'use client';

import React, { useState } from 'react';
import { Copy, Trash2, Type, FileText, Check } from 'lucide-react';

export default function TextCaseConverter() {
    const [text, setText] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    // Helpers
    const updateText = (newText: string) => {
        if (newText === text) return;
        setHistory(prev => [text, ...prev].slice(0, 10)); // Keep last 10
        setText(newText);
    };

    // Converters
    const toUpper = () => updateText(text.toUpperCase());
    const toLower = () => updateText(text.toLowerCase());

    const toTitleCase = () => {
        updateText(
            text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
        );
    };

    const toSentenceCase = () => {
        // Simple heuristic: Upper first char of text, and first char after (.!?)
        updateText(
            text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase())
        );
    };

    const toCamelCase = () => {
        updateText(
            text
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                    index === 0 ? word.toLowerCase() : word.toUpperCase()
                )
                .replace(/\s+/g, '')
                .replace(/[^a-zA-Z0-9]/g, '')
        );
    };

    const toPascalCase = () => {
        updateText(
            text
                .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
                .replace(/\s+/g, '')
                .replace(/[^a-zA-Z0-9]/g, '')
        );
    };

    const toSnakeCase = () => {
        updateText(
            text
                .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                ?.map(x => x.toLowerCase())
                .join('_') || text
        );
    };

    const toKebabCase = () => {
        updateText(
            text
                .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                ?.map(x => x.toLowerCase())
                .join('-') || text
        );
    };

    // Utilities
    const handleCopy = async () => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        if (confirm('Clear all text?')) setText('');
    };

    // Stats
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Text Case Converter
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Instantly format text for clean headers, code, or content.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Toolbar */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4 sticky top-0 z-10 flex flex-wrap gap-2 items-center justify-center sm:justify-start overflow-x-auto">
                        <ActionButton label="UPPERCASE" onClick={toUpper} />
                        <ActionButton label="lowercase" onClick={toLower} />
                        <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block"></div>
                        <ActionButton label="Title Case" onClick={toTitleCase} />
                        <ActionButton label="Sentence case" onClick={toSentenceCase} />
                        <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block"></div>
                        <ActionButton label="camelCase" onClick={toCamelCase} />
                        <ActionButton label="PascalCase" onClick={toPascalCase} />
                        <ActionButton label="snake_case" onClick={toSnakeCase} />
                        <ActionButton label="kebab-case" onClick={toKebabCase} />
                    </div>

                    {/* Editor */}
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type or paste your text here..."
                            className="w-full h-96 p-8 text-lg text-gray-800 bg-white border-none resize-none focus:ring-0 font-mono leading-relaxed"
                            autoFocus
                        />

                        {/* Floating Stats */}
                        <div className="absolute bottom-6 right-6 flex items-center gap-6 text-sm text-gray-400 font-medium bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <span>{words} Words</span>
                            <span>{chars} Characters</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-4">
                            <button
                                onClick={handleClear}
                                className="inline-flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Text
                            </button>
                            {/* History undo could go here */}
                        </div>

                        <button
                            onClick={handleCopy}
                            disabled={!text}
                            className={`inline-flex items-center px-8 py-3 rounded-xl font-bold transition-all shadow-md transform active:scale-95 ${copied
                                    ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                                    : 'bg-gray-900 text-white shadow-gray-300 hover:bg-black'
                                }`}
                        >
                            {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                            {copied ? 'Copied to Clipboard' : 'Copy Text'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Button Component
function ActionButton({ label, onClick }: { label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
            {label}
        </button>
    );
}
