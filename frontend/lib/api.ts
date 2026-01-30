// API client for Tools24Now backend

import type { Job, JobResults, CreateJobResponse, MergeJobResponse, FileItem } from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1';

class APIClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Upload PDF and create conversion job
     */
    async createPdfToImagesJob(file: File): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/pdf-to-images/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get job status (for polling)
     */
    async getJobStatus(jobId: string): Promise<Job> {
        const response = await fetch(`${this.baseURL}/pdf-to-images/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get job results (after completion)
     */
    async getJobResults(jobId: string): Promise<JobResults> {
        const response = await fetch(`${this.baseURL}/pdf-to-images/jobs/${jobId}/results`);

        if (!response.ok) {
            throw new Error(`Failed to get job results: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get download URL for a specific file
     */
    getDownloadURL(jobId: string, filename: string): string {
        return `${this.baseURL}/pdf-to-images/jobs/${jobId}/assets/${filename}`;
    }

    /**
     * Get ZIP download URL
     */
    getZipDownloadURL(jobId: string): string {
        return `${this.baseURL}/pdf-to-images/jobs/${jobId}/assets/download`;
    }

    // ========== Organize PDF Methods ==========

    /**
     * Upload PDF for organizing
     */
    async createOrganizePdfJob(file: File): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/organize-pdf/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Process PDF with user-specified page order
     */
    async processOrganizePdf(jobId: string, pageOrder: number[]): Promise<void> {
        const response = await fetch(`${this.baseURL}/organize-pdf/jobs/${jobId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page_order: pageOrder }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get organize job status
     */
    async getOrganizeJobStatus(jobId: string): Promise<Job> {
        const response = await fetch(`${this.baseURL}/organize-pdf/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get organize PDF download URL
     */
    getOrganizePdfDownloadURL(jobId: string): string {
        return `${this.baseURL}/organize-pdf/jobs/${jobId}/download`;
    }

    /**
     * Get thumbnail URL for a specific page
     */
    getThumbnailURL(jobId: string, pageNumber: number): string {
        const filename = `thumb_${String(pageNumber).padStart(4, '0')}.png`;
        return `${this.baseURL}/organize-pdf/jobs/${jobId}/thumbnails/${filename}`;
    }

    // ========== Merge PDF Methods ==========

    /**
     * Upload multiple PDFs for merging
     */
    async createMergePdfJob(files: File[]): Promise<MergeJobResponse> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${this.baseURL}/merge-pdf/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Process PDF merge with file order
     */
    async processMergePdf(jobId: string, fileOrder: number[]): Promise<void> {
        const response = await fetch(`${this.baseURL}/merge-pdf/jobs/${jobId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_order: fileOrder }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get merge job status
     */
    async getMergeJobStatus(jobId: string): Promise<Job> {
        const response = await fetch(`${this.baseURL}/merge-pdf/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get merged PDF download URL
     */
    getMergedPdfDownloadURL(jobId: string): string {
        return `${this.baseURL}/merge-pdf/jobs/${jobId}/download`;
    }

    /**
     * Get file list for merge job
     */
    async getMergeJobFiles(jobId: string): Promise<FileItem[]> {
        const response = await fetch(`${this.baseURL}/merge-pdf/jobs/${jobId}/files`);

        if (!response.ok) {
            throw new Error(`Failed to get files: ${response.status}`);
        }

        const data = await response.json();
        return data.files || [];
    }

    // ========== Compress PDF Methods ==========

    /**
     * Upload PDF for compression with quality setting
     */
    async createCompressPdfJob(
        file: File,
        quality: string,
        compressByPercent?: number,
        maxFileSizeMb?: number
    ): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('quality', quality);

        if (compressByPercent) {
            formData.append('compress_by_percent', compressByPercent.toString());
        }
        if (maxFileSizeMb) {
            formData.append('max_file_size_mb', maxFileSizeMb.toString());
        }

        const response = await fetch(`${this.baseURL}/compress-pdf/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Process PDF compression
     */
    async processCompressPdf(jobId: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/compress-pdf/jobs/${jobId}/process`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get compress job status with compression info
     */
    async getCompressJobStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/compress-pdf/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get compressed PDF download URL
     */
    getCompressedPdfDownloadURL(jobId: string): string {
        return `${this.baseURL}/compress-pdf/jobs/${jobId}/download`;
    }

    // ========== OCR PDF Methods ==========

    /**
     * Upload PDF for OCR text extraction
     */
    async createOcrPdfJob(file: File, language: string = 'eng', mode: 'standard' | 'enhanced' = 'standard'): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        formData.append('mode', mode);

        const response = await fetch(`${this.baseURL}/ocr-pdf/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Start OCR processing
     */
    async processOcrPdf(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/ocr-pdf/jobs/${jobId}/process`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get OCR job status
     */
    async getOcrJobStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/ocr-pdf/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get OCR result download URL
     */
    getOcrResultDownloadURL(jobId: string, format: 'txt' | 'json'): string {
        return `${this.baseURL}/ocr-pdf/jobs/${jobId}/download/${format}`;
    }

    // ========== Deskew PDF Methods ==========

    /**
     * Upload PDF for deskewing (straightening)
     */
    async createDeskewPdfJob(file: File): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/deskew-pdf/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Start deskew processing
     */
    async processDeskewPdf(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/deskew-pdf/jobs/${jobId}/process`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get deskew job status
     */
    async getDeskewJobStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/deskew-pdf/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get deskewed PDF download URL
     */
    getDeskewedPdfDownloadURL(jobId: string): string {
        return `${this.baseURL}/deskew-pdf/jobs/${jobId}/download`;
    }

    // ========== Scan Receipt Methods ==========

    /**
     * Scan a receipt for data extraction
     */
    async scanReceipt(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${this.baseURL}/scan-receipt`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Scan failed' }));
            throw new Error(error.detail || 'Scan failed');
        }
        return response.json();
    }

    // ========== DNS Lookup Methods ==========

    /**
     * Perform a DNS lookup for a given domain and record type
     */
    async dnsLookup(domain: string, recordType: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/dns-lookup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain, record_type: recordType }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Lookup failed' }));
            throw new Error(error.detail || 'Lookup failed');
        }
        return response.json();
    }

    // ========== SSL Checker Methods ==========

    /**
     * Check SSL certificate for a domain
     */
    async sslCheck(domain: string, port: number = 443): Promise<any> {
        const response = await fetch(`${this.baseURL}/ssl-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain, port }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'SSL Check failed' }));
            throw new Error(error.detail || 'SSL Check failed');
        }
        return response.json();
    }

    /**
     * Check HTTP Headers for a URL
     */
    async checkHeaders(url: string, user_agent?: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/http-headers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, user_agent }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Header Check failed' }));
            throw new Error(error.detail || 'Header Check failed');
        }
        return response.json();
    }

    // ========== Split PDF Methods ==========

    /**
     * Upload PDF for splitting
     */
    async createSplitPdfJob(file: File): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/split-pdf/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Process split with selected pages
     */
    async processSplitPdf(jobId: string, pages: number[]): Promise<void> {
        const response = await fetch(`${this.baseURL}/split-pdf/jobs/${jobId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pages }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get split job status
     */
    async getSplitJobStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/split-pdf/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get split PDF download URL
     */
    getSplitPdfDownloadURL(jobId: string): string {
        return `${this.baseURL}/split-pdf/jobs/${jobId}/download`;
    }

    /**
     * Get page thumbnail URL
     */
    getPageThumbnailURL(jobId: string, pageNum: number): string {
        return `${this.baseURL}/split-pdf/jobs/${jobId}/pages/${pageNum}/thumbnail`;
    }

    // ========== PDF to Word Methods ==========

    /**
     * Upload PDF for Word conversion
     */
    async createPdfToWordJob(file: File): Promise<CreateJobResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/pdf-to-word/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Process PDF to Word conversion
     */
    async processPdfToWord(jobId: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/pdf-to-word/jobs/${jobId}/process`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Processing failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get PDF to Word status
     */
    async getPdfToWordStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/pdf-to-word/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get Word download URL
     */
    getWordDownloadURL(jobId: string): string {
        return `${this.baseURL}/pdf-to-word/jobs/${jobId}/download`;
    }

    // ========== Image Converter Methods ==========

    /**
     * Upload image for conversion
     */
    async createImageConverterJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-converter/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Convert image to target format with advanced options
     */
    async convertImage(
        jobId: string,
        format: string,
        quality: number = 85,
        targetSizeKb?: number,
        maxWidth?: number,
        maxHeight?: number,
        preserveExif: boolean = true
    ): Promise<void> {
        const body: any = { format, quality, preserve_exif: preserveExif };
        if (targetSizeKb) body.target_size_kb = targetSizeKb;
        if (maxWidth) body.max_width = maxWidth;
        if (maxHeight) body.max_height = maxHeight;

        const response = await fetch(`${this.baseURL}/image-converter/jobs/${jobId}/convert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Conversion failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get image converter status
     */
    async getImageConverterStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-converter/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get converted image download URL
     */
    getConvertedImageURL(jobId: string): string {
        return `${this.baseURL}/image-converter/jobs/${jobId}/download`;
    }

    // ========== Image Compressor Methods ==========

    /**
     * Upload image for compression
     */
    async createImageCompressorJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-compressor/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Compress image with specified quality and advanced options
     */
    async compressImage(
        jobId: string,
        quality: number = 85,
        targetSizeKb?: number,
        maxWidth?: number,
        maxHeight?: number,
        outputFormat?: string,
        preset?: string
    ): Promise<void> {
        const body: any = { quality };
        if (targetSizeKb) body.target_size_kb = targetSizeKb;
        if (maxWidth) body.max_width = maxWidth;
        if (maxHeight) body.max_height = maxHeight;
        if (outputFormat) body.output_format = outputFormat;
        if (preset) body.preset = preset;

        const response = await fetch(`${this.baseURL}/image-compressor/jobs/${jobId}/compress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Compression failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get image compressor status
     */
    async getImageCompressorStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-compressor/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get compressed image download URL
     */
    getCompressedImageURL(jobId: string): string {
        return `${this.baseURL}/image-compressor/jobs/${jobId}/download`;
    }

    // ========== Image Resizer Methods ==========

    /**
     * Upload image for resizing
     */
    async createImageResizerJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-resizer/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Resize image with specified options
     */
    async resizeImage(
        jobId: string,
        width?: number,
        height?: number,
        scalePercent?: number,
        preset?: string,
        maintainAspect: boolean = true,
        resampling: string = 'lanczos',
        outputFormat?: string,
        quality: number = 85
    ): Promise<void> {
        const body: any = {
            maintain_aspect: maintainAspect,
            resampling,
            quality
        };
        if (width) body.width = width;
        if (height) body.height = height;
        if (scalePercent) body.scale_percent = scalePercent;
        if (preset) body.preset = preset;
        if (outputFormat) body.output_format = outputFormat;

        const response = await fetch(`${this.baseURL}/image-resizer/jobs/${jobId}/resize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Resize failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get image resizer status
     */
    async getImageResizerStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-resizer/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get resized image download URL
     */
    getResizedImageURL(jobId: string): string {
        return `${this.baseURL}/image-resizer/jobs/${jobId}/download`;
    }

    // ========== Image Cropper Methods ==========

    /**
     * Upload image for cropping
     */
    async createImageCropperJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-cropper/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Crop image with specified options
     */
    async cropImage(
        jobId: string,
        x: number = 0,
        y: number = 0,
        width?: number,
        height?: number,
        aspectRatio?: string,
        centerCrop: boolean = false,
        outputFormat?: string,
        quality: number = 85
    ): Promise<void> {
        const body: any = {
            x,
            y,
            center_crop: centerCrop,
            quality
        };
        if (width) body.width = width;
        if (height) body.height = height;
        if (aspectRatio) body.aspect_ratio = aspectRatio;
        if (outputFormat) body.output_format = outputFormat;

        const response = await fetch(`${this.baseURL}/image-cropper/jobs/${jobId}/crop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Crop failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get image cropper status
     */
    async getImageCropperStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-cropper/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get cropped image download URL
     */
    getCroppedImageURL(jobId: string): string {
        return `${this.baseURL}/image-cropper/jobs/${jobId}/download`;
    }

    // ========== Image Filters Methods ==========

    /**
     * Upload image for filters
     */
    async createImageFiltersJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-filters/jobs`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Apply filters to image
     */
    async applyImageFilters(
        jobId: string,
        brightness: number = 1.0,
        contrast: number = 1.0,
        saturation: number = 1.0,
        sharpness: number = 1.0,
        blur: number = 0,
        sharpen: boolean = false,
        edgeEnhance: boolean = false,
        grayscale: boolean = false,
        sepia: boolean = false,
        outputFormat?: string,
        quality: number = 95
    ): Promise<void> {
        const body = {
            brightness,
            contrast,
            saturation,
            sharpness,
            blur,
            sharpen,
            edge_enhance: edgeEnhance,
            grayscale,
            sepia,
            output_format: outputFormat,
            quality
        };

        const response = await fetch(`${this.baseURL}/image-filters/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Filter application failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
    }

    /**
     * Get image filters status
     */
    async getImageFiltersStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-filters/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get preview of filtered image (base64)
     */
    async getImageFiltersPreview(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-filters/jobs/${jobId}/preview`);

        if (!response.ok) {
            throw new Error(`Failed to get preview: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get filtered image download URL
     */
    getFilteredImageURL(jobId: string): string {
        return `${this.baseURL}/image-filters/jobs/${jobId}/download`;
    }

    // ==================== Image Rotate & Flip ====================

    /**
     * Create image rotate job
     */
    async createImageRotateJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-rotate/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Apply transformation to uploaded image
     */
    async applyImageRotateTransform(
        jobId: string,
        rotation: number,
        flipH: boolean,
        flipV: boolean,
        outputFormat?: string,
        quality: number = 95
    ): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-rotate/jobs/${jobId}/transform`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rotation,
                flip_h: flipH,
                flip_v: flipV,
                output_format: outputFormat,
                quality,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Transform failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get rotate job status
     */
    async getImageRotateStatus(jobId: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/image-rotate/jobs/${jobId}/status`);

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get rotated image download URL
     */
    getRotatedImageURL(jobId: string): string {
        return `${this.baseURL}/image-rotate/jobs/${jobId}/download`;
    }

    // Image Watermark
    async createImageWatermarkJob(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-watermark/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async uploadWatermarkLogo(jobId: string, file: File): Promise<{ logo_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/image-watermark/jobs/${jobId}/upload-logo`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Logo upload failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async applyWatermark(
        jobId: string,
        type: 'text' | 'logo',
        params: {
            text?: string;
            textSize?: number;
            textColor?: string;
            logoJobId?: string;
            logoScale?: number;
            opacity: number;
            rotation: number;
            position: string;
            outputFormat?: string;
            quality: number;
        }
    ): Promise<any> {
        // Map camelCase to snake_case for backend
        const body = {
            type,
            text: params.text,
            text_size: params.textSize,
            text_color: params.textColor,
            logo_job_id: params.logoJobId,
            logo_scale: params.logoScale,
            opacity: params.opacity,
            rotation: params.rotation,
            position: params.position,
            output_format: params.outputFormat,
            quality: params.quality
        };

        const response = await fetch(`${this.baseURL}/image-watermark/jobs/${jobId}/transform`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Transform failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    getWatermarkedImageURL(jobId: string): string {
        return `${this.baseURL}/image-watermark/jobs/${jobId}/download`;
    }
}

// Export singleton instance
export const api = new APIClient();
export const ApiService = api;
