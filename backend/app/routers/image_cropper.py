"""
Image Cropper API Router
Handles image cropping with aspect ratios and coordinates
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import uuid
import json

from app.tools.image_cropper import ImageCropperTool

router = APIRouter(prefix="/image-cropper", tags=["image-cropper"])

# Job storage directory
JOBS_DIR = Path("data/image_cropper_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class CreateJobResponse(BaseModel):
    job_id: str
    message: str
    image_info: dict


class CropRequest(BaseModel):
    # Crop coordinates
    x: int = 0
    y: int = 0
    width: Optional[int] = None
    height: Optional[int] = None
    
    # Or aspect ratio preset
    aspect_ratio: Optional[str] = None
    center_crop: bool = False
    
    # Options
    output_format: Optional[str] = None
    quality: int = 85


class JobStatus(BaseModel):
    job_id: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    error: Optional[str] = None
    result: Optional[dict] = None


@router.post("/jobs", response_model=CreateJobResponse)
async def create_image_cropper_job(file: UploadFile = File(...)):
    """Upload image and create crop job"""
    
    # Validate file type
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', '.tiff', '.tif', '.gif']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Create job ID and directories
    job_id = str(uuid.uuid4())
    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    # Save uploaded file
    input_path = job_dir / f"input{file_ext}"
    with input_path.open("wb") as f:
        content = await file.read()
        f.write(content)
    
    # Get image info
    cropper = ImageCropperTool()
    try:
        image_info = cropper.get_image_info(str(input_path))
    except Exception as e:
        # Clean up and raise error
        import shutil
        shutil.rmtree(job_dir)
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
    
    # Save job metadata
    metadata = {
        'job_id': job_id,
        'status': 'uploaded',
        'filename': file.filename,
        'image_info': image_info
    }
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    return CreateJobResponse(
        job_id=job_id,
        message="Image uploaded successfully",
        image_info=image_info
    )


@router.post("/jobs/{job_id}/crop")
async def crop_image(job_id: str, request: CropRequest, background_tasks: BackgroundTasks):
    """Crop the image with specified options"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    # Update metadata
    metadata['status'] = 'processing'
    metadata['crop_options'] = request.dict()
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    # Process in background
    background_tasks.add_task(
        process_image_crop, 
        job_id,
        request.x,
        request.y,
        request.width,
        request.height,
        request.aspect_ratio,
        request.center_crop,
        request.output_format,
        request.quality
    )
    
    return {"message": "Crop started", "job_id": job_id}


def process_image_crop(
    job_id: str,
    x: int = 0,
    y: int = 0,
    width: Optional[int] = None,
    height: Optional[int] = None,
    aspect_ratio: Optional[str] = None,
    center_crop: bool = False,
    output_format: Optional[str] = None,
    quality: int = 85
):
    """Background task to crop image"""
    job_dir = JOBS_DIR / job_id
    
    # Find input file
    input_file = None
    for f in job_dir.glob("input.*"):
        input_file = f
        break
    
    if not input_file:
        # Update metadata with error
        with (job_dir / "metadata.json").open("r") as f:
            metadata = json.load(f)
        metadata['status'] = 'failed'
        metadata['error'] = 'Input file not found'
        with (job_dir / "metadata.json").open("w") as f:
            json.dump(metadata, f)
        return
    
    # Determine output format and extension
    if output_format:
        output_ext = f".{output_format.lower()}"
    else:
        output_ext = input_file.suffix
    
    output_path = job_dir / f"output{output_ext}"
    
    try:
        cropper = ImageCropperTool()
        result = cropper.crop_image(
            str(input_file),
            str(output_path),
            x=x,
            y=y,
            width=width,
            height=height,
            aspect_ratio=aspect_ratio,
            center_crop=center_crop,
            output_format=output_format,
            quality=quality
        )
        
        # Update metadata
        with (job_dir / "metadata.json").open("r") as f:
            metadata = json.load(f)
        
        metadata['status'] = 'completed'
        metadata['result'] = result
        
        with (job_dir / "metadata.json").open("w") as f:
            json.dump(metadata, f)
            
    except Exception as e:
        # Update metadata with error
        with (job_dir / "metadata.json").open("r") as f:
            metadata = json.load(f)
        
        metadata['status'] = 'failed'
        metadata['error'] = str(e)
        
        with (job_dir / "metadata.json").open("w") as f:
            json.dump(metadata, f)


@router.get("/jobs/{job_id}/status", response_model=JobStatus)
async def get_image_cropper_status(job_id: str):
    """Get crop job status"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    return JobStatus(
        job_id=metadata['job_id'],
        status=metadata['status'],
        error=metadata.get('error'),
        result=metadata.get('result')
    )


@router.get("/jobs/{job_id}/download")
async def download_cropped_image(job_id: str):
    """Download the cropped image"""
    
    job_dir = JOBS_DIR / job_id
    
    # Find output file
    output_file = None
    for f in job_dir.glob("output.*"):
        output_file = f
        break
    
    if not output_file or not output_file.exists():
        raise HTTPException(status_code=404, detail="Cropped image not ready")
    
    # Get original filename from metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    original_name = Path(metadata.get('filename', 'image')).stem
    output_name = f"{original_name}_cropped{output_file.suffix}"
    
    # Determine media type
    media_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.gif': 'image/gif'
    }
    
    media_type = media_types.get(output_file.suffix.lower(), 'application/octet-stream')
    
    return FileResponse(
        output_file,
        media_type=media_type,
        filename=output_name
    )
