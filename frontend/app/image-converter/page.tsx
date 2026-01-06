'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { RefreshCw, Zap, Gauge, Image as ImageIcon, Download, Settings, ChevronDown, ChevronUp } from 'lucide-react';

export default function ImageConverterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<any>(null);
    const [targetFormat, setTargetFormat] = useState('webp');
    const [quality, setQuality] = useState(85);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced settings
    const [targetSize, setTargetSize] = useState<number | null>(null);
    const [maxWidth, setMaxWidth] = useState<number | null>(null);
    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const presets = [
        { name: 'Maximum', value: 'maximum', quality: 98, color: 'bg-purple-100 text-purple-700' },
        { name: 'High', value: 'high', quality: 90, color: 'bg-blue-100 text-blue-700' },
        { name: 'Balanced', value: 'balanced', quality: 85, color: 'bg-green-100 text-green-700' },
        { name: 'Good', value: 'good', quality: 75, color: 'bg-yellow-100 text-yellow-700' },
        { name: 'Web', value: 'web', quality: 60, color: 'bg-orange-100 text-orange-700' },
    ];

    const formats = [
        { value: 'jpg', label: 'JPG', desc: 'Small, lossy' },
        { value: 'png', label: 'PNG', desc: 'Lossless, larger' },
        { value: 'webp', label: 'WebP', desc: 'Modern, efficient' },
        { value: 'avif', label: 'AVIF', desc: 'Best compression' },
        { value: 'bmp', label: 'BMP', desc: 'Uncompressed' },
        { value: 'tiff', label: 'TIFF', desc: 'Professional' },
        { value: 'gif', label: 'GIF', desc: 'Web graphics' },
    ];

    const lossyFormats = ['jpg', 'webp', 'avif'];
    const hasQualityControl = lossyFormats.includes(targetFormat);

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
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            handleUpload(droppedFile);
        }
    };

    const handleUpload = async (selectedFile: File) => {
        setFile(selectedFile);
        setUploading(true);
        setError(null);

        try {
            const response = await api.createImageConverterJob(selectedFile);
            setJobId(response.job_id);
            setImageInfo(response.image_info);
            setUploading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

    const handlePresetClick = (presetQuality: number) => {
        setQuality(presetQuality);
    };

    const handleConvert = async () => {
        if (!jobId) return;

        setProcessing(true);
        setError(null);

        try {
            await api.convertImage(
                jobId,
                targetFormat,
                quality,
                targetSize || undefined,
                maxWidth || undefined,
                maxHeight || undefined
            );

            // Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getImageConverterStatus(jobId);
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
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Conversion failed');
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setJobId(null);
        setImageInfo(null);
        setResult(null);
        setError(null);
        setProcessing(false);
        setTargetFormat('webp');
        setQuality(85);
        setTargetSize(null);
        setMaxWidth(null);
        setMaxHeight(null);
        setShowAdvanced(false);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-6">
                        <RefreshCw className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Converter
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Convert images between formats with quality control. Support for 7 formats and advanced optimization.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <Gauge className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Quality Control</h3>
                            <p className="text-sm text-gray-600">Presets & custom quality</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <Settings className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Advanced Options</h3>
                            <p className="text-sm text-gray-600">Target size, resize, optimize</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <ImageIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">7 Formats</h3>
                            <p className="text-sm text-gray-600">JPG, PNG, WebP, AVIF, BMP, TIFF, GIF</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!jobId && !processing && !result && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`bg-white rounded-xl border-2 border-dashed p-16 text-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
                            }`}
                    >
                        <div className="space-y-6">
                            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
                            <div>
                                <label htmlFor="file-upload" className="cursor-pointer text-emerald-600 font-semibold hover:text-emerald-700 text-lg">
                                    Click to upload
                                </label>
                                <span className="text-gray-600 text-lg"> or drag and drop</span>
                                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                            </div>
                            <p className="text-sm text-gray-500">JPG, PNG, WebP, AVIF, BMP, TIFF, GIF • Max 10MB</p>
                            {uploading && (
                                <div className="mt-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
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
                )}

                {jobId && imageInfo && !processing && !result && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Convert Image</h2>

                        {/* Image Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Current Format</p>
                                    <p className="font-semibold text-gray-900">{imageInfo.format}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Dimensions</p>
                                    <p className="font-semibold text-gray-900">{imageInfo.width} × {imageInfo.height}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">File Size</p>
                                    <p className="font-semibold text-gray-900">{formatBytes(imageInfo.file_size)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Format Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Format
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                                {formats.map((fmt) => (
                                    <button
                                        key={fmt.value}
                                        onClick={() => setTargetFormat(fmt.value)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${targetFormat === fmt.value
                                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold">{fmt.label}</div>
                                        <div className="text-[10px] opacity-75">{fmt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality Presets (only for lossy formats) */}
                        {hasQualityControl && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quick Presets
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.value}
                                            onClick={() => handlePresetClick(preset.quality)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${quality === preset.quality
                                                    ? preset.color + ' ring-2 ring-emerald-500'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quality Slider (only for lossy formats) */}
                        {hasQualityControl && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quality: {quality}%
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Smaller file (lower quality)</span>
                                    <span>Larger file (higher quality)</span>
                                </div>
                            </div>
                        )}

                        {/* Advanced Settings Toggle */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-4"
                        >
                            <Settings className="w-4 h-4" />
                            Advanced Settings
                            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Advanced Settings Panel */}
                        {showAdvanced && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
                                {/* Target File Size */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target File Size (KB)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 500"
                                        value={targetSize || ''}
                                        onChange={(e) => setTargetSize(parseInt(e.target.value) || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Auto-adjust quality to hit target size</p>
                                </div>

                                {/* Max Dimensions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resize Image (optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Max width (px)"
                                                value={maxWidth || ''}
                                                onChange={(e) => setMaxWidth(parseInt(e.target.value) || null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Max height (px)"
                                                value={maxHeight || ''}
                                                onChange={(e) => setMaxHeight(parseInt(e.target.value) || null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Maintains aspect ratio</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleConvert}
                            className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 transition-colors text-lg"
                        >
                            Convert to {targetFormat.toUpperCase()}
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
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Converting...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && result.result && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> Conversion Complete!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Convert Another
                            </button>
                        </div>

                        {/* Results Comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Original</p>
                                <p className="text-lg font-bold text-gray-900">{result.result.original_format?.toUpperCase() || imageInfo.format}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{formatBytes(result.result.input_size)}</p>
                                {result.result.was_resized && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {result.result.original_dimensions[0]} × {result.result.original_dimensions[1]}
                                    </p>
                                )}
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Converted</p>
                                <p className="text-lg font-bold text-emerald-600">{result.result.target_format?.toUpperCase()}</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-2">{formatBytes(result.result.output_size)}</p>
                                {result.result.was_resized && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                        {result.result.output_dimensions[0]} × {result.result.output_dimensions[1]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Size Difference */}
                        {result.result.size_diff_percent !== 0 && (
                            <div className={`rounded-lg p-4 mb-6 ${result.result.size_diff_percent < 0 ? 'bg-green-50' : 'bg-yellow-50'
                                }`}>
                                <p className="text-sm font-medium text-center">
                                    {result.result.size_diff_percent < 0 ? (
                                        <span className="text-green-700">
                                            ✓ File size reduced by {Math.abs(result.result.size_diff_percent).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-yellow-700">
                                            File size increased by {result.result.size_diff_percent.toFixed(1)}%
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {result.result.quality && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                                <p className="text-sm text-gray-600">Quality Used</p>
                                <p className="text-3xl font-bold text-blue-600">{result.result.quality}%</p>
                            </div>
                        )}

                        <a
                            href={api.getConvertedImageURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Converted Image
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Image Converter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload Image</h3>
                            <p className="text-gray-600 text-sm">7 formats supported</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Choose Format</h3>
                            <p className="text-gray-600 text-sm">Select target format</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Adjust Settings</h3>
                            <p className="text-gray-600 text-sm">Quality, resize, optimize</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">4</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get converted image</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
