"""
Merge PDF API endpoints - Combine multiple PDFs into one
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Job
from app.schemas.job import JobStatus
from pydantic import BaseModel
from typing import List
import uuid
import os
import json
from datetime import datetime, timedelta
import fitz

router = APIRouter()


class MergeJobRequest(BaseModel):
    file_order: List[int]  # e.g., [0, 1, 2] or [2, 0, 1] for custom order


@router.post("/merge-pdf/jobs", response_model=JobStatus)
async def create_merge_job(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload multiple PDFs and create merge job.
    Minimum 2 files, maximum 10 files.
    """
    # Validate file count
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files required")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 PDF files allowed")
    
    # Validate all are PDFs
    for file in files:
        if file.content_type != 'application/pdf':
            raise HTTPException(
                status_code=400,
                detail=f"{file.filename} is not a PDF file"
            )
    
    job_id = str(uuid.uuid4())
    job_dir = f"storage/jobs/{job_id}"
    os.makedirs(job_dir, exist_ok=True)
    
    # Save all files and collect metadata
    file_metadata = []
    total_pages = 0
    total_size = 0
    
    for i, file in enumerate(files):
        file_path = f"{job_dir}/input_{i+1}.pdf"
        content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get page count
        pdf = fitz.open(file_path)
        page_count = len(pdf)
        pdf.close()
        
        file_metadata.append({
            "index": i,
            "filename": file.filename,
            "pages": page_count,
            "size": len(content)
        })
        
        total_pages += page_count
        total_size += len(content)
    
    # Create job record
    job = Job(
        id=job_id,
        tool="merge_pdf",
        status="pending",
        original_filename=f"merged_{len(files)}_files.pdf",
        mime_type="application/pdf",
        file_size_bytes=total_size,
        input_path=job_dir,
        output_dir=job_dir,
        total_pages=total_pages,
        page_order=json.dumps(file_metadata),  # Store file metadata
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    
    db.add(job)
    db.commit()
    
    return JobStatus(
        job_id=job_id,
        filename=f"{len(files)} PDFs ready to merge",
        status="pending",
        progress={
            "percent": 0,
            "total_pages": total_pages
        },
        created_at=job.created_at,
        expires_at=job.expires_at
    )


@router.post("/merge-pdf/jobs/{job_id}/process")
async def process_merge_job(
    job_id: str,
    request: MergeJobRequest,
    db: Session = Depends(get_db)
):
    """
    Merge PDFs in specified order.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job already processed")
    
    # Get file metadata
    file_metadata = json.loads(job.page_order)
    
    # Validate file order
    if len(request.file_order) != len(file_metadata):
        raise HTTPException(
            status_code=400,
            detail=f"File order must contain all {len(file_metadata)} files"
        )
    
    # Build input file paths in specified order
    input_files = []
    for idx in request.file_order:
        if idx < 0 or idx >= len(file_metadata):
            raise HTTPException(status_code=400, detail=f"Invalid file index: {idx}")
        
        file_path = f"{job.input_path}/input_{idx+1}.pdf"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File {idx+1} not found")
        
        input_files.append(file_path)
    
    # Update job status
    job.status = "processing"
    db.commit()
    
    # Merge PDFs
    from app.tools.pdf_merger import merge_pdfs
    
    output_path = f"{job.output_dir}/merged.pdf"
    
    def progress_callback(current, total):
        job.processed_pages = current
        db.commit()
    
    try:
        result = merge_pdfs(
            input_pdf_paths=input_files,
            output_pdf_path=output_path,
            progress_callback=progress_callback
        )
        
        job.status = "completed"
        job.processed_pages = result["total_files"]
        job.zip_path = output_path
        db.commit()
        
        return {
            "status": "completed",
            "job_id": job_id,
            "total_files": result["total_files"],
            "total_pages": result["total_pages"]
        }
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/merge-pdf/jobs/{job_id}")
async def get_merge_job_status(job_id: str, db: Session = Depends(get_db)):
    """Get merge job status for polling."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Calculate progress
    percent = 0
    if job.status == "completed":
        percent = 100
    elif job.status == "processing":
        file_metadata = json.loads(job.page_order) if job.page_order else []
        if len(file_metadata) > 0:
            percent = int((job.processed_pages / len(file_metadata)) * 100)
    
    return JobStatus(
        job_id=job.id,
        filename=job.original_filename,
        status=job.status,
        progress={
            "percent": percent,
            "processed_pages": job.processed_pages,
            "total_pages": job.total_pages
        },
        error=job.error_message,
        created_at=job.created_at,
        expires_at=job.expires_at
    )


@router.get("/merge-pdf/jobs/{job_id}/download")
async def download_merged_pdf(job_id: str, db: Session = Depends(get_db)):
    """Download merged PDF."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if not job.zip_path or not os.path.exists(job.zip_path):
        raise HTTPException(status_code=404, detail="Merged PDF not found")
    
    return FileResponse(
        job.zip_path,
        media_type="application/pdf",
        filename=job.original_filename
    )


@router.get("/merge-pdf/jobs/{job_id}/files")
async def get_merge_job_files(job_id: str, db: Session = Depends(get_db)):
    """Get list of files in merge job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if not job.page_order:
        return {"files": []}
    
    file_metadata = json.loads(job.page_order)
    return {"files": file_metadata}
