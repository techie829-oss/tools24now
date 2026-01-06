import asyncio
from datetime import datetime
from app.db.session import SessionLocal
from app.db.models import Job
from app.services.pdf_engine import pdf_engine
from app.services.zip_generator import zip_generator
from app.services.storage import storage
import logging

logger = logging.getLogger(__name__)

def process_job(job_id: str):
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        db.close()
        return

    try:
        job.status = "processing"
        db.commit()
        
        # Paths
        input_file = job.input_path
        job_dir = storage.get_job_dir(job_id)
        output_dir = job_dir / "output"
        
        # Run conversion (blocking call in async wrapper potentially needed for high load, but ok for MVP)
        # For true async in FastAPI with CPU bound tasks, run_in_executor is better, 
        # but for simplicity we run direct since we are in a background task
        
        total_pages, file_paths = pdf_engine.process_pdf(
            input_path=input_file,
            output_dir=str(output_dir),
            dpi=job.dpi,
            fmt=job.output_format
        )
        
        job.total_pages = total_pages
        job.processed_pages = total_pages # In MVP we update all at once
        
        # Create ZIP if requested
        # We assume ZIP is always part of requirements for now or could be a flag
        zip_path = job_dir / "pages.zip"
        zip_generator.create_zip(file_paths, str(zip_path))
        job.zip_path = str(zip_path)
        
        job.status = "completed"
        
    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        job.status = "failed"
        job.error_message = str(e)
    finally:
        job.updated_at = datetime.utcnow()
        db.commit()
        db.close()
