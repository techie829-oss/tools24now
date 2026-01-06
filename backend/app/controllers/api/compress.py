"""
Compress PDF API endpoints - Reduce PDF file size
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Job
from app.schemas.job import JobStatus
import uuid
import os
from datetime import datetime, timedelta
import fitz

router = APIRouter()


@router.post("/compress-pdf/jobs", response_model=JobStatus)
async def create_compress_job(
    file: UploadFile = File(...),
    quality: str = Form('medium'),
    compress_by_percent: int = Form(None),
    max_file_size_mb: float = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload PDF for compression.
    Options:
    - quality: 'low', 'medium', 'high' (used if compress_by_percent and max_file_size_mb are None)
    - compress_by_percent: Target compression percentage (e.g., 50 = reduce by 50%)
    - max_file_size_mb: Target maximum file size in MB (e.g., 5.0 = max 5MB)
    """
    # Validate PDF
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # Validate quality if using quality mode
    if not compress_by_percent and not max_file_size_mb:
        if quality not in ['low', 'medium', 'high']:
            raise HTTPException(
                status_code=400,
                detail="Quality must be 'low', 'medium', or 'high'"
            )
    
    job_id = str(uuid.uuid4())
    job_dir = f"storage/jobs/{job_id}"
    os.makedirs(job_dir, exist_ok=True)
    
    input_path = f"{job_dir}/input.pdf"
    
    # Save uploaded file
    content = await file.read()
    with open(input_path, "wb") as f:
        f.write(content)
    
    # Get page count and file size
    pdf = fitz.open(input_path)
    total_pages = len(pdf)
    pdf.close()
    
    original_size = len(content)
    
    # Store compression mode in output_format
    if compress_by_percent:
        compress_mode = f"percent:{compress_by_percent}"
    elif max_file_size_mb:
        compress_mode = f"maxsize:{max_file_size_mb}"
    else:
        compress_mode = f"quality:{quality}"
    
    # Create job record
    job = Job(
        id=job_id,
        tool="compress_pdf",
        status="pending",
        original_filename=file.filename,
        mime_type=file.content_type,
        file_size_bytes=original_size,
        input_path=input_path,
        output_dir=job_dir,
        total_pages=total_pages,
        output_format=compress_mode,  # Store compression mode
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    
    db.add(job)
    db.commit()
    
    return JobStatus(
        job_id=job_id,
        filename=file.filename,
        status="pending",
        progress={
            "percent": 0,
            "total_pages": total_pages
        },
        created_at=job.created_at,
        expires_at=job.expires_at
    )


@router.post("/compress-pdf/jobs/{job_id}/process")
async def process_compress_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Start PDF compression.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job already processed")
    
    # Update job status
    job.status = "processing"
    db.commit()
    
    # Compress PDF
    from app.tools.pdf_compressor import compress_pdf
    
    output_path = f"{job.output_dir}/compressed.pdf"
    compress_mode = job.output_format or 'quality:medium'
    
    # Parse compression mode
    compress_by_percent = None
    max_file_size_mb = None
    quality = 'medium'
    
    if compress_mode.startswith('percent:'):
        compress_by_percent = int(compress_mode.split(':')[1])
    elif compress_mode.startswith('maxsize:'):
        max_file_size_mb = float(compress_mode.split(':')[1])
    elif compress_mode.startswith('quality:'):
        quality = compress_mode.split(':')[1]
    else:
        quality = compress_mode  # Backwards compatibility
    
    def progress_callback(current, total):
        job.processed_pages = current
        db.commit()
    
    try:
        result = compress_pdf(
            input_pdf_path=job.input_path,
            output_pdf_path=output_path,
            quality=quality,
            compress_by_percent=compress_by_percent,
            max_file_size_mb=max_file_size_mb,
            progress_callback=progress_callback
        )
        
        job.status = "completed"
        job.processed_pages = job.total_pages
        job.zip_path = output_path
        # Store compression results in page_order field as JSON
        import json
        job.page_order = json.dumps({
            'original_size': result['original_size'],
            'compressed_size': result['compressed_size'],
            'reduction_percent': result['reduction_percent'],
            'quality': result['quality']
        })
        db.commit()
        
        return {
            "status": "completed",
            "job_id": job_id,
            **result
        }
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compress-pdf/jobs/{job_id}")
async def get_compress_job_status(job_id: str, db: Session = Depends(get_db)):
    """Get compression job status."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    percent = 0
    if job.status == "completed":
        percent = 100
    elif job.status == "processing" and job.total_pages > 0:
        percent = int((job.processed_pages / job.total_pages) * 100)
    
    # Get compression results if available
    compression_info = {}
    if job.page_order and job.status == "completed":
        import json
        try:
            compression_info = json.loads(job.page_order)
        except:
            pass
    
    return {
        "job_id": job.id,
        "filename": job.original_filename,
        "status": job.status,
        "progress": {
            "percent": percent,
            "processed_pages": job.processed_pages,
            "total_pages": job.total_pages
        },
        "error": job.error_message,
        "created_at": job.created_at,
        "expires_at": job.expires_at,
        **compression_info
    }


@router.get("/compress-pdf/jobs/{job_id}/download")
async def download_compressed_pdf(job_id: str, db: Session = Depends(get_db)):
    """Download compressed PDF."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if not job.zip_path or not os.path.exists(job.zip_path):
        raise HTTPException(status_code=404, detail="Compressed PDF not found")
    
    # Generate filename with quality indicator
    quality = job.output_format or 'medium'
    base_name = os.path.splitext(job.original_filename)[0]
    filename = f"{base_name}_compressed_{quality}.pdf"
    
    return FileResponse(
        job.zip_path,
        media_type="application/pdf",
        filename=filename
    )
