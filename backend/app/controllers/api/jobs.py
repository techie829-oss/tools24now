from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import uuid

from app.db.session import get_db
from app.db.models import Job
from app.schemas.job import JobCreate, JobStatus, JobResult, Jobimage
from app.services.storage import storage
from app.worker import process_job
from app.core.config import settings

router = APIRouter()

@router.post("/pdf-to-images/jobs", response_model=JobStatus, status_code=201)
async def create_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    dpi: int = Form(200),
    format: str = Form("png"),
    zip: bool = Form(True),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Create Job Record
    job = Job(
        id=str(uuid.uuid4()),
        status="queued",
        original_filename=file.filename,
        output_format=format,
        dpi=dpi,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.JOB_TTL_MINUTES if hasattr(settings, 'JOB_TTL_MINUTES') else 30)
    )
    
    # Save Upload
    file_content = await file.read()
    input_path = await storage.save_upload(job.id, file_content, file.filename)
    job.input_path = input_path
    
    print(f"DEBUG: Creating job {job.id} with status {job.status}")
    db.add(job)
    db.commit()
    db.refresh(job)
    print(f"DEBUG: Job {job.id} commited to DB")
    
    # Trigger Worker
    background_tasks.add_task(process_job, job.id)
    
    return JobStatus(
        job_id=job.id,
        filename=job.original_filename,
        status=job.status,
        progress={"percent": 0},
        created_at=job.created_at,
        expires_at=job.expires_at
    )

@router.get("/pdf-to-images/jobs/{job_id}", response_model=JobStatus)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    print(f"DEBUG: Fetching job {job_id}")
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        print(f"DEBUG: Job {job_id} NOT FOUND in DB")
        raise HTTPException(status_code=404, detail="Job not found")
    print(f"DEBUG: Found job {job_id} status={job.status}")
        
    # Calculate simple progress (MVP)
    percent = 0
    if job.status == "completed":
        percent = 100
    elif job.status == "processing":
        # If we had real-time page updates we would use job.processed_pages / job.total_pages
        percent = 50 
        
    return JobStatus(
        job_id=job.id,
        filename=job.original_filename,
        status=job.status,
        progress={"percent": percent, "processed_pages": job.processed_pages, "total_pages": job.total_pages},
        error=job.error_message,
        created_at=job.created_at,
        expires_at=job.expires_at
    )

@router.get("/pdf-to-images/jobs/{job_id}/results", response_model=JobResult)
def get_job_results(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
        
    images = []
    # Generate image URLs (assuming files served under /files/{job_id}/{filename})
    # We need to know how many files or list them from dir. 
    # Since we didn't store every file in DB for MVP, we can infer or list dir.
    # Ideally, PDF Engine returns list and we might save it, but for MVP we know pattern: page_0001.png
    
    for i in range(job.total_pages):
        filename = f"page_{i+1:04d}.{job.output_format}"
        images.append(Jobimage(
            page=i+1,
            url=f"/files/{job.id}/{filename}"
        ))
        
    return JobResult(
        job_id=job.id,
        status=job.status,
        total_pages=job.total_pages,
        images=images,
        zip_url=f"/files/{job.id}/pages.zip" if job.zip_path else None
    )

from fastapi.responses import FileResponse
import os

@router.get("/pdf-to-images/jobs/{job_id}/assets/download")
def download_job_assets(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if not job.zip_path or not os.path.exists(job.zip_path):
        raise HTTPException(status_code=404, detail="Download not available")
        
    return FileResponse(
        job.zip_path, 
        media_type='application/zip', 
        filename=f"{job.original_filename}_converted.zip"
    )
