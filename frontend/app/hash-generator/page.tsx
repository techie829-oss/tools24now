'use client';

import React, { useState, useRef } from 'react';
import { Copy, Upload, FileText, Check, Shield } from 'lucide-react';
import CryptoJS from 'crypto-js';

type Algorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

export default function HashGenerator() {
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [textInput, setTextInput] = useState('');
    const [fileName, setFileName] = useState('');
    const [hashes, setHashes] = useState<Record<Algorithm, string>>({
        MD5: '',
        SHA1: '',
        SHA256: '',
        SHA512: ''
    });
    const [copied, setCopied] = useState<Algorithm | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateTextHashes = () => {
        if (!textInput) {
            setHashes({ MD5: '', SHA1: '', SHA256: '', SHA512: '' });
            return;
        }

        setHashes({
            MD5: CryptoJS.MD5(textInput).toString(),
            SHA1: CryptoJS.SHA1(textInput).toString(),
            SHA256: CryptoJS.SHA256(textInput).toString(),
            SHA512: CryptoJS.SHA512(textInput).toString()
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);

            setHashes({
                MD5: CryptoJS.MD5(wordArray).toString(),
                SHA1: CryptoJS.SHA1(wordArray).toString(),
                SHA256: CryptoJS.SHA256(wordArray).toString(),
                SHA512: CryptoJS.SHA512(wordArray).toString()
            });
        };
        reader.readAsArrayBuffer(file);
    };

    const handleCopy = async (algorithm: Algorithm) => {
        await navigator.clipboard.writeText(hashes[algorithm]);
        setCopied(algorithm);
        setTimeout(() => setCopied(null), 2000);
    };

    React.useEffect(() => {
        if (mode === 'text') {
            generateTextHashes();
        }
    }, [textInput, mode]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                        Hash Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for text or files.
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white rounded-xl shadow-md p-1 border border-gray-200">
                        <button
                            onClick={() => { setMode('text'); setHashes({ MD5: '', SHA1: '', SHA256: '', SHA512: '' }); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'text'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Text
                        </button>
                        <button
                            onClick={() => { setMode('file'); setTextInput(''); setHashes({ MD5: '', SHA1: '', SHA256: '', SHA512: '' }); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'file'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Upload className="w-5 h-5" />
                            File
                        </button>
                    </div>
                </div>

                {/* Text Mode */}
                {mode === 'text' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Text</h3>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Type or paste text here..."
                            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm resize-none"
                        />
                    </div>
                )}

                {/* File Mode */}
                {mode === 'file' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                        >
                            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-700 font-semibold text-lg mb-1">Click to upload file</p>
                            <p className="text-gray-500 text-sm">Any file type supported</p>
                            {fileName && (
                                <p className="mt-4 text-emerald-600 font-medium">✓ {fileName}</p>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Hash Results */}
                <div className="space-y-4">
                    {(['MD5', 'SHA1', 'SHA256', 'SHA512'] as Algorithm[]).map((algo) => (
                        <div key={algo} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-bold text-gray-900">{algo}</h4>
                                </div>
                                <button
                                    onClick={() => handleCopy(algo)}
                                    disabled={!hashes[algo]}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${copied === algo
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } disabled:opacity-30`}
                                >
                                    {copied === algo ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied === algo ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="font-mono text-sm text-gray-700 break-all">
                                    {hashes[algo] || 'Hash will appear here...'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">🔒 About Hash Functions:</h4>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li><strong>MD5:</strong> 128-bit, fast but not cryptographically secure.</li>
                        <li><strong>SHA-1:</strong> 160-bit, deprecated for security applications.</li>
                        <li><strong>SHA-256:</strong> 256-bit, industry standard for security.</li>
                        <li><strong>SHA-512:</strong> 512-bit, highest security level.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
