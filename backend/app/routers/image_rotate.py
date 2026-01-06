from fastapi import APIRouter, UploadFile, HTTPException, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import shutil
from pathlib import Path

from app.tools.image_rotate import ImageRotateTool

router = APIRouter(prefix="/image-rotate", tags=["Image Tools"])

# Storage directories
UPLOAD_DIR = Path("uploads/image-rotate")
OUTPUT_DIR = Path("outputs/image-rotate")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# In-memory job storage (in production, use a database)
jobs = {}


class TransformRequest(BaseModel):
    rotation: float = 0
    flip_h: bool = False
    flip_v: bool = False
    output_format: Optional[str] = None
    quality: int = 95


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image for rotation/flipping
    
    Returns job_id and image information
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_extension = os.path.splitext(file.filename)[1]
    input_path = UPLOAD_DIR / f"{job_id}{file_extension}"
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Get image info
        tool = ImageRotateTool(str(input_path))
        image_info = tool.get_image_info()
        
        # Store job info
        jobs[job_id] = {
            'status': 'uploaded',
            'input_path': str(input_path),
            'output_path': None,
            'original_filename': file.filename,
            'image_info': image_info,
            'current_state': {'rotation': 0, 'flip_h': False, 'flip_v': False}
        }
        
        return {
            'job_id': job_id,
            'status': 'uploaded',
            'image_info': image_info,
            'original_filename': file.filename
        }
    
    except Exception as e:
        # Clean up on error
        if input_path.exists():
            os.remove(input_path)
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")


@router.post("/jobs/{job_id}/transform")
async def apply_transformation(job_id: str, request: TransformRequest):
    """
    Apply transformation operations (rotate/flip) to uploaded image
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    try:
        # Load the image
        tool = ImageRotateTool(job['input_path'])
        
        # Apply transformation
        transformed_image = tool.apply_transforms(
            request.rotation,
            request.flip_h,
            request.flip_v
        )
        
        # Prepare output path
        output_format = request.output_format or tool.original_format.lower()
        output_path = OUTPUT_DIR / f"{job_id}.{output_format}"
        
        # Save transformed image
        save_info = tool.save(
            str(output_path),
            transformed_image,
            output_format,
            request.quality
        )
        
        # Update job
        job['status'] = 'completed'
        job['output_path'] = str(output_path)
        job['current_state'] = {
            'rotation': request.rotation,
            'flip_h': request.flip_h,
            'flip_v': request.flip_v
        }
        job['output_info'] = save_info
        
        return {
            'job_id': job_id,
            'status': 'completed',
            'state': job['current_state'],
            'output_info': save_info
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        job['status'] = 'failed'
        job['error'] = str(e)
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")


@router.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """Get the status of a job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return {
        'job_id': job_id,
        'status': job['status'],
        'current_operation': job.get('current_operation', 'none'),
        'image_info': job.get('image_info'),
        'output_info': job.get('output_info'),
        'error': job.get('error')
    }


@router.get("/jobs/{job_id}/download")
async def download_result(job_id: str):
    """Download the transformed image"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if not job['output_path'] or not os.path.exists(job['output_path']):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    # Generate download filename
    original_name = os.path.splitext(job['original_filename'])[0]
    output_ext = os.path.splitext(job['output_path'])[1]
    download_filename = f"{original_name}_transformed{output_ext}"
    
    return FileResponse(
        job['output_path'],
        media_type='image/*',
        filename=download_filename
    )


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Clean up job files"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # Delete files
    if job['input_path'] and os.path.exists(job['input_path']):
        os.remove(job['input_path'])
    if job.get('output_path') and os.path.exists(job['output_path']):
        os.remove(job['output_path'])
    
    # Remove from jobs
    del jobs[job_id]
    
    return {'message': 'Job deleted successfully'}
