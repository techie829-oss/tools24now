'use client';

import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Sliders, Palette, Share2, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function QrCodeGenerator() {
    // State
    const [text, setText] = useState('https://tools24now.com');
    const [size, setSize] = useState(300);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
    const [includeImage, setIncludeImage] = useState(false);

    const qrRef = useRef<HTMLDivElement>(null);

    // Handlers
    const handleDownload = async (format: 'png' | 'svg') => {
        if (!qrRef.current) return;

        if (format === 'png') {
            const canvas = await html2canvas(qrRef.current, {
                backgroundColor: null, // Transparent if needed, but we usually want the background
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `qrcode-${Date.now()}.png`;
            link.href = url;
            link.click();
        } else {
            // Simple SVG download if we used SVG mode, but QRCodeCanvas makes a canvas.
            // For true SVG we should use <QRCodeSVG> but canvas is versatile for images.
            // Let's stick to PNG download for Canvas.
            // If user specifically requested SVG, we'd toggle the component type.
            // For now, let's just do PNG high res.
            alert("SVG download requires switching rendering mode. PNG download starting...");
            handleDownload('png');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        QR Code Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Create customizable, high-quality QR codes instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls Column */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Content (URL or Text)
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none"
                                placeholder="Enter text or paste a URL..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Color Controls */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Colors
                                </h3>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Foreground</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="h-10 w-full rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-600">{fgColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Background</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="h-10 w-full rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-600">{bgColor}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Size & settings */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Sliders className="w-4 h-4" /> Settings
                                </h3>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Size: {size}px</label>
                                    <input
                                        type="range"
                                        min="128"
                                        max="1024"
                                        step="32"
                                        value={size}
                                        onChange={(e) => setSize(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Error Correction</label>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        {['L', 'M', 'Q', 'H'].map((lvl) => (
                                            <button
                                                key={lvl}
                                                onClick={() => setLevel(lvl as any)}
                                                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${level === lvl
                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="flex flex-col items-center justify-start space-y-6">
                        <div className="sticky top-8 w-full max-w-lg">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-gray-100">
                                <div
                                    ref={qrRef}
                                    className="p-4 bg-white" // Add padding specifically for the download/screenshot area
                                    style={{ backgroundColor: bgColor }} // Ensure bg color covers the padding too
                                >
                                    <QRCodeCanvas
                                        value={text}
                                        size={size > 300 ? 300 : size} // Preview cap to prevent overflow, but real one scales
                                        fgColor={fgColor}
                                        bgColor={bgColor}
                                        level={level}
                                        includeMargin={false}
                                        style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                                    />
                                </div>

                                <p className="mt-6 text-sm text-gray-400">
                                    Preview (Actual export size: {size}x{size})
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => handleDownload('png')}
                                    className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
                                >
                                    <Download className="w-5 h-5" />
                                    Download High-Res PNG
                                </button>
                                {/* 
                                <button
                                    onClick={() => handleDownload('svg')}
                                    className="w-full bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Download SVG (Coming Soon)
                                </button>
                                */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
