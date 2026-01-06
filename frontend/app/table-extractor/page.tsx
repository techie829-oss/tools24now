'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Download, Loader2, Table as TableIcon, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ExtractedTable {
    page: number;
    table_index: number;
    rows: string[][];
}

export default function TableExtractor() {
    const [file, setFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [tables, setTables] = useState<ExtractedTable[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [flavor, setFlavor] = useState<'lattice' | 'stream'>('lattice');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile?.type === 'application/pdf') {
            setFile(selectedFile);
            setTables([]);
            setError(null);
            // Default to lattice, but user can re-extract
            extractTables(selectedFile, 'lattice');
        } else {
            setError('Please upload a valid PDF file.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const extractTables = async (pdfFile: File, method: 'lattice' | 'stream') => {
        setIsExtracting(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('flavor', method);

        try {
            const response = await fetch(`${API_BASE_URL}/extract-tables`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to extract tables');
            }

            const data = await response.json();
            setTables(data.tables);
            if (data.tables.length === 0) {
                setError('No tables detected using this method. Try switching extraction method.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleMethodChange = (newFlavor: 'lattice' | 'stream') => {
        setFlavor(newFlavor);
        if (file) {
            extractTables(file, newFlavor);
        }
    };

    const downloadTables = async (format: 'csv' | 'xlsx') => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);
        formData.append('flavor', flavor);

        try {
            const response = await fetch(`${API_BASE_URL}/download-tables`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ detail: 'Download failed' }));
                throw new Error(err.detail || 'Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `extracted_tables.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to download file.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        PDF Table Extractor
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Extract tabular data from PDFs and convert to Excel or CSV.
                    </p>
                </div>

                {/* Strategy Selector */}
                {file && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
                            <button
                                onClick={() => handleMethodChange('lattice')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${flavor === 'lattice'
                                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Lattice (Bordered Tables)
                            </button>
                            <button
                                onClick={() => handleMethodChange('stream')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${flavor === 'stream'
                                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Stream (Whitespace Tables)
                            </button>
                        </div>
                    </div>
                )}

                {/* Upload Area */}
                <div
                    {...getRootProps()}
                    className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            {isExtracting ? (
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            ) : (
                                <TableIcon className="w-10 h-10 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-700">
                                {isDragActive ? 'Drop PDF here' : 'Drag & drop a PDF, or click to select'}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Automatically detects and extracts tables
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Results Section */}
                {tables.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Download Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                {tables.length} {tables.length === 1 ? 'Table' : 'Tables'} Found
                            </h3>
                            <div className="flex gap-3 mt-4 sm:mt-0">
                                <button
                                    onClick={() => downloadTables('csv')}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => downloadTables('xlsx')}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Excel
                                </button>
                            </div>
                        </div>

                        {/* Tables Preview */}
                        <div className="space-y-8">
                            {tables.map((table, tIdx) => (
                                <div key={`${table.page}-${table.table_index}`} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                        <span className="font-medium text-gray-700 text-sm uppercase tracking-wide">
                                            Page {table.page} • Table {table.table_index}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {table.rows.map((row, rIdx) => (
                                                    <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-50' : 'hover:bg-gray-50 transition-colors'}>
                                                        {row.map((cell, cIdx) => {
                                                            const CellTag = rIdx === 0 ? 'th' : 'td';
                                                            return (
                                                                <CellTag
                                                                    key={cIdx}
                                                                    className={`px-4 py-3 text-sm text-gray-700 border-r border-gray-100 last:border-r-0 ${rIdx === 0 ? 'font-bold text-gray-900 text-left' : ''
                                                                        }`}
                                                                >
                                                                    {cell}
                                                                </CellTag>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
