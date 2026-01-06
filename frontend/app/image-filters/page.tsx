'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Wand2, Image as ImageIcon, Download, Sliders, RotateCcw } from 'lucide-react';

export default function ImageFiltersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<any>(null);

    // Slider position for before/after
    const [sliderPosition, setSliderPosition] = useState(50);

    // Filter settings
    const [brightness, setBrightness] = useState(1.0);
    const [contrast, setContrast] = useState(1.0);
    const [saturation, setSaturation] = useState(1.0);
    const [blur, setBlur] = useState(0);
    const [grayscale, setGrayscale] = useState(false);
    const [sepia, setSepia] = useState(false);

    // Track active preset
    const [activePreset, setActivePreset] = useState('Original');

    // Date/Time watermark feature
    const [showDateTime, setShowDateTime] = useState(false);
    const [dateTimePosition, setDateTimePosition] = useState('bottom-right');
    const [dateTimeFormat, setDateTimeFormat] = useState('full');

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

    const presets = [
        {
            name: 'Original',
            icon: '📷',
            settings: { brightness: 1, contrast: 1, saturation: 1, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Vibrant',
            icon: '🌈',
            settings: { brightness: 1.1, contrast: 1.2, saturation: 1.4, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'B&W',
            icon: '⚫',
            settings: { brightness: 1, contrast: 1.2, saturation: 1, blur: 0, grayscale: true, sepia: false }
        },
        {
            name: 'Sepia',
            icon: '📜',
            settings: { brightness: 1.1, contrast: 1, saturation: 1, blur: 0, grayscale: false, sepia: true }
        },
        {
            name: 'Soft',
            icon: '☁️',
            settings: { brightness: 1.1, contrast: 0.9, saturation: 0.9, blur: 2, grayscale: false, sepia: false }
        },
        {
            name: 'Sharp',
            icon: '⚡',
            settings: { brightness: 1, contrast: 1.3, saturation: 1.1, blur: 0, grayscale: false, sepia: false }
        },
        // NEW PRESETS
        {
            name: 'Vintage',
            icon: '📸',
            settings: { brightness: 1.05, contrast: 0.85, saturation: 0.7, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Cool',
            icon: '❄️',
            settings: { brightness: 1, contrast: 1.15, saturation: 0.85, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Warm',
            icon: '🔥',
            settings: { brightness: 1.1, contrast: 1.05, saturation: 1.2, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'HDR',
            icon: '💎',
            settings: { brightness: 1, contrast: 1.4, saturation: 1.1, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Dreamy',
            icon: '✨',
            settings: { brightness: 1.15, contrast: 0.9, saturation: 1.05, blur: 1, grayscale: false, sepia: false }
        },
        {
            name: 'Cinema',
            icon: '🎬',
            settings: { brightness: 0.95, contrast: 1.25, saturation: 0.9, blur: 0, grayscale: false, sepia: false }
        },
        // 2024 TRENDING FILTERS
        {
            name: 'Moody',
            icon: '🌙',
            settings: { brightness: 0.85, contrast: 1.3, saturation: 0.7, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Pastel',
            icon: '🦄',
            settings: { brightness: 1.2, contrast: 0.8, saturation: 0.6, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Neon',
            icon: '⚡',
            settings: { brightness: 1.1, contrast: 1.4, saturation: 1.6, blur: 0, grayscale: false, sepia: false }
        },
        {
            name: 'Fade',
            icon: '👻',
            settings: { brightness: 1.15, contrast: 0.7, saturation: 0.85, blur: 0.5, grayscale: false, sepia: false }
        },
        {
            name: 'Chrome',
            icon: '🔮',
            settings: { brightness: 1.05, contrast: 1.35, saturation: 1.15, blur: 0, grayscale: false, sepia: false }
        },
    ];

    // Apply filters in real-time using canvas
    useEffect(() => {
        if (!originalImage || !canvasRef.current || !originalCanvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const originalCanvas = originalCanvasRef.current;
        const originalCtx = originalCanvas.getContext('2d');

        if (!ctx || !originalCtx) return;

        // Create image
        const img = new Image();
        img.onload = () => {
            // Set canvas sizes
            canvas.width = img.width;
            canvas.height = img.height;
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;

            // Draw original
            originalCtx.drawImage(img, 0, 0);

            // Apply filters
            ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;

            if (grayscale) {
                ctx.filter += ' grayscale(100%)';
            }

            if (sepia) {
                ctx.filter += ' sepia(100%)';
            }

            ctx.drawImage(img, 0, 0);

            // Add date/time watermark if enabled
            if (showDateTime) {
                const now = new Date();
                let dateText = '';

                if (dateTimeFormat === 'full') {
                    dateText = now.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } else if (dateTimeFormat === 'date') {
                    dateText = now.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                } else if (dateTimeFormat === 'time') {
                    dateText = now.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }

                // Calculate font size based on image size
                const fontSize = Math.max(16, img.width / 40);
                ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
                ctx.textBaseline = 'bottom';

                // Measure text
                const metrics = ctx.measureText(dateText);
                const textWidth = metrics.width;
                const textHeight = fontSize;
                const padding = fontSize * 0.5;

                // Calculate position
                let x, y;
                switch (dateTimePosition) {
                    case 'top-left':
                        x = padding;
                        y = textHeight + padding;
                        break;
                    case 'top-right':
                        x = img.width - textWidth - padding;
                        y = textHeight + padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = img.height - padding;
                        break;
                    case 'bottom-right':
                    default:
                        x = img.width - textWidth - padding;
                        y = img.height - padding;
                        break;
                }

                // Draw semi-transparent background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(
                    x - padding / 2,
                    y - textHeight - padding / 2,
                    textWidth + padding,
                    textHeight + padding
                );

                // Draw text
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fillText(dateText, x, y);
            }
        };
        img.src = originalImage;
    }, [originalImage, brightness, contrast, saturation, blur, grayscale, sepia, showDateTime, dateTimePosition, dateTimeFormat]);

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

        // Create preview of original
        const reader = new FileReader();
        reader.onload = () => {
            setOriginalImage(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);

        try {
            const response = await api.createImageFiltersJob(selectedFile);
            setJobId(response.job_id);
            setImageInfo(response.image_info);
            setUploading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

    const handleDownload = async () => {
        if (!jobId || !canvasRef.current) return;

        setDownloading(true);
        setError(null);

        try {
            // Send current filter settings to backend for high-quality processing
            await api.applyImageFilters(
                jobId,
                brightness,
                contrast,
                saturation,
                1.0, // sharpness
                blur,
                false, // sharpen
                false, // edge enhance
                grayscale,
                sepia,
                outputFormat || undefined,
                quality
            );

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getImageFiltersStatus(jobId);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);

                        // Trigger download
                        window.location.href = api.getFilteredImageURL(jobId);
                        setDownloading(false);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Processing failed');
                        setDownloading(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to process');
                    setDownloading(false);
                }
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Download failed');
            setDownloading(false);
        }
    };

    const applyPreset = (preset: any) => {
        setBrightness(preset.settings.brightness);
        setContrast(preset.settings.contrast);
        setSaturation(preset.settings.saturation);
        setBlur(preset.settings.blur);
        setGrayscale(preset.settings.grayscale);
        setSepia(preset.settings.sepia);
        setActivePreset(preset.name);
    };

    const handleReset = () => {
        setFile(null);
        setOriginalImage(null);
        setJobId(null);
        setImageInfo(null);
        setError(null);
        applyPreset(presets[0]);
        setOutputFormat('');
        setQuality(95);
    };

    const handleSliderMouseDown = (e: React.MouseEvent) => {
        const container = e.currentTarget.parentElement;
        if (!container) return;

        const handleMove = (moveEvent: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = moveEvent.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            setSliderPosition(Math.max(0, Math.min(100, percentage)));
        };

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
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
                        <Wand2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Filters & Effects
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Apply professional filters with <strong>instant real-time preview</strong>. Choose from <strong>17 trending presets</strong> and add date/time stamps!
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
                            <p className="text-sm text-gray-500">JPG, PNG, WebP • Max 10MB</p>
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

                {jobId && imageInfo && originalImage && (
                    <div className="space-y-6">
                        {/* Top Row: Preview LEFT + Filters RIGHT */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT: Preview (2/3 width) */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Live Preview
                                </h2>
                                <p className="text-sm text-emerald-600 mb-4">
                                    ⚡ Changes apply instantly as you adjust filters!
                                </p>

                                {/* Before/After Slider with Canvas */}
                                <div className="relative w-full h-[450px] bg-gray-900 rounded-lg overflow-hidden select-none">
                                    {/* Hidden canvases for processing */}
                                    <canvas ref={originalCanvasRef} className="hidden" />

                                    {/* After Image (Filtered Canvas) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>

                                    {/* Before Image (Original) - Clipped */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                    >
                                        <img
                                            src={originalImage}
                                            alt="Before"
                                            className="max-w-full max-h-full object-contain"
                                            draggable={false}
                                        />
                                    </div>

                                    {/* Slider Handle */}
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
                                        style={{ left: `${sliderPosition}%` }}
                                        onMouseDown={handleSliderMouseDown}
                                    >
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                                            <Sliders className="w-5 h-5 text-gray-700" />
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium pointer-events-none">
                                        Before
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium pointer-events-none">
                                        After ⚡
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mt-3 text-center">
                                    ← Drag slider to compare →
                                </p>
                            </div>

                            {/* RIGHT: Filter Presets (1/3 width) */}
                            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                    🎨 Filters
                                </h2>
                                <p className="text-xs text-gray-500 mb-3">
                                    {activePreset && (
                                        <span className="text-emerald-600 font-medium">
                                            Active: {activePreset}
                                        </span>
                                    )}
                                </p>

                                <div className="grid grid-cols-3 gap-2 max-h-[450px] overflow-y-auto pr-2">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => applyPreset(preset)}
                                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${activePreset === preset.name
                                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-1'
                                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700'
                                                }`}
                                        >
                                            <div className="text-lg mb-1">{preset.icon}</div>
                                            <div className="text-[10px] leading-tight">{preset.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Adjustments in Two Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT: Sliders */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    ⚙️ Manual Adjustments
                                </h2>

                                {/* Sliders in 2-column grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Brightness */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brightness: {brightness.toFixed(1)}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={brightness}
                                            onChange={(e) => {
                                                setBrightness(parseFloat(e.target.value));
                                                setActivePreset('Custom');
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>

                                    {/* Contrast */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contrast: {contrast.toFixed(1)}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={contrast}
                                            onChange={(e) => {
                                                setContrast(parseFloat(e.target.value));
                                                setActivePreset('Custom');
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>

                                    {/* Saturation */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Saturation: {saturation.toFixed(1)}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={saturation}
                                            onChange={(e) => {
                                                setSaturation(parseFloat(e.target.value));
                                                setActivePreset('Custom');
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>

                                    {/* Blur */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Blur: {blur}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            step="1"
                                            value={blur}
                                            onChange={(e) => {
                                                setBlur(parseInt(e.target.value));
                                                setActivePreset('Custom');
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Date/Time, Format, Download */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    📤 Output Options
                                </h2>

                                {/* Date/Time Watermark */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            📅 Date/Time Stamp
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showDateTime}
                                                onChange={(e) => setShowDateTime(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>

                                    {showDateTime && (
                                        <div className="grid grid-cols-2 gap-3 pl-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Position
                                                </label>
                                                <select
                                                    value={dateTimePosition}
                                                    onChange={(e) => setDateTimePosition(e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                >
                                                    <option value="top-left">↖️ Top Left</option>
                                                    <option value="top-right">↗️ Top Right</option>
                                                    <option value="bottom-left">↙️ Bottom Left</option>
                                                    <option value="bottom-right">↘️ Bottom Right</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Format
                                                </label>
                                                <select
                                                    value={dateTimeFormat}
                                                    onChange={(e) => setDateTimeFormat(e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                >
                                                    <option value="full">📅 Date & Time</option>
                                                    <option value="date">📅 Date Only</option>
                                                    <option value="time">🕐 Time Only</option>
                                                </select>
                                            </div>

                                            <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                                                <p className="text-xs text-emerald-700">
                                                    <strong>Preview:</strong><br />
                                                    {dateTimeFormat === 'full' && new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {dateTimeFormat === 'date' && new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    {dateTimeFormat === 'time' && new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Output Format */}
                                <div>
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

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Download Button */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        <Download className="w-5 h-5" />
                                        {downloading ? 'Processing...' : 'Download'}
                                    </button>

                                    {/* Reset Button */}
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Start Over
                                    </button>
                                </div>

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
