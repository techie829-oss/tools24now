'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Job, JobResults } from '@/lib/types';
import { Image, Zap, Package, FileText, Download } from 'lucide-react';

export default function PdfToImagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [job, setJob] = useState<Job | null>(null);
    const [results, setResults] = useState<JobResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Poll for job status
    const pollJobStatus = useCallback(async (jobId: string) => {
        const intervalId = setInterval(async () => {
            try {
                const status = await api.getJobStatus(jobId);
                setJob(status);

                if (status.status === 'completed') {
                    clearInterval(intervalId);
                    const jobResults = await api.getJobResults(jobId);
                    setResults(jobResults);
                } else if (status.status === 'failed') {
                    clearInterval(intervalId);
                    setError(status.error || 'Processing failed');
                }
            } catch (err) {
                clearInterval(intervalId);
                setError('Failed to check job status');
            }
        }, 1500);

        return () => clearInterval(intervalId);
    }, []);

    // Handle file upload
    const handleUpload = useCallback(async (selectedFile: File) => {
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const response = await api.createPdfToImagesJob(selectedFile);
            setJob(response as Job);
            pollJobStatus(response.job_id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    }, [pollJobStatus]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleUpload(selectedFile);
        }
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
        if (droppedFile) {
            setFile(droppedFile);
            handleUpload(droppedFile);
        }
    }, [handleUpload]);

    const downloadAllAsZip = () => {
        if (job) {
            const zipUrl = api.getZipDownloadURL(job.job_id);
            window.open(zipUrl, '_blank');
        }
    };

    const resetForm = () => {
        setFile(null);
        setJob(null);
        setResults(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Centered Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
                        <Image className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Convert PDF to Images
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Extract every page from your PDF as high-quality PNG images. Perfect for sharing, presentations, or archiving.
                    </p>
                </div>
            </div>

            {/* Feature Cards - Simple 3-column */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Image className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
                            <p className="text-sm text-gray-600">300 DPI resolution for crystal-clear images</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
                            <p className="text-sm text-gray-600">Convert all pages in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Easy Download</h3>
                            <p className="text-sm text-gray-600">Get all images in a single ZIP file</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Upload Area */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!job && !uploading && (
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
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileInputChange}
                                />
                            </div>
                            <p className="text-sm text-gray-500">PDF files only • Max 50MB</p>
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Uploading your PDF...</p>
                    </div>
                )}

                {job && job.status === 'processing' && (
                    <div className="bg-white rounded-xl p-12 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Converting Pages...</h2>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{job.progress?.processed_pages || 0} / {job.progress?.total_pages || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${job.progress?.percent || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {results && (
                    <div className="bg-white rounded-xl p-12 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                <span className="text-green-600">✓</span> Conversion Complete!
                            </h2>
                            <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Convert Another
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Total Pages</p>
                                <p className="text-3xl font-bold text-gray-900">{results.total_pages}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Images Created</p>
                                <p className="text-3xl font-bold text-gray-900">{results.total_pages}</p>
                            </div>
                        </div>

                        <button
                            onClick={downloadAllAsZip}
                            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download All Images (ZIP)
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
            </div>

            {/* How to Use - Clean & Simple */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use PDF to Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">
                                1
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload Your PDF</h3>
                            <p className="text-gray-600 text-sm">Drag & drop your PDF file or click to browse and select from your computer</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">
                                2
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Auto Convert</h3>
                            <p className="text-gray-600 text-sm">Our tool automatically converts all pages to high-quality PNG images</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">
                                3
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Download ZIP</h3>
                            <p className="text-gray-600 text-sm">Get all your images packaged in a convenient ZIP file for easy download</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
