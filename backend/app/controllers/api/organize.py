"""
Organize PDF API endpoints - Reorder and rearrange PDF pages
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
from datetime import datetime, timedelta

router = APIRouter()


class OrganizeJobRequest(BaseModel):
    page_order: List[int]


@router.post("/organize-pdf/jobs", response_model=JobStatus)
async def create_organize_job(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload PDF and create organize job.
    Returns job info with thumbnail URLs for frontend preview.
    """
    # Validate PDF
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    job_id = str(uuid.uuid4())
    job_dir = f"storage/jobs/{job_id}"
    thumbnails_dir = f"{job_dir}/thumbnails"
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    input_path = f"{job_dir}/input.pdf"
    
    # Save uploaded file
    content = await file.read()
    with open(input_path, "wb") as f:
        f.write(content)
    
    # Get page count and generate thumbnails
    import fitz
    from app.tools.pdf_organizer import generate_page_thumbnails
    
    pdf = fitz.open(input_path)
    total_pages = len(pdf)
    pdf.close()
    
    # Generate thumbnails for preview
    try:
        generate_page_thumbnails(input_path, thumbnails_dir, thumbnail_width=200)
    except Exception as e:
        print(f"Error generating thumbnails: {e}")
    
    # Create job record
    job = Job(
        id=job_id,
        tool="organize_pdf",
        status="pending",  # Waiting for user to confirm page order
        original_filename=file.filename,
        mime_type=file.content_type,
        file_size_bytes=len(content),
        input_path=input_path,
        output_dir=job_dir,
        total_pages=total_pages,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    
    db.add(job)
    db.commit()
    
    return JobStatus(
        job_id=job_id,
        filename=file.filename,
        status="pending",
        progress={"percent": 0, "total_pages": total_pages},
        created_at=job.created_at,
        expires_at=job.expires_at
    )


@router.post("/organize-pdf/jobs/{job_id}/process")
async def process_organize_job(
    job_id: str,
    request: OrganizeJobRequest,
    db: Session = Depends(get_db)
):
    """
    Process PDF reorganization with user-specified page order.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job already processed")
    
    # Validate page order
    if len(request.page_order) != job.total_pages:
        raise HTTPException(
            status_code=400,
            detail=f"Page order must contain all {job.total_pages} pages"
        )
    
    if set(request.page_order) != set(range(job.total_pages)):
        raise HTTPException(
            status_code=400,
            detail="Invalid page order"
        )
    
    # Update job status
    job.status = "processing"
    job.page_order = ",".join(map(str, request.page_order))
    db.commit()
    
    # Process PDF reorganization
    from app.tools.pdf_organizer import reorder_pdf_pages
    
    output_path = f"{job.output_dir}/organized.pdf"
    
    def progress_callback(current, total):
        job.processed_pages = current
        db.commit()
    
    try:
        result = reorder_pdf_pages(
            input_pdf_path=job.input_path,
            output_pdf_path=output_path,
            page_order=request.page_order,
            progress_callback=progress_callback
        )
        
        job.status = "completed"
        job.processed_pages = job.total_pages
        job.zip_path = output_path  # Reuse this field for organized PDF
        db.commit()
        
        return {"status": "completed", "job_id": job_id}
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organize-pdf/jobs/{job_id}")
async def get_organize_job_status(job_id: str, db: Session = Depends(get_db)):
    """
    Get organize job status for polling.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    percent = 0
    if job.status == "completed":
        percent = 100
    elif job.status == "processing" and job.total_pages > 0:
        percent = int((job.processed_pages / job.total_pages) * 100)
    
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


@router.get("/organize-pdf/jobs/{job_id}/download")
async def download_organized_pdf(job_id: str, db: Session = Depends(get_db)):
    """
    Download reorganized PDF.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if not job.zip_path or not os.path.exists(job.zip_path):
        raise HTTPException(status_code=404, detail="Organized PDF not found")
    
    return FileResponse(
        job.zip_path,
        media_type="application/pdf",
        filename=f"organized_{job.original_filename}"
    )


@router.get("/organize-pdf/jobs/{job_id}/thumbnails/{filename}")
async def get_thumbnail(job_id: str, filename: str, db: Session = Depends(get_db)):
    """
    Serve thumbnail images for page preview.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    thumbnail_path = f"storage/jobs/{job_id}/thumbnails/{filename}"
    
    if not os.path.exists(thumbnail_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    return FileResponse(thumbnail_path, media_type="image/png")
