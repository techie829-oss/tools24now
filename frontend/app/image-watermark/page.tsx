'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Download, Type, Upload, Grid3x3,
    Move, Sliders, Palette, RefreshCw, Stamp
} from 'lucide-react';

export default function ImageWatermarkPage() {
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<any>(null);

    // Watermark State
    const [activeTab, setActiveTab] = useState<'text' | 'logo'>('text');

    // Text Control
    const [watermarkText, setWatermarkText] = useState('My Watermark');
    const [textSize, setTextSize] = useState(40);
    const [textColor, setTextColor] = useState('#000000');

    // Logo Control
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoJobId, setLogoJobId] = useState<string | null>(null);
    const [logoScale, setLogoScale] = useState(20); // % of main image width

    // Common Controls
    const [opacity, setOpacity] = useState(50);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState('center');

    const [processing, setProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Helper to calculate position for canvas
    const calculatePosition = (
        bgW: number, bgH: number,
        fgW: number, fgH: number,
        pos: string
    ) => {
        let x = 0, y = 0;
        const padding = 20;

        if (pos.includes('left')) x = padding;
        else if (pos.includes('right')) x = bgW - fgW - padding;
        else x = (bgW - fgW) / 2;

        if (pos.includes('top')) y = padding;
        else if (pos.includes('bottom')) y = bgH - fgH - padding;
        else y = (bgH - fgH) / 2;

        return { x, y };
    };

    // Draw Preview
    useEffect(() => {
        if (!originalImage || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Set canvas size (scaled down for display if needed, but keeping aspect ratio)
            // For true WYSIWYG, we should probably stick to intrinsic or a fixed preview scale
            // Let's use intrinsic size for accuracy, CSS will scale it down visually
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            if (activeTab === 'text' && watermarkText) {
                ctx.save();

                // Configure Font
                ctx.font = `${textSize * 2}px Arial`; // Scale up for resolution
                ctx.fillStyle = textColor;
                ctx.globalAlpha = opacity / 100;

                const metrics = ctx.measureText(watermarkText);
                const textW = metrics.width;
                const textH = textSize * 2; // Approx height

                // Calculate Position
                const { x, y } = calculatePosition(canvas.width, canvas.height, textW, textH, position);

                // Rotate around center
                const centerX = x + textW / 2;
                const centerY = y + textH / 2;

                ctx.translate(centerX, centerY);
                ctx.rotate((rotation * Math.PI) / 180);

                // Draw centered
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(watermarkText, 0, 0);

                ctx.restore();
            }
            else if (activeTab === 'logo' && logoPreview) {
                const logo = new Image();
                logo.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = opacity / 100;

                    const targetW = canvas.width * (logoScale / 100);
                    const aspectRatio = logo.height / logo.width;
                    const targetH = targetW * aspectRatio;

                    const { x, y } = calculatePosition(canvas.width, canvas.height, targetW, targetH, position);

                    // Rotate
                    ctx.translate(x + targetW / 2, y + targetH / 2);
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.drawImage(logo, -targetW / 2, -targetH / 2, targetW, targetH);

                    ctx.restore();
                };
                logo.src = logoPreview;
            }
        };
        img.src = originalImage;
    }, [originalImage, activeTab, watermarkText, textSize, textColor, logoPreview, logoScale, opacity, rotation, position]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setFile(file);
        setUploading(true);
        setError(null);

        // Preview
        const reader = new FileReader();
        reader.onload = () => setOriginalImage(reader.result as string);
        reader.readAsDataURL(file);

        try {
            const res = await api.createImageWatermarkJob(file);
            setJobId(res.job_id);
            setImageInfo(res.image_info);
            // Default text size proportional to image
            if (res.image_info) {
                setTextSize(Math.round(res.image_info.width / 20));
            }
        } catch (err) {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !jobId) return;

        setLogoFile(file);

        // Preview
        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);

        try {
            const res = await api.uploadWatermarkLogo(jobId, file);
            setLogoJobId(res.logo_id);
        } catch (err) {
            setError('Failed to upload logo');
        }
    };

    const handleApply = async () => {
        if (!jobId) return;

        setProcessing(true);
        try {
            await api.applyWatermark(jobId, activeTab, {
                text: watermarkText,
                textSize: textSize * 2, // Match visual scaling
                textColor,
                logoJobId: logoJobId || undefined,
                logoScale,
                opacity,
                rotation,
                position,
                quality: 95
            });

            // Ready to download
            setDownloadUrl(api.getWatermarkedImageURL(jobId));
        } catch (err) {
            setError('Failed to apply watermark');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
                        <Stamp className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Watermark
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Protect your creative work. Add professional text or logo watermarks in seconds.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {!jobId ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
                        <Stamp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <label className="cursor-pointer text-blue-600 font-semibold text-lg hover:underline">
                            Upload Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="text-gray-500 mt-2">to add watermark</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Preview Area */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 overflow-hidden flex items-center justify-center bg-gray-900 min-h-[500px]">
                                <canvas ref={canvasRef} className="max-w-full max-h-[600px] object-contain" />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                {/* Tabs */}
                                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                    <button
                                        onClick={() => setActiveTab('text')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium transition-all ${activeTab === 'text' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Type className="w-4 h-4" /> Text
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('logo')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium transition-all ${activeTab === 'logo' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Upload className="w-4 h-4" /> Logo
                                    </button>
                                </div>

                                {/* Text Controls */}
                                {activeTab === 'text' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                                            <input
                                                type="text"
                                                value={watermarkText}
                                                onChange={(e) => setWatermarkText(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="Enter watermark text"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                                <input
                                                    type="number"
                                                    value={textSize}
                                                    onChange={(e) => setTextSize(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                                <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1.5 bg-white shadow-sm">
                                                    <div className="relative">
                                                        <div
                                                            className="h-8 w-10 rounded border border-gray-200 cursor-pointer shadow-sm"
                                                            style={{ backgroundColor: textColor }}
                                                            onClick={() => document.getElementById('watermark-color-picker')?.click()}
                                                        />
                                                        <input
                                                            id="watermark-color-picker"
                                                            type="color"
                                                            value={textColor}
                                                            onChange={(e) => setTextColor(e.target.value)}
                                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={textColor}
                                                        onChange={(e) => setTextColor(e.target.value)}
                                                        className="text-sm text-gray-700 font-mono focus:outline-none w-full uppercase px-2 tracking-wide font-medium"
                                                        maxLength={7}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Logo Controls */}
                                {activeTab === 'logo' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Scale ({logoScale}%)
                                            </label>
                                            <input
                                                type="range"
                                                min="1" max="100"
                                                value={logoScale}
                                                onChange={(e) => setLogoScale(Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="border-t my-6"></div>

                                {/* Common Controls */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Opacity ({opacity}%)
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={opacity}
                                            onChange={(e) => setOpacity(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rotation ({rotation}°)
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="360"
                                            value={rotation}
                                            onChange={(e) => setRotation(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                        <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                                            {['top-left', 'top-center', 'top-right',
                                                'center-left', 'center', 'center-right',
                                                'bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                                                    <button
                                                        key={pos}
                                                        onClick={() => setPosition(pos)}
                                                        className={`w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-50 ${position === pos ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-400'
                                                            }`}
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t">
                                    {!downloadUrl ? (
                                        <button
                                            onClick={handleApply}
                                            disabled={processing || (activeTab === 'logo' && !logoJobId)}
                                            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Apply Watermark'}
                                        </button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <a
                                                href={downloadUrl}
                                                className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700"
                                            >
                                                <Download className="w-4 h-4" /> Download
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setFile(null);
                                                    setJobId(null);
                                                    setDownloadUrl(null);
                                                }}
                                                className="bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200"
                                            >
                                                Start Over
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
