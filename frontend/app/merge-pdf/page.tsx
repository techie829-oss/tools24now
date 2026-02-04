'use client';

import { useState, useCallback } from 'react';
import { DndContext, closestCenter, MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api';
import { Link2, Zap, GripVertical, X, FileText, Download } from 'lucide-react';

interface FileWithMeta {
    id: string;
    file: File;
    filename: string;
    size: number;
}

function SortableFile({ file, onRemove, index }: { file: FileWithMeta; onRemove: () => void; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border-2 border-gray-300 rounded-lg p-4 flex items-center gap-4 hover:border-blue-500 transition-colors">
            {/* Added touch-none to prevent browser scrolling on handle touch */}
            <div {...attributes} {...listeners} className="cursor-move touch-none">
                <GripVertical className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        #{index + 1}
                    </span>
                    <p className="font-medium text-gray-900">{file.filename}</p>
                </div>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
            </div>
            <button onClick={onRemove} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Remove file">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

export default function MergePdfPage() {
    const [files, setFiles] = useState<FileWithMeta[]>([]);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 10 pixels before activating.
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            // Press delay of 200ms, with tolerance of 5px of movement.
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        const fileArray = Array.from(selectedFiles);
        const validFiles: FileWithMeta[] = [];

        for (const file of fileArray) {
            if (file.type !== 'application/pdf') {
                setError(`${file.name} is not a PDF file`);
                continue;
            }
            validFiles.push({
                id: `file-${Date.now()}-${Math.random()}`,
                file,
                filename: file.name,
                size: file.size
            });
        }

        setFiles(prev => [...prev, ...validFiles]);
        setError(null);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeFile = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError('At least 2 PDF files required');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const fileObjects = files.map(f => f.file);
            const response = await api.createMergePdfJob(fileObjects);
            setJobId(response.job_id);
            setUploading(false);

            setProcessing(true);
            const fileOrder = files.map((_, index) => index);
            await api.processMergePdf(response.job_id, fileOrder);

            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getMergeJobStatus(response.job_id);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Merging failed');
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
        setFiles([]);
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
                        <Link2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Merge PDF
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Combine multiple PDF files into a single document with ease.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <GripVertical className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Custom Order</h3>
                            <p className="text-sm text-gray-600">Drag to change merge order</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Merging</h3>
                            <p className="text-sm text-gray-600">Combine files in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Multiple Files</h3>
                            <p className="text-sm text-gray-600">Merge up to 10 PDFs</p>
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
                                    <input id="file-upload" type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
                                </div>
                                <p className="text-sm text-gray-500">Upload 2-10 PDF files • Max 50MB per file</p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900">Files to Merge ({files.length})</h2>
                                    <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                        Clear All
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-6">Drag files to change merge order</p>

                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3 mb-8">
                                            {files.map((file, index) => (
                                                <SortableFile key={file.id} file={file} index={index} onRemove={() => removeFile(file.id)} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                <button
                                    onClick={handleMerge}
                                    disabled={uploading || files.length < 2}
                                    className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-lg"
                                >
                                    {uploading ? 'Uploading...' : `Merge ${files.length} PDFs`}
                                </button>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {processing && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 ">Merging PDFs...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> PDFs Merged!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Merge Another
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
                            <p className="text-sm text-gray-600 mb-1">Files Combined</p>
                            <p className="text-3xl font-bold text-gray-900">{files.length}</p>
                        </div>

                        <a
                            href={api.getMergedPdfDownloadURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Merged PDF
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Merge PDF</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload Files</h3>
                            <p className="text-gray-600 text-sm">Select 2 or more PDF files to merge</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Arrange Order</h3>
                            <p className="text-gray-600 text-sm">Drag files to set the merge order</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get your combined PDF file</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
