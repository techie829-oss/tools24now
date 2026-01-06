'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Ruler, Zap, RefreshCw, FileText } from 'lucide-react';

export default function DeskewPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    const handleDeskew = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const response = await api.createDeskewPdfJob(file);
            setJobId(response.job_id);
            setUploading(false);

            setProcessing(true);
            await api.processDeskewPdf(response.job_id);

            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getDeskewJobStatus(response.job_id);

                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Deskewing failed');
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
                        <Ruler className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Deskew PDF
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Automatically straighten skewed or tilted scanned documents with precision.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Ruler className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Auto Detection</h3>
                            <p className="text-sm text-gray-600">Automatically detects skew angle</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Correction</h3>
                            <p className="text-sm text-gray-600">Straighten all pages in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <RefreshCw className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Quality Preserved</h3>
                            <p className="text-sm text-gray-600">No image quality loss</p>
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
                                        disabled={uploading}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">PDF files only • Max 50MB</p>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {file && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <button
                                    onClick={handleDeskew}
                                    disabled={uploading}
                                    className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-lg"
                                >
                                    {uploading ? 'Uploading...' : 'Straighten PDF'}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {processing && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Straightening Document...
                        </h2>
                        <div className="mt-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                            <p className="text-sm text-gray-600 mt-4">
                                Detecting skew angle and correcting alignment
                            </p>
                        </div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> Document Straightened!
                            </h2>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Deskew Another
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Pages Corrected</p>
                                <p className="text-3xl font-bold text-gray-900">{result.total_pages || 0}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Avg Angle Corrected</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {result.average_angle_corrected?.toFixed(2) || '0.00'}°
                                </p>
                            </div>
                        </div>

                        <a
                            href={api.getDeskewedPdfDownloadURL(jobId)}
                            download
                            className="inline-block w-full bg-blue-600 text-white text-center font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            Download Straightened PDF
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Deskew PDF</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload Your PDF</h3>
                            <p className="text-gray-600 text-sm">Select a skewed PDF document from your computer</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Auto Straighten</h3>
                            <p className="text-gray-600 text-sm">Our tool detects and corrects the skew angle automatically</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get your perfectly aligned PDF document</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
