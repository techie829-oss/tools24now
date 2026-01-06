"""
Image Compressor API Router
Handles image compression with quality control
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import uuid
import json

from app.tools.image_compressor import ImageCompressorTool

router = APIRouter(prefix="/image-compressor", tags=["image-compressor"])

# Job storage directory
JOBS_DIR = Path("data/image_compressor_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class CreateJobResponse(BaseModel):
    job_id: str
    message: str
    image_info: dict


class CompressRequest(BaseModel):
    quality: int = 85  # Quality (1-100)
    target_size_kb: Optional[int] = None  # Target file size in KB
    max_width: Optional[int] = None  # Maximum width for resizing
    max_height: Optional[int] = None  # Maximum height for resizing
    output_format: Optional[str] = None  # Output format (jpg, png, webp, avif, etc.)
    preset: Optional[str] = None  # Quality preset (maximum, high, balanced, compress, max_compress)


class JobStatus(BaseModel):
    job_id: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    error: Optional[str] = None
    result: Optional[dict] = None  # Compression results when completed


@router.post("/jobs", response_model=CreateJobResponse)
async def create_image_compressor_job(file: UploadFile = File(...)):
    """Upload image and create compression job"""
    
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
    compressor = ImageCompressorTool()
    try:
        image_info = compressor.get_image_info(str(input_path))
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


@router.post("/jobs/{job_id}/compress")
async def compress_image(job_id: str, request: CompressRequest, background_tasks: BackgroundTasks):
    """Compress the image with specified quality"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    # Validate quality
    quality = max(1, min(100, request.quality))
    
    # Update metadata
    metadata['status'] = 'processing'
    metadata['quality'] = quality
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    # Process in background
    background_tasks.add_task(
        process_image_compression, 
        job_id, 
        quality,
        request.target_size_kb,
        request.max_width,
        request.max_height,
        request.output_format,
        request.preset
    )
    
    return {"message": "Compression started", "job_id": job_id}


def process_image_compression(
    job_id: str, 
    quality: int,
    target_size_kb: Optional[int] = None,
    max_width: Optional[int] = None,
    max_height: Optional[int] = None,
    output_format: Optional[str] = None,
    preset: Optional[str] = None
):
    """Background task to compress image with advanced options"""
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
        compressor = ImageCompressorTool()
        result = compressor.compress_image(
            str(input_file), 
            str(output_path), 
            quality=quality,
            target_size_kb=target_size_kb,
            max_width=max_width,
            max_height=max_height,
            output_format=output_format,
            preset=preset
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
async def get_image_compressor_status(job_id: str):
    """Get compression job status"""
    
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
async def download_compressed_image(job_id: str):
    """Download the compressed image"""
    
    job_dir = JOBS_DIR / job_id
    
    # Find output file
    output_file = None
    for f in job_dir.glob("output.*"):
        output_file = f
        break
    
    if not output_file or not output_file.exists():
        raise HTTPException(status_code=404, detail="Compressed image not ready")
    
    # Get original filename from metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    original_name = Path(metadata.get('filename', 'image')).stem
    output_name = f"{original_name}_compressed{output_file.suffix}"
    
    # Determine media type
    media_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
    }
    
    media_type = media_types.get(output_file.suffix.lower(), 'application/octet-stream')
    
    return FileResponse(
        output_file,
        media_type=media_type,
        filename=output_name
    )
