'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Maximize2, Zap, Gauge, Image as ImageIcon, Download, Settings, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';

type ResizeMethod = 'dimensions' | 'percentage' | 'preset';

export default function ImageResizerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<any>(null);

    // Resize method
    const [resizeMethod, setResizeMethod] = useState<ResizeMethod>('preset');

    // Method 1: Dimensions
    const [width, setWidth] = useState<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [maintainAspect, setMaintainAspect] = useState(true);

    // Method 2: Percentage
    const [scalePercent, setScalePercent] = useState(100);

    // Method 3: Preset
    const [selectedPreset, setSelectedPreset] = useState('medium');

    // Advanced settings
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [resampling, setResampling] = useState('lanczos');
    const [outputFormat, setOutputFormat] = useState('');
    const [quality, setQuality] = useState(85);

    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const presets = [
        { value: 'thumbnail', label: 'Thumbnail', size: '150×150', color: 'bg-purple-100 text-purple-700' },
        { value: 'small', label: 'Small', size: '480×480', color: 'bg-blue-100 text-blue-700' },
        { value: 'medium', label: 'Medium', size: '800×800', color: 'bg-green-100 text-green-700' },
        { value: 'large', label: 'Large', size: '1200×1200', color: 'bg-yellow-100 text-yellow-700' },
        { value: 'hd', label: 'HD', size: '1920×1080', color: 'bg-orange-100 text-orange-700' },
        { value: '4k', label: '4K', size: '3840×2160', color: 'bg-red-100 text-red-700' },
    ];

    const resamplingMethods = [
        { value: 'lanczos', label: 'LANCZOS (Best Quality)' },
        { value: 'bicubic', label: 'BICUBIC (Good Quality)' },
        { value: 'bilinear', label: 'BILINEAR (Fast)' },
        { value: 'nearest', label: 'NEAREST (Fastest)' },
    ];

    const formats = [
        { value: '', label: 'Keep Original' },
        { value: 'jpg', label: 'JPG' },
        { value: 'png', label: 'PNG' },
        { value: 'webp', label: 'WebP' },
        { value: 'avif', label: 'AVIF' },
        { value: 'bmp', label: 'BMP' },
        { value: 'tiff', label: 'TIFF' },
        { value: 'gif', label: 'GIF' },
    ];

    // Auto-calculate missing dimension when aspect ratio is locked
    useEffect(() => {
        if (maintainAspect && imageInfo && resizeMethod === 'dimensions') {
            const aspectRatio = imageInfo.width / imageInfo.height;
            if (width && !height) {
                setHeight(Math.round(width / aspectRatio));
            } else if (height && !width) {
                setWidth(Math.round(height * aspectRatio));
            }
        }
    }, [width, height, maintainAspect, imageInfo, resizeMethod]);

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
            const response = await api.createImageResizerJob(selectedFile);
            setJobId(response.job_id);
            setImageInfo(response.image_info);
            setUploading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

    const handleResize = async () => {
        if (!jobId) return;

        setProcessing(true);
        setError(null);

        try {
            await api.resizeImage(
                jobId,
                resizeMethod === 'dimensions' ? width || undefined : undefined,
                resizeMethod === 'dimensions' ? height || undefined : undefined,
                resizeMethod === 'percentage' ? scalePercent : undefined,
                resizeMethod === 'preset' ? selectedPreset : undefined,
                maintainAspect,
                resampling,
                outputFormat || undefined,
                quality
            );

            // Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getImageResizerStatus(jobId);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Resize failed');
                        setProcessing(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to check status');
                    setProcessing(false);
                }
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Resize failed');
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
        setWidth(null);
        setHeight(null);
        setScalePercent(100);
        setSelectedPreset('medium');
        setResizeMethod('preset');
        setMaintainAspect(true);
        setResampling('lanczos');
        setOutputFormat('');
        setQuality(85);
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
                        <Maximize2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Resizer
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Resize images by dimensions, percentage, or presets. Maintain aspect ratio with professional resampling.
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
                            <h3 className="font-semibold text-gray-900 mb-2">3 Resize Methods</h3>
                            <p className="text-sm text-gray-600">Dimensions, percentage, presets</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <Settings className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Aspect Ratio</h3>
                            <p className="text-sm text-gray-600">Lock or unlock proportions</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Quality Resampling</h3>
                            <p className="text-sm text-gray-600">LANCZOS, BICUBIC, and more</p>
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
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resize Image</h2>

                        {/* Image Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Format</p>
                                    <p className="font-semibold text-gray-900">{imageInfo.format}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Original Size</p>
                                    <p className="font-semibold text-gray-900">{imageInfo.width} × {imageInfo.height}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">File Size</p>
                                    <p className="font-semibold text-gray-900">{formatBytes(imageInfo.file_size)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Resize Method Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setResizeMethod('dimensions')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${resizeMethod === 'dimensions'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                📐 Dimensions
                            </button>
                            <button
                                onClick={() => setResizeMethod('percentage')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${resizeMethod === 'percentage'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                📊 Percentage
                            </button>
                            <button
                                onClick={() => setResizeMethod('preset')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${resizeMethod === 'preset'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🎯 Presets
                            </button>
                        </div>

                        {/* Method 1: Dimensions */}
                        {resizeMethod === 'dimensions' && (
                            <div className="mb-6">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Width (px)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Width"
                                            value={width || ''}
                                            onChange={(e) => setWidth(parseInt(e.target.value) || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Height (px)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Height"
                                            value={height || ''}
                                            onChange={(e) => setHeight(parseInt(e.target.value) || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMaintainAspect(!maintainAspect)}
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600"
                                >
                                    {maintainAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    {maintainAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                                </button>
                            </div>
                        )}

                        {/* Method 2: Percentage */}
                        {resizeMethod === 'percentage' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Scale to {scalePercent}% of original
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    value={scalePercent}
                                    onChange={(e) => setScalePercent(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>10% (smaller)</span>
                                    <span>200% (larger)</span>
                                </div>
                                {imageInfo && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        New size: {Math.round(imageInfo.width * scalePercent / 100)} × {Math.round(imageInfo.height * scalePercent / 100)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Method 3: Presets */}
                        {resizeMethod === 'preset' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose Preset Size
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setSelectedPreset(preset.value)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedPreset === preset.value
                                                    ? preset.color + ' ring-2 ring-emerald-500'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="font-bold">{preset.label}</div>
                                            <div className="text-[10px] opacity-75">{preset.size}</div>
                                        </button>
                                    ))}
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
                                {/* Resampling Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resampling Method
                                    </label>
                                    <select
                                        value={resampling}
                                        onChange={(e) => setResampling(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        {resamplingMethods.map((method) => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Output Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Output Format
                                    </label>
                                    <select
                                        value={outputFormat}
                                        onChange={(e) => setOutputFormat(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        {formats.map((fmt) => (
                                            <option key={fmt.value} value={fmt.value}>
                                                {fmt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quality (for lossy formats) */}
                                {['jpg', 'webp', 'avif'].includes(outputFormat) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleResize}
                            className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 transition-colors text-lg"
                        >
                            Resize Image
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
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resizing...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && result.result && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> Resize Complete!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Resize Another
                            </button>
                        </div>

                        {/* Results Comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Original</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {result.result.original_dimensions[0]} × {result.result.original_dimensions[1]}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">{formatBytes(result.result.original_size)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Resized</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {result.result.resized_dimensions[0]} × {result.result.resized_dimensions[1]}
                                </p>
                                <p className="text-sm text-emerald-600 mt-2">{formatBytes(result.result.resized_size)}</p>
                            </div>
                        </div>

                        {/* Resize Info */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Method</p>
                                    <p className="font-semibold text-blue-900">{result.result.resize_method}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Resampling</p>
                                    <p className="font-semibold text-blue-900">{result.result.resampling.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Scale Factor</p>
                                    <p className="font-semibold text-blue-900">
                                        {result.result.scale_factor_x}x × {result.result.scale_factor_y}x
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Aspect Ratio</p>
                                    <p className="font-semibold text-blue-900">
                                        {result.result.maintained_aspect ? 'Maintained' : 'Custom'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Upscaling Warning */}
                        {result.result.is_upscaling && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Image was upscaled - quality may be reduced
                                </p>
                            </div>
                        )}

                        <a
                            href={api.getResizedImageURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Resized Image
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Image Resizer</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload Image</h3>
                            <p className="text-gray-600 text-sm">Select your image file</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Choose Method</h3>
                            <p className="text-gray-600 text-sm">Dimensions, %, or preset</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Set Options</h3>
                            <p className="text-gray-600 text-sm">Aspect ratio, quality</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">4</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get resized image</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
