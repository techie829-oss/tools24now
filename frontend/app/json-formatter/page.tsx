'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Download, AlertCircle, CheckCircle, Code, Minimize, FileJson } from 'lucide-react';

type FormatMode = 'beautify' | 'minify' | 'escape';

export default function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<FormatMode>('beautify');
    const [copied, setCopied] = useState(false);

    // Auto-process on input change
    useEffect(() => {
        processJson();
    }, [input, mode]);

    const processJson = () => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setError(null);

            switch (mode) {
                case 'beautify':
                    setOutput(JSON.stringify(parsed, null, 2));
                    break;
                case 'minify':
                    setOutput(JSON.stringify(parsed));
                    break;
                case 'escape':
                    setOutput(JSON.stringify(JSON.stringify(parsed)));
                    break;
            }
        } catch (e: any) {
            setError(e.message);
            setOutput('');
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `formatted-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const loadSample = () => {
        setInput(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "hobbies": ["reading", "coding", "gaming"]
}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                        JSON Formatter & Validator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Validate, beautify, and minify JSON with real-time error detection.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white rounded-xl shadow-md p-1 border border-gray-200">
                        <button
                            onClick={() => setMode('beautify')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${mode === 'beautify'
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Code className="w-4 h-4" />
                            Beautify
                        </button>
                        <button
                            onClick={() => setMode('minify')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${mode === 'minify'
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Minimize className="w-4 h-4" />
                            Minify
                        </button>
                        <button
                            onClick={() => setMode('escape')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${mode === 'escape'
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FileJson className="w-4 h-4" />
                            Escape
                        </button>
                        <button
                            onClick={loadSample}
                            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm text-blue-600 hover:bg-blue-50"
                        >
                            Load Sample
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Input JSON</h3>
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Invalid JSON
                                </div>
                            )}
                            {!error && input && output && (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Valid
                                </div>
                            )}
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm resize-none min-h-96"
                        />
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm font-mono">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Output */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {mode === 'beautify' && 'Formatted'}
                                {mode === 'minify' && 'Minified'}
                                {mode === 'escape' && 'Escaped'}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    disabled={!output}
                                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-30"
                                    title="Copy"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!output}
                                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-30"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Formatted output will appear here..."
                            className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 min-h-96"
                        />
                        {copied && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                                <p className="text-green-700 text-sm font-medium">✓ Copied to clipboard!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">💡 Quick Tips:</h4>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li><strong>Beautify:</strong> Formats with proper indentation (2 spaces).</li>
                        <li><strong>Minify:</strong> Removes all whitespace for compact output.</li>
                        <li><strong>Escape:</strong> Double-encodes for embedding JSON in strings.</li>
                        <li><strong>Validation:</strong> Errors show on the left when JSON is invalid.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
