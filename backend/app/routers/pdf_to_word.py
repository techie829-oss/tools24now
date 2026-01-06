"""
PDF to Word API Router
Handles PDF to Word (.docx) conversion
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import uuid
import json

from app.tools.pdf_to_word import PdfToWordTool

router = APIRouter(prefix="/pdf-to-word", tags=["pdf-to-word"])

# Job storage directory
JOBS_DIR = Path("data/pdf_to_word_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class CreateJobResponse(BaseModel):
    job_id: str
    message: str


class JobStatus(BaseModel):
    job_id: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    error: Optional[str] = None


@router.post("/jobs", response_model=CreateJobResponse)
async def create_pdf_to_word_job(file: UploadFile = File(...)):
    """Upload PDF and create conversion job"""
    
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
    
    # Save job metadata
    metadata = {
        'job_id': job_id,
        'status': 'uploaded',
        'filename': file.filename
    }
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    return CreateJobResponse(
        job_id=job_id,
        message="PDF uploaded successfully. Ready for conversion."
    )


@router.post("/jobs/{job_id}/process")
async def process_pdf_to_word(job_id: str, background_tasks: BackgroundTasks):
    """Process the PDF to Word conversion"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    # Update metadata
    metadata['status'] = 'processing'
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    # Process in background
    background_tasks.add_task(convert_pdf_to_word, job_id)
    
    return {"message": "Conversion started", "job_id": job_id}


def convert_pdf_to_word(job_id: str):
    """Background task to convert PDF to Word"""
    job_dir = JOBS_DIR / job_id
    input_path = job_dir / "input.pdf"
    output_path = job_dir / "output.docx"
    
    try:
        converter = PdfToWordTool()
        result = converter.convert_pdf_to_word(str(input_path), str(output_path))
        
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
async def get_pdf_to_word_status(job_id: str):
    """Get conversion job status"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    return JobStatus(
        job_id=metadata['job_id'],
        status=metadata['status'],
        error=metadata.get('error')
    )


@router.get("/jobs/{job_id}/download")
async def download_word_file(job_id: str):
    """Download the converted Word file"""
    
    job_dir = JOBS_DIR / job_id
    output_path = job_dir / "output.docx"
    
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Word file not ready")
    
    # Get original filename from metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    original_name = metadata.get('filename', 'document.pdf')
    output_name = original_name.replace('.pdf', '.docx')
    
    return FileResponse(
        output_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=output_name
    )
