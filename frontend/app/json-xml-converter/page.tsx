'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, FileCode, Copy, Download, Trash2, Check, AlertCircle } from 'lucide-react';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

type ConversionMode = 'json-to-xml' | 'xml-to-json';

export default function JsonXmlConverterPage() {
    const [mode, setMode] = useState<ConversionMode>('json-to-xml');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleConvert = () => {
        setError(null);
        if (!input.trim()) {
            setOutput('');
            return;
        }

        try {
            if (mode === 'json-to-xml') {
                // JSON to XML
                const jsonObj = JSON.parse(input);
                const builder = new XMLBuilder({
                    format: true,
                    ignoreAttributes: false,
                    suppressEmptyNode: true,
                });
                const xmlContent = builder.build(jsonObj);
                setOutput(xmlContent);
            } else {
                // XML to JSON
                const parser = new XMLParser({
                    ignoreAttributes: false,
                    allowBooleanAttributes: true,
                });
                const jsonContent = parser.parse(input);
                setOutput(JSON.stringify(jsonContent, null, 2));
            }
        } catch (err) {
            setError(`Invalid ${mode === 'json-to-xml' ? 'JSON' : 'XML'} format. Please check your syntax.`);
        }
    };

    // Auto-convert on input change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            handleConvert();
        }, 500);
        return () => clearTimeout(timer);
    }, [input, mode]);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const extension = mode === 'json-to-xml' ? 'xml' : 'json';
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleMode = () => {
        setMode(mode === 'json-to-xml' ? 'xml-to-json' : 'json-to-xml');
        setInput(output); // Swap input/output if valid
        setOutput('');
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">JSON &lt;-&gt; XML Converter</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Convert data between JSON and XML formats instantly. Validates syntax and beautifies output.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm inline-flex items-center">
                        <button
                            onClick={() => setMode('json-to-xml')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'json-to-xml'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            JSON to XML
                        </button>
                        <button
                            onClick={toggleMode}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors mx-1"
                            title="Swap Direction"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setMode('xml-to-json')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'xml-to-json'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            XML to JSON
                        </button>
                    </div>
                </div>

                {/* Editors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                    {/* Input Pane */}
                    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm uppercase tracking-wide">
                                {mode === 'json-to-xml' ? 'JSON Input' : 'XML Input'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setInput('')} className="text-gray-400 hover:text-red-500 transition-colors" title="Clear">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                placeholder={`Paste your ${mode === 'json-to-xml' ? 'JSON' : 'XML'} here...`}
                            />
                        </div>
                    </div>

                    {/* Output Pane */}
                    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm uppercase tracking-wide">
                                {mode === 'json-to-xml' ? 'XML Output' : 'JSON Output'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={handleCopy} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Copy">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button onClick={handleDownload} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Download">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative bg-gray-50">
                            {error ? (
                                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center text-red-500">
                                    <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <textarea
                                    readOnly
                                    value={output}
                                    className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none bg-gray-50 text-gray-600 focus:outline-none"
                                    placeholder="Translation will appear here..."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
