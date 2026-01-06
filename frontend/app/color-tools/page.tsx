'use client';

import React, { useState, useRef } from 'react';
import { Upload, Copy, Palette, Check } from 'lucide-react';

type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'monochromatic';

export default function ColorTools() {
    const [baseColor, setBaseColor] = useState('#3B82F6');
    const [palette, setPalette] = useState<string[]>([]);
    const [paletteType, setPaletteType] = useState<PaletteType>('complementary');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedColors, setExtractedColors] = useState<string[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Convert HEX to HSL
    const hexToHSL = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return [h * 360, s * 100, l * 100];
    };

    // Convert HSL to HEX
    const hslToHex = (h: number, s: number, l: number): string => {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        const toHex = (n: number) => {
            const hex = Math.round((n + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    };

    // Generate palette based on type
    const generatePalette = () => {
        const [h, s, l] = hexToHSL(baseColor);
        let colors: string[] = [baseColor];

        switch (paletteType) {
            case 'complementary':
                colors.push(hslToHex((h + 180) % 360, s, l));
                colors.push(hslToHex(h, s, Math.max(l - 20, 0)));
                colors.push(hslToHex((h + 180) % 360, s, Math.max(l - 20, 0)));
                break;
            case 'analogous':
                colors.push(hslToHex((h + 30) % 360, s, l));
                colors.push(hslToHex((h - 30 + 360) % 360, s, l));
                colors.push(hslToHex((h + 60) % 360, s, l));
                colors.push(hslToHex((h - 60 + 360) % 360, s, l));
                break;
            case 'triadic':
                colors.push(hslToHex((h + 120) % 360, s, l));
                colors.push(hslToHex((h + 240) % 360, s, l));
                break;
            case 'monochromatic':
                for (let i = 1; i <= 4; i++) {
                    colors.push(hslToHex(h, s, Math.max(l - i * 15, 10)));
                }
                break;
        }

        setPalette(colors);
    };

    React.useEffect(() => {
        generatePalette();
    }, [baseColor, paletteType]);

    // Extract colors from image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Sample colors from various points
                const colors: string[] = [];
                const step = Math.floor(Math.min(img.width, img.height) / 10);

                for (let x = step; x < img.width; x += step) {
                    for (let y = step; y < img.height; y += step) {
                        const pixel = ctx.getImageData(x, y, 1, 1).data;
                        const hex = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
                        if (!colors.includes(hex)) colors.push(hex);
                    }
                }

                setExtractedColors(colors.slice(0, 12));
                setImagePreview(event.target?.result as string);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleCopy = async (color: string) => {
        await navigator.clipboard.writeText(color);
        setCopied(color);
        setTimeout(() => setCopied(null), 2000);
    };

    const exportCSS = () => {
        const css = palette.map((color, i) => `--color-${i + 1}: ${color};`).join('\n');
        const blob = new Blob([`:root {\n  ${css}\n}`], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'palette.css';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                        Color Tools & Palette Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Generate harmonious color palettes and extract colors from images.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Palette Generator */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Palette Generator
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Base Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={baseColor}
                                    onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
                                    className="h-14 w-20 rounded-lg cursor-pointer border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={baseColor}
                                    onChange={(e) => {
                                        if (/^#[0-9A-F]{0,6}$/i.test(e.target.value)) {
                                            setBaseColor(e.target.value.toUpperCase());
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Palette Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['complementary', 'analogous', 'triadic', 'monochromatic'] as PaletteType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setPaletteType(type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${paletteType === type
                                                ? 'bg-pink-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {palette.map((color, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="flex-1 font-mono text-sm font-medium">{color}</span>
                                    <button
                                        onClick={() => handleCopy(color)}
                                        className={`p-2 rounded-lg transition-colors ${copied === color
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {copied === color ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={exportCSS}
                            className="w-full mt-4 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                        >
                            Export as CSS
                        </button>
                    </div>

                    {/* Image Color Extractor */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Extract from Image
                        </h3>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all mb-4"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Uploaded" className="max-h-48 mx-auto rounded-lg" />
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-600 font-medium">Click to upload image</p>
                                    <p className="text-sm text-gray-400 mt-1">Extract dominant colors</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        {extractedColors.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Extracted Colors:</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {extractedColors.map((color, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleCopy(color)}
                                            className="aspect-square rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </div>
            </div>
        </div>
    );
}
