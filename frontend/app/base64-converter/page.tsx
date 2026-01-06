'use client';

import React, { useState, useRef } from 'react';
import { Copy, Download, Upload, RefreshCw, FileText, Image as ImageIcon, Check } from 'lucide-react';

type Mode = 'text' | 'image';

export default function Base64Converter() {
    const [mode, setMode] = useState<Mode>('text');
    const [textInput, setTextInput] = useState('');
    const [base64Output, setBase64Output] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Text Encoding
    const encodeText = () => {
        try {
            const encoded = btoa(textInput);
            setBase64Output(encoded);
        } catch (error) {
            alert('Error encoding text. Make sure it contains only valid characters.');
        }
    };

    const decodeText = () => {
        try {
            const decoded = atob(base64Output);
            setTextInput(decoded);
        } catch (error) {
            alert('Invalid Base64 string.');
        }
    };

    // Image Encoding
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setImagePreview(result);
            setBase64Output(result);
        };
        reader.readAsDataURL(file);
    };

    const decodeImage = () => {
        if (!base64Output.startsWith('data:image')) {
            alert('Please enter a valid Base64 image string (must start with data:image)');
            return;
        }
        setImagePreview(base64Output);
    };

    // Utilities
    const handleCopy = async () => {
        await navigator.clipboard.writeText(base64Output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (mode === 'text') {
            const blob = new Blob([base64Output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'base64.txt';
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // Download image from base64
            const link = document.createElement('a');
            link.href = base64Output;
            link.download = 'image.png';
            link.click();
        }
    };

    const clearAll = () => {
        setTextInput('');
        setBase64Output('');
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                        Base64 Converter
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Encode and decode text or images to/from Base64 format.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white rounded-xl shadow-md p-1 border border-gray-200">
                        <button
                            onClick={() => { setMode('text'); clearAll(); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'text'
                                    ? 'bg-cyan-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Text Mode
                        </button>
                        <button
                            onClick={() => { setMode('image'); clearAll(); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'image'
                                    ? 'bg-cyan-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <ImageIcon className="w-5 h-5" />
                            Image Mode
                        </button>
                    </div>
                </div>

                {/* Text Mode */}
                {mode === 'text' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Input */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plain Text</h3>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Enter text to encode..."
                                className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={encodeText}
                                    className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors shadow-md"
                                >
                                    Encode →
                                </button>
                                <button
                                    onClick={decodeText}
                                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md"
                                >
                                    ← Decode
                                </button>
                            </div>
                        </div>

                        {/* Output */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Base64</h3>
                            <textarea
                                value={base64Output}
                                onChange={(e) => setBase64Output(e.target.value)}
                                placeholder="Base64 output will appear here..."
                                className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm resize-none bg-gray-50"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleCopy}
                                    disabled={!base64Output}
                                    className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-semibold transition-colors ${copied
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-cyan-500'
                                        }`}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!base64Output}
                                    className="flex items-center justify-center gap-2 flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Download className="w-5 h-5" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Mode */}
                {mode === 'image' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Upload & Preview */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Upload</h3>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all mb-4"
                            >
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium">Click to upload image</p>
                                <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {imagePreview && (
                                <div className="mt-6">
                                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full rounded-lg border border-gray-200 max-h-96 object-contain"
                                    />
                                </div>
                            )}

                            <button
                                onClick={decodeImage}
                                className="w-full mt-4 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md"
                            >
                                ← Decode from Base64
                            </button>
                        </div>

                        {/* Base64 Output */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Base64 String</h3>
                            <textarea
                                value={base64Output}
                                onChange={(e) => setBase64Output(e.target.value)}
                                placeholder="Base64 image data will appear here..."
                                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-xs resize-none bg-gray-50"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleCopy}
                                    disabled={!base64Output}
                                    className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-semibold transition-colors ${copied
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-cyan-500'
                                        }`}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="flex items-center justify-center gap-2 px-6 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
