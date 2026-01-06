'use client';

import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api';
import { FolderSync, Zap, GripVertical, X, FileText, Download } from 'lucide-react';

interface Page {
    id: string;
    number: number;
}

function SortablePage({ page, onRemove, index }: { page: Page; onRemove: () => void; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border-2 border-gray-300 rounded-lg p-4 flex items-center gap-4 hover:border-blue-500 transition-colors">
            <div {...attributes} {...listeners} className="cursor-move">
                <GripVertical className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-2">
                    #{index + 1}
                </span>
                <span className="font-medium text-gray-900">Page {page.number}</span>
            </div>
            <button onClick={onRemove} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Remove page">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

export default function OrganizePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

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
        if (droppedFile && droppedFile.type === 'application/pdf') {
            handleUpload(droppedFile);
        }
    };

    const handleUpload = async (selectedFile: File) => {
        setFile(selectedFile);
        setUploading(true);
        setError(null);

        try {
            const response = await api.createOrganizePdfJob(selectedFile);
            setJobId(response.job_id);

            const pagesList: Page[] = [];
            const totalPages = (response as any).total_pages || 0;
            for (let i = 1; i <= totalPages; i++) {
                pagesList.push({ id: `page-${i}`, number: i });
            }
            setPages(pagesList);
            setUploading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removePage = (id: string) => {
        setPages(pages.filter(p => p.id !== id));
    };

    const handleOrganize = async () => {
        if (!jobId) return;

        setProcessing(true);
        setError(null);

        try {
            const pageOrder = pages.map(p => p.number - 1);
            await api.processOrganizePdf(jobId, pageOrder);

            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getOrganizeJobStatus(jobId);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        setResult(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(status.error || 'Organization failed');
                        setProcessing(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to check status');
                    setProcessing(false);
                }
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Processing failed');
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPages([]);
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
                        <FolderSync className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Organize PDF
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Reorder, remove, and manage PDF pages with drag-and-drop simplicity.
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
                            <h3 className="font-semibold text-gray-900 mb-2">Drag & Drop</h3>
                            <p className="text-sm text-gray-600">Easily reorder pages</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <X className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Remove Pages</h3>
                            <p className="text-sm text-gray-600">Delete unwanted pages</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
                            <p className="text-sm text-gray-600">Instant reorganization</p>
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
                        className={`bg-white rounded-xl border-2 border-dashed p-16 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                    >
                        <div className="space-y-6">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                            <div>
                                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-semibold hover:text-blue-700 text-lg">
                                    Click to upload
                                </label>
                                <span className="text-gray-600 text-lg"> or drag and drop</span>
                                <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
                            </div>
                            <p className="text-sm text-gray-500">PDF files only • Max 50MB</p>
                            {uploading && <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>}
                        </div>
                    </div>
                )}

                {pages.length > 0 && !processing && !result && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Organize Pages ({pages.length})</h2>
                        <p className="text-gray-600 mb-6">Drag pages to reorder or click X to remove</p>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3 mb-8">
                                    {pages.map((page, index) => (
                                        <SortablePage key={page.id} page={page} index={index} onRemove={() => removePage(page.id)} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <button
                            onClick={handleOrganize}
                            disabled={pages.length === 0}
                            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-lg"
                        >
                            Save Organized PDF
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
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Organizing PDF...</h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                    </div>
                )}

                {result && result.status === 'completed' && jobId && (
                    <div className="bg-white rounded-xl shadow-sm p-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-green-600">✓</span> PDF Organized!
                            </h2>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Organize Another
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
                            <p className="text-sm text-gray-600 mb-1">Pages in New PDF</p>
                            <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
                        </div>

                        <a
                            href={api.getOrganizePdfDownloadURL(jobId)}
                            download
                            className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Download Organized PDF
                        </a>
                    </div>
                )}
            </div>

            {/* How to Use */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Use Organize PDF</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Upload PDF</h3>
                            <p className="text-gray-600 text-sm">Select your PDF to organize</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Reorder & Remove</h3>
                            <p className="text-gray-600 text-sm">Drag to reorder, click X to remove pages</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Download</h3>
                            <p className="text-gray-600 text-sm">Get your organized PDF</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
