'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { RotateCw, Image as ImageIcon, Download, RotateCcw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

export default function ImageRotatePage() {
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<any>(null);

    // Cumulative State
    const [rotation, setRotation] = useState(0); // 0-360
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    const [outputFormat, setOutputFormat] = useState('');
    const [quality, setQuality] = useState(95);

    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const formats = [
        { value: '', label: 'Keep Original' },
        { value: 'jpg', label: 'JPG' },
        { value: 'png', label: 'PNG' },
        { value: 'webp', label: 'WebP' },
    ];

    // Apply transformation client-side for instant preview
    useEffect(() => {
        if (!originalImage || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Determine canvas size based on rotation
            const rad = rotation * Math.PI / 180;
            const sin = Math.abs(Math.sin(rad));
            const cos = Math.abs(Math.cos(rad));

            const newWidth = img.width * cos + img.height * sin;
            const newHeight = img.width * sin + img.height * cos;

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Clear and prepare context
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            // 1. Translate to center
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // 2. Rotate
            ctx.rotate(rad);

            // 3. Flip (Scale)
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

            // 4. Draw Image centered
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            ctx.restore();
        };
        img.src = originalImage;
    }, [originalImage, rotation, flipH, flipV]);

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
            // 1. Read file as Data URL (Promise wrapper)
            const readFile = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            };

            const imageDataUrl = await readFile(selectedFile);
            setOriginalImage(imageDataUrl);

            // 2. Upload to API
            const response = await api.createImageRotateJob(selectedFile);
            setJobId(response.job_id);
            setImageInfo(response.image_info);

            // Reset state
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setFile(null);
            setOriginalImage(null);
        } finally {
            setUploading(false);
        }
    };

    const rotateLeft = () => {
        setRotation(prev => (prev - 90 + 360) % 360);
    };

    const rotateRight = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleDownload = async () => {
        if (!jobId) return;

        setDownloading(true);
        setError(null);

        try {
            await api.applyImageRotateTransform(
                jobId,
                rotation,
                flipH,
                flipV,
                outputFormat || undefined,
                quality
            );

            // Trigger download
            window.location.href = api.getRotatedImageURL(jobId);
            setDownloading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Download failed');
            setDownloading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setOriginalImage(null);
        setJobId(null);
        setImageInfo(null);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setError(null);
        setOutputFormat('');
        setQuality(95);
    };

    const hasChanges = rotation !== 0 || flipH || flipV;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl mb-6">
                        <RotateCw className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Rotate & Flip
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Correct orientation with precision. Rotate by angle, flip, and convert formats instantaneously.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!jobId && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`bg-white rounded-xl border-2 border-dashed p-16 text-center transition-all ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                            }`}
                    >
                        <div className="space-y-6">
                            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
                            <div>
                                <label htmlFor="file-upload" className="cursor-pointer text-purple-600 font-semibold hover:text-purple-700 text-lg">
                                    Click to upload
                                </label>
                                <span className="text-gray-600 text-lg"> or drag and drop</span>
                                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                            </div>
                            <p className="text-sm text-gray-500">JPG, PNG, WebP • Max 10MB</p>
                            {uploading && (
                                <div className="mt-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto"></div>
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

                {jobId && imageInfo && (
                    <div className="space-y-6">
                        {/* Top: Preview */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Live Preview
                                </h2>
                                <button
                                    onClick={() => {
                                        setRotation(0);
                                        setFlipH(false);
                                        setFlipV(false);
                                    }}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                                    disabled={!hasChanges}
                                >
                                    Reset Changes
                                </button>
                            </div>

                            {/* Centered Preview Container */}
                            <div className="relative w-full min-h-[500px] bg-gray-900 rounded-lg flex items-center justify-center p-8 overflow-hidden">
                                {originalImage ? (
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full max-h-[600px] object-contain shadow-2xl"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mb-2"></div>
                                        <p>Loading preview...</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mt-3 text-center">
                                Current: {rotation}° {flipH && '• Flip H'} {flipV && '• Flip V'}
                            </p>
                        </div>

                        {/* Bottom: Controls */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT: Rotation & Flip Controls */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    🔄 Transformation
                                </h2>

                                {/* Rotation Controls */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Rotation Angle: {Math.round(rotation)}°
                                    </label>

                                    {/* Slider */}
                                    <div className="mb-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            step="1"
                                            value={rotation}
                                            onChange={(e) => setRotation(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>0°</span>
                                            <span>90°</span>
                                            <span>180°</span>
                                            <span>270°</span>
                                            <span>360°</span>
                                        </div>
                                    </div>

                                    {/* Quick Rotate Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={rotateLeft}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            -90° Left
                                        </button>
                                        <button
                                            onClick={rotateRight}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                            +90° Right
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6"></div>

                                {/* Flip Controls */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Flip Image
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setFlipH(!flipH)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium border ${flipH
                                                ? 'bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-500'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FlipHorizontal className="w-5 h-5" />
                                            Horizontal
                                        </button>
                                        <button
                                            onClick={() => setFlipV(!flipV)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium border ${flipV
                                                ? 'bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-500'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FlipVertical className="w-5 h-5" />
                                            Vertical
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Output Options  */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    📤 Output Options
                                </h2>

                                {/* Output Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Output Format
                                    </label>
                                    <select
                                        value={outputFormat}
                                        onChange={(e) => setOutputFormat(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {formats.map((fmt) => (
                                            <option key={fmt.value} value={fmt.value}>
                                                {fmt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-5 h-5" />
                                        {downloading ? 'Processing...' : 'Download'}
                                    </button>

                                    <button
                                        onClick={handleReset}
                                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Start Over
                                    </button>
                                </div>

                                {!hasChanges && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-700">
                                            💡 Rotations are cumulative! 90° + 90° = 180°
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-xs text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
