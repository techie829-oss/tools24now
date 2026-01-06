'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Minimize2, Zap, HardDrive, FileText, Download } from 'lucide-react';

type CompressionMode = 'quality' | 'percent' | 'maxsize';

const QUALITY_OPTIONS = [
    { value: 'low', label: 'Low Quality', description: 'Smallest file size (best for sharing)' },
    { value: 'medium', label: 'Medium Quality', description: 'Balanced size and quality (recommended)' },
    { value: 'high', label: 'High Quality', description: 'Best quality (for printing)' },
];

export default function CompressPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<CompressionMode>('quality');
    const [quality, setQuality] = useState('medium');
    const [compressPercent, setCompressPercent] = useState(50);
    const [maxSizeMb, setMaxSizeMb] = useState(5);
    const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('MB');
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleCompress = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const response = await api.createCompressPdfJob(file, quality);
            setJobId(response.job_id);
            setUploading(false);

            setProcessing(true);

            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getCompressJobStatus(response.job_id);

                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Compression failed');
                        setProcessing(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to check status');
                    setProcessing(false);
                }
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setJobId(null);
        setResult(null);
        setError(null);
        setUploading(false);
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
                        <Minimize2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Compress PDF
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Reduce file size while maintaining quality. Perfect for email attachments and faster uploads.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <HardDrive className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Reduce Size</h3>
                            <p className="text-sm text-gray-600">Compress up to 90%</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Quality Options</h3>
                            <p className="text-sm text-gray-600">Choose compression level</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Preserve Quality</h3>
                            <p className="text-sm text-gray-600">Maintain readability</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!jobId && !processing && !result && (
                    <>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`bg-white rounded-xl border-2 border-dashed p-16 text-center transition-all mb-8 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                        >
                            <div className="space-y-6">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                                <div>
                                    <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-semibold hover:text-blue-700 text-lg">
                                        Click to upload
                                    </label>
                                    <span className="text-gray-600 text-lg"> or drag and drop</span>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">PDF files only • Max 50MB</p>
                            </div>
                        </div>

                        {file && (
                            <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">Compression Level</label>
                                    <div className="space-y-2">
                                        {QUALITY_OPTIONS.map((opt) => (
                                            <label key={opt.value} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${quality === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                                <input type="radio" name="quality" value={opt.value} checked={quality === opt.value} onChange={(e) => setQuality(e.target.value)} className="sr-only" />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">{opt.label}</div>
                                                    <div className="text-sm text-gray-600">{opt.description}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCompress}
                                    disabled={uploading}
                                    className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-lg"
                                >
                                    {uploading ? 'Uploading...' : 'Compress PDF'}
                                </button>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {processing && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compressing PDF...</h2>
                        <div className="mt-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                            <p className="text-sm text-gray-600 mt-4">
                                Optimizing images and reducing file size
                            </p>
                        </div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> PDF Compressed!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Compress Another
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Original Size</p>
                                <p className="text-2xl font-bold text-gray-900">{formatFileSize(result.original_size || 0)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Compressed Size</p>
                                <p className="text-2xl font-bold text-green-600">{formatFileSize(result.compressed_size || 0)}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                            <p className="text-sm text-gray-600">Size Reduction</p>
                            <p className="text-3xl font-bold text-blue-600">{result.compression_ratio || 0}%</p>
                        </div>

                        <a
                            href={api.getCompressedPdfDownloadURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Compressed PDF
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Compress PDF</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload PDF</h3>
                            <p className="text-gray-600 text-sm">Select the PDF file you want to compress</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Choose Quality</h3>
                            <p className="text-gray-600 text-sm">Select compression level based on your needs</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get your compressed PDF with reduced file size</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
