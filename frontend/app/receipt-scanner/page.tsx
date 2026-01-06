'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, ScanLine, Receipt, Download, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ScannedItem {
    description: string;
    amount: number;
    qty: number;
}

interface ScannedData {
    vendor: string | null;
    date: string | null;
    total: number | null;
    tax: number | null;
    items?: ScannedItem[];
    raw_text: string;
}

export default function ReceiptScannerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [data, setData] = useState<ScannedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setData(null);
            setError(null);
            scanReceipt(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const scanReceipt = async (receiptFile: File) => {
        setIsScanning(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', receiptFile);

        try {
            const response = await fetch(`${API_BASE_URL}/scan-receipt`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Scanning failed');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsScanning(false);
        }
    };

    const handleInputChange = (field: keyof ScannedData, value: string) => {
        if (!data) return;

        let parsedValue: string | number | null = value;
        if (field === 'total' || field === 'tax') {
            parsedValue = parseFloat(value) || 0;
        }

        setData({ ...data, [field]: parsedValue });
    };

    const downloadJSON = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_scan_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadPDF = () => {
        if (!data) return;
        import('jspdf').then(async (jsPDFModule) => {
            import('jspdf-autotable').then((autoTableModule) => {
                const jsPDF = jsPDFModule.default;
                const autoTable = autoTableModule.default;

                const doc = new jsPDF();

                // Header
                doc.setFontSize(20);
                doc.setTextColor(16, 185, 129); // Emerald 500
                doc.text("Receipt Scan Report", 14, 22);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

                // Details
                doc.setFontSize(12);
                doc.setTextColor(0);

                let y = 45;
                const details = [
                    { label: "Vendor", value: data.vendor || "Unknown" },
                    { label: "Date", value: data.date || "N/A" },
                    { label: "Tax", value: data.tax ? data.tax.toFixed(2) : "0.00" },
                    { label: "Total", value: data.total ? data.total.toFixed(2) : "0.00" }
                ];

                details.forEach(item => {
                    doc.setFont("helvetica", "bold");
                    doc.text(`${item.label}:`, 14, y);
                    doc.setFont("helvetica", "normal");
                    doc.text(`${item.value}`, 40, y);
                    y += 8;
                });

                // Items Table
                if (data.items && data.items.length > 0) {
                    y += 10;
                    doc.setFont("helvetica", "bold");
                    doc.text("Extracted Items", 14, y);

                    const tableData = data.items.map(item => [item.description, item.amount.toFixed(2)]);

                    autoTable(doc, {
                        startY: y + 5,
                        head: [['Description', 'Amount']],
                        body: tableData,
                        theme: 'striped',
                        headStyles: { fillColor: [16, 185, 129] },
                    });
                }

                // Raw Text (Optional, new page)
                doc.addPage();
                doc.setFont("helvetica", "bold");
                doc.text("Raw OCR Text", 14, 20);
                doc.setFont("courier", "normal");
                doc.setFontSize(9);

                const splitText = doc.splitTextToSize(data.raw_text, 180);
                doc.text(splitText, 14, 30);

                doc.save(`receipt_scan_${new Date().getTime()}.pdf`);
            });
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                        Smart Receipt Scanner
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Upload receipts to automatically extract Vendor, Date, and Totals.
                    </p>
                </div>

                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`max-w-2xl mx-auto mt-8 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                            }`}
                    >
                        <div className="space-y-2 text-center">
                            <input {...getInputProps()} />
                            <div className="flex justify-center">
                                <Receipt className={`h-16 w-16 ${isDragActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                            </div>
                            <div className="text-lg text-gray-600">
                                <span className="font-medium text-emerald-600 hover:text-emerald-500">
                                    Upload a receipt
                                </span>
                                {' '}or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Preview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Original Receipt
                                </h3>
                                <button
                                    onClick={() => { setFile(null); setData(null); }}
                                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="flex-1 bg-gray-100 relative overflow-auto flex items-center justify-center p-4">
                                {file.type === 'application/pdf' ? (
                                    <div className="text-center">
                                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">PDF Preview Not Available</p>
                                    </div>
                                ) : (
                                    <img
                                        src={previewUrl!}
                                        alt="Receipt"
                                        className="max-w-full max-h-full object-contain shadow-lg rounded"
                                    />
                                )}

                                {isScanning && (
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                        <ScanLine className="w-12 h-12 mb-4 animate-pulse text-emerald-400" />
                                        <p className="text-lg font-semibold animate-pulse">Scanning Receipt...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Extracted Data */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col h-[600px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Receipt className="w-6 h-6 text-emerald-600" />
                                    Extracted Details
                                </h2>
                                {!isScanning && data && (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                        Ready
                                    </span>
                                )}
                            </div>

                            {isScanning ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                    <p>Analyzing text and extracting values...</p>
                                </div>
                            ) : error ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-red-500 text-center p-4">
                                    <p className="mb-4 text-lg font-semibold">Scanning Failed</p>
                                    <p className="text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                                    <button
                                        onClick={() => scanReceipt(file)}
                                        className="mt-6 flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Try Again
                                    </button>
                                </div>
                            ) : data ? (
                                <div className="flex-1 flex flex-col overflow-y-auto pr-2">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Merchant</label>
                                            <input
                                                type="text"
                                                value={data.vendor || ''}
                                                onChange={(e) => handleInputChange('vendor', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-gray-900"
                                                placeholder="Unknown Vendor"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    value={data.date || ''}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                                                <input
                                                    type="number"
                                                    value={data.tax || ''}
                                                    onChange={(e) => handleInputChange('tax', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Line Items Section */}
                                        {data.items && data.items.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Extracted Items
                                                </h4>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                                    {data.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-200 last:border-0 hover:bg-white px-2 rounded transition-colors">
                                                            <span className="text-gray-700 font-medium truncate flex-1">{item.description}</span>
                                                            <span className="text-gray-900 font-bold ml-4">{item.amount.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                            <input
                                                type="number"
                                                value={data.total || ''}
                                                onChange={(e) => handleInputChange('total', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-emerald-500 ring-1 ring-emerald-500 focus:ring-2 focus:ring-emerald-600 transition-all text-xl font-bold text-emerald-700 bg-emerald-50/50"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        {/* Raw Text Toggle / Area */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <details className="text-sm">
                                                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium select-none">
                                                    Show Raw Extracted Text
                                                </summary>
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 whitespace-pre-wrap h-32 overflow-y-auto">
                                                    {data.raw_text}
                                                </div>
                                            </details>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 flex gap-3">
                                        <button
                                            onClick={downloadJSON}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            <Download className="w-5 h-5" />
                                            JSON
                                        </button>
                                        <button
                                            onClick={downloadPDF}
                                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            <FileText className="w-5 h-5" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                    <p>Upload a receipt to extract data</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                            <ScanLine className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Instant OCR</h3>
                        <p className="text-sm text-gray-600">Powerful optical character recognition instantly reads text from your receipts.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Smart Extraction</h3>
                        <p className="text-sm text-gray-600">Auto-detects vendors, dates, and total amounts so you don't have to type.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                            <Download className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">JSON Export</h3>
                        <p className="text-sm text-gray-600">Download extracted data as structured JSON for easy integration.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
