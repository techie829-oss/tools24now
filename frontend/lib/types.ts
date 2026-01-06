// TypeScript types for the Tools24Now API

export interface Job {
    job_id: string;
    filename: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
    progress: {
        percent: number;
        processed_pages?: number;
        total_pages?: number;
    };
    error?: string | null;
    created_at: string;
    expires_at: string;
}

export interface JobResults {
    job_id: string;
    status: string;
    total_pages: number;
    images: Array<{
        page: number;
        url: string;
    }>;
    zip_url: string;
}

export interface CreateJobResponse {
    job_id: string;
    filename: string;
    status: string;
    progress: {
        percent: number;
        total_pages?: number;
        processed_pages?: number;
    };
    created_at: string;
    expires_at: string;
}

export interface PagePreview {
    pageNumber: number;
    thumbnailUrl: string;
}

export interface OrganizeJobRequest {
    page_order: number[];
}

export interface FileItem {
    id: string;
    filename: string;
    pages: number;
    size: number;
}

export interface MergeJobResponse {
    job_id: string;
    filename: string;
    status: string;
    progress: {
        percent: number;
        total_pages: number;
    };
    created_at: string;
    expires_at: string;
}

export interface MergeJobRequest {
    file_order: number[];
}
