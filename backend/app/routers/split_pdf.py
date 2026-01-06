"""
Split PDF API Router
Handles PDF page extraction and splitting
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from pathlib import Path
import uuid
import json

from app.tools.pdf_splitter import PDFSplitterTool

router = APIRouter(prefix="/split-pdf", tags=["split-pdf"])

# Job storage directory
JOBS_DIR = Path("data/split_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class CreateJobResponse(BaseModel):
    job_id: str
    total_pages: int
    message: str


class ProcessRequest(BaseModel):
    pages: List[int]  # 0-indexed page numbers


class JobStatus(BaseModel):
    job_id: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    total_pages: int
    selected_pages: Optional[int] = None
    error: Optional[str] = None


@router.post("/jobs", response_model=CreateJobResponse)
async def create_split_job(file: UploadFile = File(...)):
    """Upload PDF and create split job"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Create job ID and directories
    job_id = str(uuid.uuid4())
    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    # Save uploaded file
    input_path = job_dir / "input.pdf"
    with input_path.open("wb") as f:
        content = await file.read()
        f.write(content)
    
    # Get page count
    splitter = PDFSplitterTool()
    total_pages = splitter.get_page_count(str(input_path))
    
    # Save job metadata
    metadata = {
        'job_id': job_id,
        'status': 'uploaded',
        'total_pages': total_pages,
        'filename': file.filename
    }
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    return CreateJobResponse(
        job_id=job_id,
        total_pages=total_pages,
        message=f"PDF uploaded successfully. {total_pages} pages found."
    )


@router.post("/jobs/{job_id}/process")
async def process_split_job(job_id: str, request: ProcessRequest, background_tasks: BackgroundTasks):
    """Process the split job with selected pages"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    if not request.pages:
        raise HTTPException(status_code=400, detail="No pages selected")
    
    # Update metadata
    metadata['status'] = 'processing'
    metadata['selected_pages'] = len(request.pages)
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    # Process in background
    background_tasks.add_task(process_pdf_split, job_id, request.pages)
    
    return {"message": "Processing started", "job_id": job_id}


def process_pdf_split(job_id: str, pages: List[int]):
    """Background task to split PDF"""
    job_dir = JOBS_DIR / job_id
    input_path = job_dir / "input.pdf"
    output_path = job_dir / "output.pdf"
    
    try:
        splitter = PDFSplitterTool()
        result = splitter.extract_pages(str(input_path), pages, str(output_path))
        
        # Update metadata
        with (job_dir / "metadata.json").open("r") as f:
            metadata = json.load(f)
        
        metadata['status'] = 'completed'
        metadata['result'] = result
        
        with (job_dir / "metadata.json").open("w") as f:
            json.dump(metadata, f)
            
    except Exception as e:
        # Update metadata with error
        with (job_dir / "metadata.json").open("r") as f:
            metadata = json.load(f)
        
        metadata['status'] = 'failed'
        metadata['error'] = str(e)
        
        with (job_dir / "metadata.json").open("w") as f:
            json.dump(metadata, f)


@router.get("/jobs/{job_id}/status", response_model=JobStatus)
async def get_split_job_status(job_id: str):
    """Get split job status"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    return JobStatus(
        job_id=metadata['job_id'],
        status=metadata['status'],
        total_pages=metadata['total_pages'],
        selected_pages=metadata.get('selected_pages'),
        error=metadata.get('error')
    )


@router.get("/jobs/{job_id}/download")
async def download_split_pdf(job_id: str):
    """Download the split PDF"""
    
    job_dir = JOBS_DIR / job_id
    output_path = job_dir / "output.pdf"
    
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Split PDF not ready")
    
    # Get original filename from metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    original_name = metadata.get('filename', 'document.pdf')
    output_name = original_name.replace('.pdf', '_split.pdf')
    
    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=output_name
    )


@router.get("/jobs/{job_id}/pages/{page_num}/thumbnail")
async def get_page_thumbnail(job_id: str, page_num: int):
    """Get thumbnail for a specific page"""
    
    job_dir = JOBS_DIR / job_id
    input_path = job_dir / "input.pdf"
    
    if not input_path.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create thumbnails directory
    thumbs_dir = job_dir / "thumbnails"
    thumbs_dir.mkdir(exist_ok=True)
    
    thumb_path = thumbs_dir / f"page_{page_num}.png"
    
    # Generate thumbnail if not exists
    if not thumb_path.exists():
        try:
            splitter = PDFSplitterTool()
            splitter.generate_thumbnail(str(input_path), page_num, str(thumb_path))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to generate thumbnail: {str(e)}")
    
    return FileResponse(thumb_path, media_type="image/png")
