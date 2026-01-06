'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop, Image as ImageIcon, Download, RotateCw, ZoomIn } from 'lucide-react';

export default function ImageCropperPage() {
    const [file, setFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<any>(null);

    // Crop state
    const [crop, setCrop] = useState<CropType>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Aspect ratio
    const [aspectRatio, setAspectRatio] = useState<number | undefined>(1);

    // Advanced settings
    const [outputFormat, setOutputFormat] = useState('');
    const [quality, setQuality] = useState(85);

    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const aspectRatios = [
        { label: '1:1', value: 1, emoji: '⬛', color: 'bg-purple-100 text-purple-700' },
        { label: '4:3', value: 4 / 3, emoji: '📷', color: 'bg-blue-100 text-blue-700' },
        { label: '3:2', value: 3 / 2, emoji: '📸', color: 'bg-green-100 text-green-700' },
        { label: '16:9', value: 16 / 9, emoji: '🎬', color: 'bg-yellow-100 text-yellow-700' },
        { label: '9:16', value: 9 / 16, emoji: '📱', color: 'bg-orange-100 text-orange-700' },
        { label: 'Free', value: undefined, emoji: '✂️', color: 'bg-gray-100 text-gray-700' },
    ];

    const formats = [
        { value: '', label: 'Keep Original' },
        { value: 'jpg', label: 'JPG' },
        { value: 'png', label: 'PNG' },
        { value: 'webp', label: 'WebP' },
        { value: 'avif', label: 'AVIF' },
    ];

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

        // Create image preview
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);

        try {
            const response = await api.createImageCropperJob(selectedFile);
            setJobId(response.job_id);
            setImageInfo(response.image_info);
            setUploading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Set initial crop to center 50%
        const crop: CropType = {
            unit: '%',
            x: 25,
            y: 25,
            width: 50,
            height: 50
        };
        setCrop(crop);
    };

    const handleCrop = async () => {
        if (!jobId || !completedCrop || !imgRef.current || !imageInfo) return;

        setProcessing(true);
        setError(null);

        try {
            // Get scale factor between displayed image and actual image
            const displayedWidth = imgRef.current.width;
            const displayedHeight = imgRef.current.height;
            const originalWidth = imageInfo.width;
            const originalHeight = imageInfo.height;

            const scaleX = originalWidth / displayedWidth;
            const scaleY = originalHeight / displayedHeight;

            // Scale crop coordinates to actual image dimensions
            const cropX = Math.round(completedCrop.x * scaleX);
            const cropY = Math.round(completedCrop.y * scaleY);
            const cropWidth = Math.round(completedCrop.width * scaleX);
            const cropHeight = Math.round(completedCrop.height * scaleY);

            console.log('Displayed crop:', completedCrop);
            console.log('Scaled crop for backend:', { x: cropX, y: cropY, width: cropWidth, height: cropHeight });
            console.log('Scale factors:', { scaleX, scaleY });

            await api.cropImage(
                jobId,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                undefined,
                false,
                outputFormat || undefined,
                quality
            );

            // Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getImageCropperStatus(jobId);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Crop failed');
                        setProcessing(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to check status');
                    setProcessing(false);
                }
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Crop failed');
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setImageSrc(null);
        setJobId(null);
        setImageInfo(null);
        setResult(null);
        setError(null);
        setProcessing(false);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setAspectRatio(1);
        setOutputFormat('');
        setQuality(85);
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
                        <Crop className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Cropper
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Professional image cropping. Image stays fixed, drag the crop box to select area.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <Crop className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fixed Image</h3>
                            <p className="text-sm text-gray-600">Image stays in place</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <RotateCw className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Drag Box</h3>
                            <p className="text-sm text-gray-600">Move crop area</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                                <ZoomIn className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Resize Box</h3>
                            <p className="text-sm text-gray-600">Any size in free mode</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

                {jobId && imageInfo && imageSrc && !processing && !result && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cropper Area */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Select Crop Area
                                    {completedCrop && (
                                        <span className="text-sm font-normal text-emerald-600 ml-2">
                                            {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
                                        </span>
                                    )}
                                </h2>

                                {/* Cropper */}
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={aspectRatio}
                                        className="max-h-[600px]"
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imageSrc}
                                            alt="Crop preview"
                                            onLoad={onImageLoad}
                                            className="max-w-full h-auto"
                                        />
                                    </ReactCrop>
                                </div>

                                <p className="text-sm text-gray-500 mt-3 text-center">
                                    {aspectRatio === undefined
                                        ? '✂️ Free mode - Drag box corners to any size'
                                        : '📐 Aspect locked - Drag to move, corners to resize'}
                                </p>
                            </div>
                        </div>

                        {/* Controls Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Controls</h2>

                                {/* Aspect Ratio */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Aspect Ratio
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {aspectRatios.map((ratio) => (
                                            <button
                                                key={ratio.label}
                                                onClick={() => setAspectRatio(ratio.value)}
                                                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${aspectRatio === ratio.value
                                                    ? ratio.color + ' ring-2 ring-emerald-500'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <div className="text-base mb-1">{ratio.emoji}</div>
                                                <div className="font-bold text-[10px]">{ratio.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {aspectRatio === undefined && (
                                        <p className="text-xs text-emerald-600 mt-2">✓ Freeform - resize to any shape</p>
                                    )}
                                </div>

                                {/* Output Format */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Output Format
                                    </label>
                                    <select
                                        value={outputFormat}
                                        onChange={(e) => setOutputFormat(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        {formats.map((fmt) => (
                                            <option key={fmt.value} value={fmt.value}>
                                                {fmt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quality */}
                                {['jpg', 'webp', 'avif'].includes(outputFormat) && (
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
                                    </div>
                                )}

                                {/* Crop Button */}
                                <button
                                    onClick={handleCrop}
                                    disabled={!completedCrop}
                                    className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Crop Image
                                </button>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                                        <p className="text-xs text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Image Info */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">Original Image:</p>
                                    <p className="text-sm font-semibold text-gray-900">{imageInfo.width} × {imageInfo.height} px</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatBytes(imageInfo.file_size)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {processing && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cropping...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && result.result && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> Crop Complete!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Crop Another
                            </button>
                        </div>

                        {/* Results */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Original</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {result.result.original_dimensions[0]} × {result.result.original_dimensions[1]}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">{formatBytes(result.result.original_size)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Cropped</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {result.result.cropped_dimensions[0]} × {result.result.cropped_dimensions[1]}
                                </p>
                                <p className="text-sm text-emerald-600 mt-2">{formatBytes(result.result.cropped_size)}</p>
                            </div>
                        </div>

                        <a
                            href={api.getCroppedImageURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Cropped Image
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload</h3>
                            <p className="text-gray-600 text-sm">Select your image</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Drag Box</h3>
                            <p className="text-gray-600 text-sm">Move crop area</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Resize</h3>
                            <p className="text-gray-600 text-sm">Drag corners</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full font-bold text-lg mb-4">4</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get perfect crop</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
