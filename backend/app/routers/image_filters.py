"""
Image Filters API Router
Handles image filter application with preview support
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import uuid
import json
import base64

from app.tools.image_filters import ImageFiltersTool

router = APIRouter(prefix="/image-filters", tags=["image-filters"])

# Job storage directory
JOBS_DIR = Path("data/image_filters_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class CreateJobResponse(BaseModel):
    job_id: str
    message: str
    image_info: dict


class ApplyFiltersRequest(BaseModel):
    # Adjustments (0.0 - 2.0, where 1.0 is original)
    brightness: float = 1.0
    contrast: float = 1.0
    saturation: float = 1.0
    sharpness: float = 1.0
    
    # Effects
    blur: int = 0  # 0-10
    sharpen: bool = False
    edge_enhance: bool = False
    
    # Filters
    grayscale: bool = False
    sepia: bool = False
    
    # Output
    output_format: Optional[str] = None
    quality: int = 95


class JobStatus(BaseModel):
    job_id: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    error: Optional[str] = None
    result: Optional[dict] = None


@router.post("/jobs", response_model=CreateJobResponse)
async def create_image_filters_job(file: UploadFile = File(...)):
    """Upload image and create filter job"""
    
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
    filters_tool = ImageFiltersTool()
    try:
        image_info = filters_tool.get_image_info(str(input_path))
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


@router.post("/jobs/{job_id}/apply")
async def apply_filters(job_id: str, request: ApplyFiltersRequest, background_tasks: BackgroundTasks):
    """Apply filters to the image"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    # Update metadata
    metadata['status'] = 'processing'
    metadata['filter_options'] = request.dict()
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    # Process in background
    background_tasks.add_task(
        process_image_filters,
        job_id,
        request.brightness,
        request.contrast,
        request.saturation,
        request.sharpness,
        request.blur,
        request.sharpen,
        request.edge_enhance,
        request.grayscale,
        request.sepia,
        request.output_format,
        request.quality
    )
    
    return {"message": "Filter processing started", "job_id": job_id}


def process_image_filters(
    job_id: str,
    brightness: float,
    contrast: float,
    saturation: float,
    sharpness: float,
    blur: int,
    sharpen: bool,
    edge_enhance: bool,
    grayscale: bool,
    sepia: bool,
    output_format: Optional[str],
    quality: int
):
    """Background task to apply filters"""
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
        filters_tool = ImageFiltersTool()
        result = filters_tool.apply_filters(
            str(input_file),
            str(output_path),
            brightness=brightness,
            contrast=contrast,
            saturation=saturation,
            sharpness=sharpness,
            blur=blur,
            sharpen=sharpen,
            edge_enhance=edge_enhance,
            grayscale=grayscale,
            sepia=sepia,
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
async def get_image_filters_status(job_id: str):
    """Get filter job status"""
    
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


@router.get("/jobs/{job_id}/preview")
async def get_preview_image(job_id: str):
    """Get base64-encoded preview of processed image for display"""
    
    job_dir = JOBS_DIR / job_id
    
    # Find output file
    output_file = None
    for f in job_dir.glob("output.*"):
        output_file = f
        break
    
    if not output_file or not output_file.exists():
        raise HTTPException(status_code=404, detail="Processed image not ready")
    
    # Read and encode as base64
    with open(output_file, 'rb') as f:
        image_data = f.read()
    
    encoded = base64.b64encode(image_data).decode()
    
    # Determine mime type
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.gif': 'image/gif'
    }
    
    mime_type = mime_types.get(output_file.suffix.lower(), 'image/png')
    
    return {
        'preview': f'data:{mime_type};base64,{encoded}',
        'size': len(image_data),
        'format': output_file.suffix[1:].upper()
    }


@router.get("/jobs/{job_id}/download")
async def download_filtered_image(job_id: str):
    """Download the filtered image"""
    
    job_dir = JOBS_DIR / job_id
    
    # Find output file
    output_file = None
    for f in job_dir.glob("output.*"):
        output_file = f
        break
    
    if not output_file or not output_file.exists():
        raise HTTPException(status_code=404, detail="Filtered image not ready")
    
    # Get original filename from metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    original_name = Path(metadata.get('filename', 'image')).stem
    output_name = f"{original_name}_filtered{output_file.suffix}"
    
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
