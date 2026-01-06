'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FileText, Zap, Languages, File, Download } from 'lucide-react';

const LANGUAGES = [
    { code: 'auto', name: 'Auto (All Languages)' },
    { code: 'eng', name: 'English' },
    { code: 'hin', name: 'Hindi' },
    { code: 'ara', name: 'Arabic' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
];

export default function OcrPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState('auto');
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [ocrMode, setOcrMode] = useState<'standard' | 'enhanced'>('standard');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
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
            setFile(droppedFile);
        }
    };

    const handleOcr = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const response = await api.createOcrPdfJob(file, language, ocrMode);
            setJobId(response.job_id);
            setUploading(false);

            // Trigger processing
            await api.processOcrPdf(response.job_id);

            setProcessing(true);

            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getOcrJobStatus(response.job_id);

                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'OCR failed');
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
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        OCR PDF
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Convert scanned documents into searchable and editable text with advanced OCR technology.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Languages className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Multi-Language</h3>
                            <p className="text-sm text-gray-600">Support for 12+ languages</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">High Accuracy</h3>
                            <p className="text-sm text-gray-600">Advanced OCR engine</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <File className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Searchable PDF</h3>
                            <p className="text-sm text-gray-600">Get both text and PDF output</p>
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
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">PDF, JPG, PNG files • Max 50MB</p>
                            </div>
                        </div>

                        {file && (
                            <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
                                {/* Selected File Banner */}
                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-sm text-gray-500 hover:text-red-500 font-medium px-3 py-1 rounded-md hover:bg-white transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Language Selector */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            Document Language
                                        </label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                        >
                                            {LANGUAGES.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mode Selector */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            Processing Mode
                                        </label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setOcrMode('standard')}
                                                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all ${ocrMode === 'standard'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <span className="mr-2">⚡</span> Standard
                                            </button>
                                            <button
                                                onClick={() => setOcrMode('enhanced')}
                                                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all ${ocrMode === 'enhanced'
                                                    ? 'bg-white text-purple-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <span className="mr-2">🧠</span> Enhanced
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {ocrMode === 'standard'
                                                ? 'Fast text extraction. (Est: 1-2 mins)'
                                                : 'AI layout analysis. Best for tables & columns. (Est: 2-5 mins)'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleOcr}
                                    disabled={uploading}
                                    className={`w-full text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 text-lg shadow-md ${ocrMode === 'enhanced' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {uploading
                                        ? 'Uploading...'
                                        : ocrMode === 'enhanced' ? 'Start AI Extraction' : 'Extract Text'
                                    }
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
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Extracting Text...
                        </h2>

                        <div className="max-w-md mx-auto mt-8">
                            {/* Progress Info */}
                            <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                <span>Processing page {result?.progress?.processed_pages || 0} of {result?.progress?.total_pages || '?'}</span>
                                <span>{result?.progress?.percent || 0}%</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${ocrMode === 'enhanced' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-blue-600'}`}
                                    style={{ width: `${result?.progress?.percent || 0}%` }}
                                ></div>
                            </div>

                            {/* Time Estimate */}
                            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                                <p className="font-medium">
                                    ⏱ Estimated Time: {
                                        ocrMode === 'enhanced'
                                            ? "2-5 minutes"
                                            : "1-2 minutes"
                                    }
                                </p>
                                <p className="text-xs opacity-75 mt-1">
                                    {ocrMode === 'enhanced'
                                        ? "AI is analyzing document layout and structure..."
                                        : "Standard OCR is running..."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> Text Extracted!
                            </h2>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Process Another
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Total Pages</p>
                                <p className="text-3xl font-bold text-gray-900">{result.total_pages || 0}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-sm text-gray-600 mb-1">Language</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {LANGUAGES.find(l => l.code === language)?.name || 'Auto'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <a
                                href={api.getOcrResultDownloadURL(jobId, 'txt')}
                                download
                                className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                            >
                                <Download className="w-5 h-5" />
                                Download Extracted Text
                            </a>
                            <a
                                href={api.getOcrResultDownloadURL(jobId, 'json')}
                                download
                                className="inline-flex items-center justify-center gap-2 w-full bg-white border-2 border-blue-600 text-blue-600 font-semibold py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <File className="w-5 h-5" />
                                Download JSON Result
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use OCR PDF</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload PDF</h3>
                            <p className="text-gray-600 text-sm">Select your scanned PDF document</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Choose Language</h3>
                            <p className="text-gray-600 text-sm">Select the document language or use auto-detect</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get extracted text or searchable PDF</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
