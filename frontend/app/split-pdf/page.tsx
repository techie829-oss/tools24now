'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Scissors, Zap, Grid3X3, FileText, Download, Check } from 'lucide-react';

export default function SplitPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleUpload(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            handleUpload(droppedFile);
        }
    };

    const handleUpload = async (selectedFile: File) => {
        setFile(selectedFile);
        setUploading(true);
        setError(null);

        try {
            const response = await api.createSplitPdfJob(selectedFile) as any;
            setJobId(response.job_id);
            setTotalPages(response.total_pages);
            setUploading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

    const togglePage = (pageNum: number) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(pageNum)) {
            newSelected.delete(pageNum);
        } else {
            newSelected.add(pageNum);
        }
        setSelectedPages(newSelected);
    };

    const selectAll = () => {
        const all = new Set<number>();
        for (let i = 0; i < totalPages; i++) {
            all.add(i);
        }
        setSelectedPages(all);
    };

    const clearSelection = () => {
        setSelectedPages(new Set());
    };

    const handleSplit = async () => {
        if (!jobId || selectedPages.size === 0) {
            setError('Please select at least one page');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const pagesArray = Array.from(selectedPages).sort((a, b) => a - b);
            await api.processSplitPdf(jobId, pagesArray);

            // Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getSplitJobStatus(jobId);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Split failed');
                        setProcessing(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to check status');
                    setProcessing(false);
                }
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Processing failed');
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setJobId(null);
        setTotalPages(0);
        setSelectedPages(new Set());
        setResult(null);
        setError(null);
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
                        <Scissors className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Split PDF
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Extract specific pages from your PDF. Select pages visually and create a new PDF with just what you need.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Grid3X3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Visual Selection</h3>
                            <p className="text-sm text-gray-600">Click thumbnails to select pages</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Extraction</h3>
                            <p className="text-sm text-gray-600">Extract pages in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Quality Preserved</h3>
                            <p className="text-sm text-gray-600">Original quality maintained</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!jobId && !processing && !result && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`bg-white rounded-xl border-2 border-dashed p-16 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                    >
                        <div className="space-y-6">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                            <div>
                                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-semibold hover:text-blue-700 text-lg">
                                    Click to upload
                                </label>
                                <span className="text-gray-600 text-lg"> or drag and drop</span>
                                <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
                            </div>
                            <p className="text-sm text-gray-500">PDF files only • Max 50MB</p>
                            {uploading && <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>}
                        </div>
                    </div>
                )}

                {jobId && totalPages > 0 && !processing && !result && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Select Pages ({selectedPages.size} of {totalPages} selected)
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                                    Select All
                                </button>
                                <button onClick={clearSelection} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Page Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <div
                                    key={i}
                                    onClick={() => togglePage(i)}
                                    className={`relative cursor-pointer rounded-lg border-2 transition-all ${selectedPages.has(i)
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                >
                                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={api.getPageThumbnailURL(jobId, i)}
                                            alt={`Page ${i + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute top-2 left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                        {selectedPages.has(i) ? (
                                            <Check className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <span className="text-xs text-gray-600">{i + 1}</span>
                                        )}
                                    </div>
                                    <div className="p-2 text-center">
                                        <span className="text-xs font-medium text-gray-700">Page {i + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSplit}
                            disabled={selectedPages.size === 0}
                            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-lg"
                        >
                            Extract Selected Pages ({selectedPages.size})
                        </button>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {processing && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Extracting Pages...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> PDF Split Successfully!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Split Another
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
                            <p className="text-sm text-gray-600 mb-1">Pages Extracted</p>
                            <p className="text-3xl font-bold text-gray-900">{result.selected_pages}</p>
                        </div>

                        <a
                            href={api.getSplitPdfDownloadURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Split PDF
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Split PDF</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload PDF</h3>
                            <p className="text-gray-600 text-sm">Select your PDF file to split</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Select Pages</h3>
                            <p className="text-gray-600 text-sm">Click on thumbnails to choose which pages to extract</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get your new PDF with only selected pages</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
