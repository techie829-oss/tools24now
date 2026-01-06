from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from app.services.storage import storage

router = APIRouter()

@router.get("/{job_id}/{filename}")
def get_file(job_id: str, filename: str):
    job_dir = storage.get_job_dir(job_id)
    
    # Check simple paths
    # 1. Direct in job dir (zip, input) or output dir (images)
    file_path = job_dir / filename
    if not file_path.exists():
        # Try output subdir
        file_path = job_dir / "output" / filename
        
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path)
