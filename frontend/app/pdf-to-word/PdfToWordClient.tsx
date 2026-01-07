'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FileType, Zap, ScanText, FileText, Download, AlertTriangle } from 'lucide-react';

export default function PdfToWordPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
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
            const response = await api.createPdfToWordJob(selectedFile);
            const jobResponse = response as any;
            setJobId(jobResponse.job_id);
            setUploading(false);

            // Auto-start processing
            setProcessing(true);
            await api.processPdfToWord(jobResponse.job_id);

            // Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getPdfToWordStatus(jobResponse.job_id);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Conversion failed');
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
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
                        <FileType className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        PDF to Word
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Convert PDF files to editable Word documents (.docx). Edit text, images, and formatting with ease.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <ScanText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Editable Format</h3>
                            <p className="text-sm text-gray-600">Full editing capability in Word</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Conversion</h3>
                            <p className="text-sm text-gray-600">Convert in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Format Preserved</h3>
                            <p className="text-sm text-gray-600">Maintains layout and styling</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!jobId && !processing && !result && (
                    <>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-amber-900">Note about Scanned Documents</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    This tool currently supports <strong>text-based PDFs only</strong>. Scanned documents or images containing text will not be converted to editable text. Enhanced OCR support is coming soon!
                                </p>
                            </div>
                        </div>

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
                                {uploading && (
                                    <div className="mt-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                                        <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                                    </div>
                                )}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {processing && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Converting to Word...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mt-8"></div>
                        <p className="text-sm text-gray-600 mt-4">
                            Converting PDF to editable Word format
                        </p>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> Conversion Complete!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Convert Another
                            </button>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6 text-center mb-6">
                            <FileType className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-1">Ready to Download</p>
                            <p className="text-xl font-bold text-gray-900">Word Document (.docx)</p>
                        </div>

                        <a
                            href={api.getWordDownloadURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Word File
                        </a>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Open with Microsoft Word, Google Docs, or any word processor
                        </p>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use PDF to Word</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload PDF</h3>
                            <p className="text-gray-600 text-sm">Select your PDF file to convert</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Auto-Convert</h3>
                            <p className="text-gray-600 text-sm">Conversion starts automatically</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get your editable Word document</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
