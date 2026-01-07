'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, Copy, Check } from 'lucide-react';
import Barcode from 'react-barcode';

type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39';

interface BarcodeData {
    id: string;
    value: string;
    label: string;
}

export default function BarcodeGenerator() {
    const [format, setFormat] = useState<BarcodeFormat>('CODE128');
    const [singleValue, setSingleValue] = useState('123456789012');
    const [singleLabel, setSingleLabel] = useState('Product Label');
    const [batchData, setBatchData] = useState<BarcodeData[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());

            const data: BarcodeData[] = lines.slice(1).map((line, idx) => {
                const [value, label] = line.split(',').map(s => s.trim());
                return {
                    id: `${idx}-${Date.now()}`,
                    value: value || '',
                    label: label || `Item ${idx + 1}`
                };
            }).filter(item => item.value);

            setBatchData(data);
        };
        reader.readAsText(file);
    };

    const downloadSingle = () => {
        const svg = document.querySelector('#single-barcode svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `barcode_${singleValue}.png`;
                link.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const downloadAll = () => {
        batchData.forEach((item, idx) => {
            setTimeout(() => {
                const svg = document.querySelector(`#barcode-${item.id} svg`);
                if (!svg) return;

                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (!blob) return;
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `barcode_${item.value}.png`;
                        link.click();
                        URL.revokeObjectURL(url);
                    });
                };

                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            }, idx * 100);
        });
    };

    const downloadCSVTemplate = () => {
        const csv = `value,label\n123456789012,Sample Product 1\n987654321098,Sample Product 2`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'barcode_template.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(value);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                        Barcode Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Generate barcodes in multiple formats with batch processing support.
                    </p>
                </div>

                {/* Format Selector */}
                <div className="flex justify-center gap-3 mb-8">
                    {(['CODE128', 'EAN13', 'UPC', 'CODE39'] as BarcodeFormat[]).map((fmt) => (
                        <button
                            key={fmt}
                            onClick={() => setFormat(fmt)}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${format === fmt
                                ? 'bg-cyan-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-cyan-300'
                                }`}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Single Barcode */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Single Barcode</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Value</label>
                                <input
                                    type="text"
                                    value={singleValue}
                                    onChange={(e) => setSingleValue(e.target.value)}
                                    placeholder="Enter barcode value"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Label (Optional)</label>
                                <input
                                    type="text"
                                    value={singleLabel}
                                    onChange={(e) => setSingleLabel(e.target.value)}
                                    placeholder="Product label"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-900"
                                />
                            </div>

                            <div id="single-barcode" className="bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center border-2 border-gray-200">
                                {singleValue && (
                                    <div className="text-center">
                                        <Barcode
                                            value={singleValue}
                                            format={format}
                                            width={2}
                                            height={80}
                                            displayValue={true}
                                            background="#f9fafb"
                                        />
                                        <p className="mt-3 text-sm font-medium text-gray-700">{singleLabel}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCopy(singleValue)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${copied === singleValue
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {copied === singleValue ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied === singleValue ? 'Copied!' : 'Copy Value'}
                                </button>
                                <button
                                    onClick={downloadSingle}
                                    className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors shadow-md"
                                >
                                    <Download className="w-5 h-5" />
                                    Download PNG
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Batch Generation */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Generation</h3>

                        <div className="space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all"
                            >
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-700 font-medium">Upload CSV File</p>
                                <p className="text-sm text-gray-500 mt-1">Format: value,label</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="hidden"
                            />

                            <button
                                onClick={downloadCSVTemplate}
                                className="w-full py-2 text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
                            >
                                Download CSV Template
                            </button>

                            {batchData.length > 0 && (
                                <>
                                    <div className="max-h-80 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        {batchData.map((item) => (
                                            <div key={item.id} id={`barcode-${item.id}`} className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="flex flex-col items-center">
                                                    <Barcode
                                                        value={item.value}
                                                        format={format}
                                                        width={1.5}
                                                        height={60}
                                                        displayValue={true}
                                                        background="#ffffff"
                                                    />
                                                    <p className="mt-2 text-sm font-medium text-gray-700">{item.label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setBatchData([])}
                                            className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={downloadAll}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download All ({batchData.length})
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">📊 Barcode Formats:</h4>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li><strong>CODE128:</strong> Most versatile, supports alphanumeric (A-Z, 0-9).</li>
                        <li><strong>EAN13:</strong> European standard for retail products (13 digits).</li>
                        <li><strong>UPC:</strong> US standard for retail products (12 digits).</li>
                        <li><strong>CODE39:</strong> Common in logistics, supports A-Z, 0-9, and some symbols.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
