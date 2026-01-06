"""
Deskew PDF API endpoints - Automatically straighten skewed documents
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
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


@router.post("/deskew-pdf/jobs", response_model=JobStatus)
async def create_deskew_job(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload PDF for deskewing (straightening)."""
    # Validate PDF
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    job_id = str(uuid.uuid4())
    job_dir = f"storage/jobs/{job_id}"
    os.makedirs(job_dir, exist_ok=True)
    
    input_path = f"{job_dir}/input.pdf"
    
    # Save uploaded file
    content = await file.read()
    with open(input_path, "wb") as f:
        f.write(content)
    
    # Get page count
    pdf = fitz.open(input_path)
    total_pages = len(pdf)
    pdf.close()
    
    # Create job record
    job = Job(
        id=job_id,
        tool="deskew_pdf",
        status="pending",
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
        progress={
            "percent": 0,
            "total_pages": total_pages
        },
        created_at=job.created_at,
        expires_at=job.expires_at
    )


@router.post("/deskew-pdf/jobs/{job_id}/process")
async def process_deskew_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Start deskewing PDF."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job already processed")
    
    # Update job status
    job.status = "processing"
    db.commit()
    
    # Run deskew
    from app.tools.pdf_deskewer import deskew_pdf
    
    output_path = f"{job.output_dir}/deskewed.pdf"
    
    def progress_callback(current, total):
        job.processed_pages = current
        db.commit()
    
    try:
        results = deskew_pdf(
            input_pdf_path=job.input_path,
            output_pdf_path=output_path,
            progress_callback=progress_callback
        )
        
        job.status = "completed"
        job.processed_pages = job.total_pages
        job.zip_path = output_path
        
        # Store deskew metadata
        import json
        job.page_order = json.dumps({
            'avg_angle_corrected': results['avg_angle'],
            'angles_per_page': results['angles_corrected']
        })
        db.commit()
        
        return {
            "status": "completed",
            "job_id": job_id,
            "total_pages": results['total_pages'],
            "average_angle_corrected": results['avg_angle']
        }
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/deskew-pdf/jobs/{job_id}")
async def get_deskew_job_status(job_id: str, db: Session = Depends(get_db)):
    """Get deskew job status."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    percent = 0
    if job.status == "completed":
        percent = 100
    elif job.status == "processing" and job.total_pages > 0:
        percent = int((job.processed_pages / job.total_pages) * 100)
    
    # Get deskew info if available
    deskew_info = {}
    if job.page_order and job.status == "completed":
        import json
        try:
            deskew_info = json.loads(job.page_order)
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
        **deskew_info
    }


@router.get("/deskew-pdf/jobs/{job_id}/download")
async def download_deskewed_pdf(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Download deskewed PDF."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if not job.zip_path or not os.path.exists(job.zip_path):
        raise HTTPException(status_code=404, detail="Deskewed PDF not found")
    
    # Generate filename
    base_name = os.path.splitext(job.original_filename)[0]
    filename = f"{base_name}_deskewed.pdf"
    
    return FileResponse(
        job.zip_path,
        media_type="application/pdf",
        filename=filename
    )
