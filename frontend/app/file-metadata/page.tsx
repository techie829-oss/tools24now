'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileText, Image as ImageIcon, Save, Download, Upload, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import exifr from 'exifr';
// @ts-ignore
import piexif from 'piexifjs';

export default function FileMetadataPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
    const [metadata, setMetadata] = useState<any>({});
    const [originalMetadata, setOriginalMetadata] = useState<any>({});
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // --- File Handling ---

    const processFile = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setMessage(null);
        setDownloadUrl(null);
        setProcessing(true);

        try {
            if (selectedFile.type === 'application/pdf') {
                setFileType('pdf');
                await loadPdfMetadata(selectedFile);
            } else if (selectedFile.type.startsWith('image/')) {
                setFileType('image');
                await loadImageMetadata(selectedFile);
            } else {
                throw new Error('Unsupported file type. Please upload a PDF or Image (JPG, PNG).');
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to read file' });
            setFile(null);
            setFileType(null);
        } finally {
            setProcessing(false);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0]);
        }
    };

    // --- PDF Metadata Logic ---

    const loadPdfMetadata = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        const info = {
            title: pdfDoc.getTitle() || '',
            author: pdfDoc.getAuthor() || '',
            subject: pdfDoc.getSubject() || '',
            keywords: pdfDoc.getKeywords() || '',
            creator: pdfDoc.getCreator() || '',
            producer: pdfDoc.getProducer() || '',
            creationDate: pdfDoc.getCreationDate()?.toISOString().split('T')[0] || '',
            modificationDate: pdfDoc.getModificationDate()?.toISOString().split('T')[0] || '',
            pageCount: pdfDoc.getPageCount().toString(),
        };

        setMetadata(info);
        setOriginalMetadata(info);
    };

    const savePdfMetadata = async () => {
        if (!file) return;
        setProcessing(true);
        setMessage(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            pdfDoc.setTitle(metadata.title);
            pdfDoc.setAuthor(metadata.author);
            pdfDoc.setSubject(metadata.subject);
            pdfDoc.setKeywords(metadata.keywords.split(',').map((k: string) => k.trim())); // pdf-lib expects array? actually string usually works or array
            // pdf-lib setKeywords takes string[]

            // Note: date modification is complex to parse back from UI string, skipping for now or just setting to Now if requested
            pdfDoc.setCreator(metadata.creator);
            pdfDoc.setProducer(metadata.producer);

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setMessage({ type: 'success', text: 'Metadata saved successfully! Download your updated file.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to save PDF metadata' });
        } finally {
            setProcessing(false);
        }
    };

    // --- Image Metadata Logic ---

    const loadImageMetadata = async (file: File) => {
        // exifr parses all
        const exifData = await exifr.parse(file) || {};

        // Flatten simplistic view for editing common fields if JPEG
        // For now, we mainly SHOW metadata. Editing is restricted to JPEG via piexifjs

        const displayData = {
            make: exifData.Make || '',
            model: exifData.Model || '',
            software: exifData.Software || '',
            artist: exifData.Artist || '',
            copyright: exifData.Copyright || '',
            dateTime: exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal).toLocaleString() : '',
            // Read-only technicals
            width: exifData.ExifImageWidth || '',
            height: exifData.ExifImageHeight || '',
            exposureTime: exifData.ExposureTime ? `1/${Math.round(1 / exifData.ExposureTime)}` : '',
            fNumber: exifData.FNumber ? `f/${exifData.FNumber}` : '',
            iso: exifData.ISO ? `ISO ${exifData.ISO}` : '',
        };

        setMetadata(displayData);
        setOriginalMetadata(displayData);
    };

    const saveImageMetadata = async () => {
        if (!file || file.type !== 'image/jpeg') {
            setMessage({ type: 'error', text: 'Editing is currently only supported for JPEG images.' });
            return;
        }

        setProcessing(true);

        try {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const result = e.target?.result as string;
                    const exifObj = piexif.load(result);

                    // Update fields
                    if (metadata.artist) exifObj["0th"][piexif.ImageIFD.Artist] = metadata.artist;
                    if (metadata.copyright) exifObj["0th"][piexif.ImageIFD.Copyright] = metadata.copyright;
                    if (metadata.make) exifObj["0th"][piexif.ImageIFD.Make] = metadata.make;
                    if (metadata.model) exifObj["0th"][piexif.ImageIFD.Model] = metadata.model;
                    if (metadata.software) exifObj["0th"][piexif.ImageIFD.Software] = metadata.software;

                    const exifStr = piexif.dump(exifObj);
                    const inserted = piexif.insert(exifStr, result);

                    // Convert back to Blob
                    const byteString = atob(inserted.split(',')[1]);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: 'image/jpeg' });
                    const url = URL.createObjectURL(blob);

                    setDownloadUrl(url);
                    setMessage({ type: 'success', text: 'Image metadata saved!' });
                } catch (err) {
                    setMessage({ type: 'error', text: 'Error modifying JPEG EXIF data.' });
                    console.error(err);
                } finally {
                    setProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setProcessing(false);
            setMessage({ type: 'error', text: 'Failed to process image.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">File Metadata Editor</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        View and edit metadata for PDF and Image files. Runs entirely in your browser.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Upload Area */}
                {!file && (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        className={`bg-white rounded-xl border-2 border-dashed p-12 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-6">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload File</h2>
                        <p className="text-gray-500 mb-6">Drag & drop or click to select</p>
                        <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4 mr-2" />
                            Select File
                            <input type="file" onChange={onFileInput} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" />
                        </label>
                        <p className="text-xs text-gray-400 mt-4">Supports PDF, JPG, PNG* (*view only)</p>
                    </div>
                )}

                {/* Editor Area */}
                {file && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Toolbar */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center">
                                {fileType === 'pdf' ? <FileText className="w-5 h-5 text-red-500 mr-3" /> : <ImageIcon className="w-5 h-5 text-blue-500 mr-3" />}
                                <div>
                                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB • {fileType?.toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => { setFile(null); setDownloadUrl(null); }} className="text-sm text-gray-500 hover:text-gray-700">
                                Upload New
                            </button>
                        </div>

                        <div className="p-6">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                    {message.text}
                                </div>
                            )}

                            {/* Tables */}
                            {fileType === 'pdf' ? (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">PDF Properties</h3>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={metadata.title || ''}
                                                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                            <input
                                                type="text"
                                                value={metadata.author || ''}
                                                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                value={metadata.subject || ''}
                                                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                                            <input
                                                type="text"
                                                value={metadata.keywords || ''}
                                                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Comma separated"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                                            <input
                                                type="text"
                                                value={metadata.creator || ''}
                                                onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Producer</label>
                                            <input
                                                type="text"
                                                value={metadata.producer || ''}
                                                onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 bg-gray-50 p-4 rounded text-xs text-gray-500 grid md:grid-cols-2 gap-2">
                                        <p><strong>Created:</strong> {metadata.creationDate}</p>
                                        <p><strong>Modified:</strong> {metadata.modificationDate}</p>
                                        <p><strong>Pages:</strong> {metadata.pageCount}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Image Data (EXIF)</h3>

                                    {file.type !== 'image/jpeg' && (
                                        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded text-sm flex items-center">
                                            <Info className="w-4 h-4 mr-2" />
                                            Editing is only supported for JPEG images. Other formats are read-only.
                                        </div>
                                    )}

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Artist / Creator</label>
                                            <input
                                                type="text"
                                                value={metadata.artist || ''}
                                                onChange={(e) => setMetadata({ ...metadata, artist: e.target.value })}
                                                disabled={file.type !== 'image/jpeg'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
                                            <input
                                                type="text"
                                                value={metadata.copyright || ''}
                                                onChange={(e) => setMetadata({ ...metadata, copyright: e.target.value })}
                                                disabled={file.type !== 'image/jpeg'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Camera Make</label>
                                            <input
                                                type="text"
                                                value={metadata.make || ''}
                                                onChange={(e) => setMetadata({ ...metadata, make: e.target.value })}
                                                disabled={file.type !== 'image/jpeg'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Camera Model</label>
                                            <input
                                                type="text"
                                                value={metadata.model || ''}
                                                onChange={(e) => setMetadata({ ...metadata, model: e.target.value })}
                                                disabled={file.type !== 'image/jpeg'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Software</label>
                                            <input
                                                type="text"
                                                value={metadata.software || ''}
                                                onChange={(e) => setMetadata({ ...metadata, software: e.target.value })}
                                                disabled={file.type !== 'image/jpeg'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded text-sm text-gray-600">
                                        <div>
                                            <span className="block text-xs text-gray-400 uppercase">Dimensions</span>
                                            {metadata.width && metadata.height ? `${metadata.width} x ${metadata.height}` : 'N/A'}
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 uppercase">Date Taken</span>
                                            {metadata.dateTime || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 uppercase">ISO</span>
                                            {metadata.iso || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 uppercase">Aperture</span>
                                            {metadata.fNumber || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end">
                                {downloadUrl ? (
                                    <a
                                        href={downloadUrl}
                                        download={`edited_${file.name}`}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Download File
                                    </a>
                                ) : (
                                    <button
                                        onClick={fileType === 'pdf' ? savePdfMetadata : saveImageMetadata}
                                        disabled={processing || (fileType === 'image' && file.type !== 'image/jpeg')}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Processing...' : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                Apply & Save Metadata
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
