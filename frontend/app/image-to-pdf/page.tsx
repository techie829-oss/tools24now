'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { jsPDF } from 'jspdf';
import { FileText, Image as ImageIcon, Upload, X, FileCheck, ArrowRight, GripVertical } from 'lucide-react';

interface ImageFile {
    id: string;
    file: File;
    preview: string;
}

// Sortable Image Component
function SortableImage({ image, onRemove }: { image: ImageFile, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group bg-white p-2 rounded-lg shadow-sm border border-gray-200 aspect-[3/4] flex flex-col"
        >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Drag Handle Overlay */}
            <div
                {...attributes}
                {...listeners}
                className="flex-1 cursor-move overflow-hidden rounded-md relative"
            >
                <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center">
                    <GripVertical className="text-white opacity-0 group-hover:opacity-70 drop-shadow-md" />
                </div>
            </div>

            <div className="mt-2 px-1">
                <p className="text-xs text-center text-gray-500 truncate">{image.file.name}</p>
            </div>
        </div>
    );
}

export default function ImageToPdfPage() {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDrop = (acceptedFiles: File[]) => {
        const newImages = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeImage = (id: string) => {
        setImages(prev => {
            const newImages = prev.filter(img => img.id !== id);
            // Revoke object URL to avoid memory leaks
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return newImages;
        });
    };

    const convertToPdf = async () => {
        if (images.length === 0) return;
        setProcessing(true);
        setProgress(0);

        // Slight delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const doc = new jsPDF();

            for (let i = 0; i < images.length; i++) {
                if (i > 0) doc.addPage();

                const image = images[i];
                const imgProps = await getImageProperties(image.preview);

                // Calc dimensions to fit A4 (210 x 297 mm)
                const pageWidth = 210;
                const pageHeight = 297;
                const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
                const w = imgProps.width * ratio;
                const h = imgProps.height * ratio;
                const x = (pageWidth - w) / 2;
                const y = (pageHeight - h) / 2;

                doc.addImage(image.preview, 'JPEG', x, y, w, h);
                setProgress(Math.round(((i + 1) / images.length) * 100));
            }

            doc.save('converted_images.pdf');
        } catch (err) {
            console.error('PDF Generation failed', err);
            alert('Failed to generate PDF');
        } finally {
            setProcessing(false);
            setProgress(0);
        }
    };

    const getImageProperties = (url: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.src = url;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 text-blue-600">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Image to PDF Converter</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Combine multiple images into a single high-quality PDF. Rearrange pages easily.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Main Action Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Upload Zone & Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div
                            {...getRootProps()}
                            className={`bg-white border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-1">Add Images</h3>
                            <p className="text-sm text-gray-500">Drag & drop or Click</p>
                            <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP supported</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <FileCheck className="w-4 h-4 mr-2 text-green-500" />
                                Conversion Settings
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                                    <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option>A4 (Standard)</option>
                                        <option>Letter</option>
                                        <option>Fit to Image</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                                    <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option>Auto</option>
                                        <option>Portrait</option>
                                        <option>Landscape</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={convertToPdf}
                                        disabled={images.length === 0 || processing}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center"
                                    >
                                        {processing ? 'Processing...' : (
                                            <>Convert to PDF <ArrowRight className="w-4 h-4 ml-2" /></>
                                        )}
                                    </button>
                                    {processing && (
                                        <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview & Reorder Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 min-h-[500px]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {images.length > 0 ? `${images.length} Images Selected` : 'No Images Selected'}
                                </h2>
                                {images.length > 0 && (
                                    <button
                                        onClick={() => setImages([])}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {images.length === 0 ? (
                                <div className="h-96 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                                    <p>Preview area is empty</p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext items={images} strategy={horizontalListSortingStrategy}>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {images.map((img) => (
                                                <SortableImage key={img.id} image={img} onRemove={removeImage} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
