from fastapi import APIRouter, UploadFile, HTTPException, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import shutil
from pathlib import Path

from app.tools.image_watermark import ImageWatermarkTool

router = APIRouter(prefix="/image-watermark", tags=["Image Tools"])

# Storage directories
UPLOAD_DIR = Path("uploads/image-watermark")
OUTPUT_DIR = Path("outputs/image-watermark")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# In-memory job storage
jobs = {}

class WatermarkRequest(BaseModel):
    type: str # 'text' or 'logo'
    
    # Text params
    text: Optional[str] = None
    text_size: Optional[int] = 40
    text_color: Optional[str] = "#ffffff"
    
    # Logo params (assumes logo is already uploaded and linked to job)
    logo_job_id: Optional[str] = None
    logo_scale: Optional[int] = 20
    
    # Common params
    opacity: int = 50
    rotation: int = 0
    position: str = "bottom-right"
    
    output_format: Optional[str] = None
    quality: int = 95


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload main image"""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    job_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    input_path = UPLOAD_DIR / f"{job_id}{file_extension}"
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jobs[job_id] = {
        'status': 'uploaded',
        'input_path': str(input_path),
        'original_filename': file.filename,
        'logos': {} # Store uploaded logos for this job
    }
    
    # Get basic info
    try:
        tool = ImageWatermarkTool(str(input_path))
        jobs[job_id]['image_info'] = {
            'width': tool.original_size[0],
            'height': tool.original_size[1],
            'format': tool.original_format
        }
    except Exception:
        pass

    return {
        'job_id': job_id, 
        'status': 'uploaded',
        'image_info': jobs[job_id].get('image_info')
    }

@router.post("/jobs/{job_id}/upload-logo")
async def upload_logo(job_id: str, file: UploadFile = File(...)):
    """Upload a logo image for a specific job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    logo_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    logo_path = UPLOAD_DIR / f"logo_{job_id}_{logo_id}{file_extension}"
    
    with open(logo_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jobs[job_id]['logos'][logo_id] = str(logo_path)
    
    return {'logo_id': logo_id}

@router.post("/jobs/{job_id}/transform")
async def apply_watermark(job_id: str, request: WatermarkRequest):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = jobs[job_id]
    
    try:
        tool = ImageWatermarkTool(job['input_path'])
        
        if request.type == 'text':
            if not request.text:
                raise HTTPException(status_code=400, detail="Text is required")
                
            tool.add_text_watermark(
                text=request.text,
                size=request.text_size,
                color=request.text_color,
                opacity=request.opacity,
                rotation=request.rotation,
                position=request.position
            )
            
        elif request.type == 'logo':
            if not request.logo_job_id:
                raise HTTPException(status_code=400, detail="Logo ID is required")
                
            logo_path = job['logos'].get(request.logo_job_id)
            if not logo_path:
                raise HTTPException(status_code=404, detail="Logo file not found")
                
            tool.add_logo_watermark(
                logo_path=logo_path,
                scale=request.logo_scale,
                opacity=request.opacity,
                rotation=request.rotation,
                position=request.position
            )
            
        output_format = request.output_format or tool.original_format.lower()
        output_path = OUTPUT_DIR / f"{job_id}.{output_format}"
        
        save_info = tool.save(str(output_path), format=output_format, quality=request.quality)
        
        job['output_path'] = str(output_path)
        job['status'] = 'completed'
        
        return {
            'job_id': job_id,
            'status': 'completed',
            'output_info': save_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}/download")
async def download_result(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if not job.get('output_path') or not os.path.exists(job['output_path']):
        raise HTTPException(status_code=404, detail="Output not found")
        
    return FileResponse(job['output_path'])
