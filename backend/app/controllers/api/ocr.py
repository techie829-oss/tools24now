"""
OCR PDF API endpoints - Extract text from scanned PDFs
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


@router.post("/ocr-pdf/jobs", response_model=JobStatus)
async def create_ocr_job(
    file: UploadFile = File(...),
    language: str = Form('eng'),
    mode: str = Form('standard'), # 'standard' or 'enhanced'
    db: Session = Depends(get_db)
):
    """
    Upload PDF for OCR text extraction.
    Supported languages: eng, hin, spa...
    Mode: 'standard' (Tesseract) or 'enhanced' (Layout AI)
    """
    # Validate PDF
    # Validate File Type
    if file.content_type not in ['application/pdf', 'image/jpeg', 'image/png']:
        raise HTTPException(status_code=400, detail="Only PDF, JPEG, and PNG files allowed")
    
    # Validate language
    from app.tools.pdf_ocr import SUPPORTED_LANGUAGES
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}"
        )
    
    job_id = str(uuid.uuid4())
    job_dir = f"storage/jobs/{job_id}"
    os.makedirs(job_dir, exist_ok=True)
    
    input_path = f"{job_dir}/input.pdf"
    
    # Save uploaded file
    content = await file.read()
    
    if file.content_type.startswith('image/'):
        # Convert image to PDF
        from PIL import Image
        import io
        try:
            image = Image.open(io.BytesIO(content))
            image = image.convert('RGB')
            image.save(input_path, "PDF")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
    else:
        # Save PDF directly
        with open(input_path, "wb") as f:
            f.write(content)
    
    # Get page count
    pdf = fitz.open(input_path)
    total_pages = len(pdf)
    pdf.close()
    
    # Create job record
    # Store language and mode in output_format separated by pipe
    # e.g., "eng|standard" or "eng|enhanced"
    format_str = f"{language}|{mode}"

    job = Job(
        id=job_id,
        tool="ocr_pdf",
        status="pending",
        original_filename=file.filename,
        mime_type=file.content_type,
        file_size_bytes=len(content),
        input_path=input_path,
        output_dir=job_dir,
        total_pages=total_pages,
        output_format=format_str,  
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


@router.post("/ocr-pdf/jobs/{job_id}/process")
async def process_ocr_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Start OCR text extraction.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job already processed")
    
    # Update job status
    job.status = "processing"
    db.commit()
    
    # Parse lang and mode
    lang_mode = job.output_format.split('|')
    language = lang_mode[0]
    mode = lang_mode[1] if len(lang_mode) > 1 else 'standard'
    
    from app.tools.pdf_ocr import extract_text_from_pdf, save_results_as_text, save_results_as_json
    from app.tools.enhanced_ocr import extract_text_enhanced
    from fastapi.concurrency import run_in_threadpool
    
    def progress_callback(current, total):
        # Note: In a real async/threaded env, writing to DB from callback 
        # might need careful scoping, but since we await the threadpool, 
        # this callback runs in the thread. We should ensure the session is robust.
        # For simple threading offload, this usually works as the session object 
        # is passed in.
        try:
             # Re-query might be safer if session isdetached, but simple update is fine
             job.processed_pages = current
             db.commit()
        except:
             pass

    try:
        if mode == 'enhanced':
            results = await run_in_threadpool(
                extract_text_enhanced,
                input_pdf_path=job.input_path,
                language=language,
                progress_callback=progress_callback
            )
        else:
             results = await run_in_threadpool(
                extract_text_from_pdf,
                input_pdf_path=job.input_path,
                language=language,
                progress_callback=progress_callback
            )
        
        # Save results
        text_path = f"{job.output_dir}/extracted_text.txt"
        json_path = f"{job.output_dir}/extracted_text.json"
        
        save_results_as_text(results, text_path)
        save_results_as_json(results, json_path)
        
        job.status = "completed"
        # Update total pages from actual results (crucial if detection changed it or initial count was 0)
        job.total_pages = results.get('total_pages', job.total_pages) 
        job.processed_pages = job.total_pages
        job.zip_path = text_path  # Store text file path
        
        # Store results metadata
        import json as json_lib
        job.page_order = json_lib.dumps({
            'total_characters': results['total_characters'],
            'language': results['language'],
            'mode': mode,
            'text_file': text_path,
            'json_file': json_path
        })
        db.commit()
        
        return {
            "status": "completed",
            "job_id": job_id,
            "total_characters": results['total_characters'],
            "total_pages": results['total_pages'],
            "mode": mode
        }
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ocr-pdf/jobs/{job_id}")
async def get_ocr_job_status(job_id: str, db: Session = Depends(get_db)):
    """Get OCR job status."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    percent = 0
    if job.status == "completed":
        percent = 100
    elif job.status == "processing" and job.total_pages > 0:
        percent = int((job.processed_pages / job.total_pages) * 100)
    
    # Get OCR results if available
    ocr_info = {}
    if job.page_order and job.status == "completed":
        import json
        try:
            ocr_info = json.loads(job.page_order)
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
        **ocr_info
    }


@router.get("/ocr-pdf/jobs/{job_id}/download/{format}")
async def download_ocr_results(
    job_id: str,
    format: str,
    db: Session = Depends(get_db)
):
    """Download OCR results as TXT or JSON."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if format not in ['txt', 'json']:
        raise HTTPException(status_code=400, detail="Format must be 'txt' or'json'")
    
    # Get file path from metadata
    import json
    try:
        metadata = json.loads(job.page_order)
        file_path = metadata['text_file'] if format == 'txt' else metadata['json_file']
    except:
        raise HTTPException(status_code=404, detail="OCR results not found")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Result file not found")
    
    # Generate filename
    base_name = os.path.splitext(job.original_filename)[0]
    filename = f"{base_name}_ocr.{format}"
    
    media_type = "text/plain" if format == 'txt' else "application/json"
    
    return FileResponse(
        file_path,
        media_type=media_type,
        filename=filename
    )
