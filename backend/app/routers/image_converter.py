"""
Image Converter API Router
Handles image format conversion
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import uuid
import json

from app.tools.image_converter import ImageConverterTool

router = APIRouter(prefix="/image-converter", tags=["image-converter"])

# Job storage directory
JOBS_DIR = Path("data/image_converter_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class CreateJobResponse(BaseModel):
    job_id: str
    message: str
    image_info: dict


class ConvertRequest(BaseModel):
    format: str  # Target format
    quality: int = 85  # Quality (1-100) for lossy formats
    target_size_kb: Optional[int] = None  # Target file size in KB
    max_width: Optional[int] = None  # Maximum width for resizing
    max_height: Optional[int] = None  # Maximum height for resizing
    preserve_exif: bool = True  # Preserve EXIF metadata


class JobStatus(BaseModel):
    job_id: str
    status: str  # 'uploaded', 'processing', 'completed', 'failed'
    error: Optional[str] = None
    result: Optional[dict] = None  # Conversion results when completed


@router.post("/jobs", response_model=CreateJobResponse)
async def create_image_converter_job(file: UploadFile = File(...)):
    """Upload image and create conversion job"""
    
    # Validate file type
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', '.gif']
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
    converter = ImageConverterTool()
    try:
        image_info = converter.get_image_info(str(input_path))
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


@router.post("/jobs/{job_id}/convert")
async def convert_image(job_id: str, request: ConvertRequest, background_tasks: BackgroundTasks):
    """Convert the image to specified format"""
    
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Load metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    # Validate format
    converter = ImageConverterTool()
    target_format = request.format.lower()
    if target_format not in converter.SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format. Supported: {converter.SUPPORTED_FORMATS}"
        )
    
    # Update metadata
    metadata['status'] = 'processing'
    metadata['target_format'] = target_format
    metadata['quality'] = request.quality
    
    with (job_dir / "metadata.json").open("w") as f:
        json.dump(metadata, f)
    
    # Process in background
    background_tasks.add_task(
        process_image_conversion, 
        job_id, 
        target_format, 
        request.quality,
        request.target_size_kb,
        request.max_width,
        request.max_height,
        request.preserve_exif
    )
    
    return {"message": "Conversion started", "job_id": job_id}


def process_image_conversion(
    job_id: str, 
    target_format: str, 
    quality: int,
    target_size_kb: Optional[int] = None,
    max_width: Optional[int] = None,
    max_height: Optional[int] = None,
    preserve_exif: bool = True
):
    """Background task to convert image with advanced options"""
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
    
    # Normalize format extension
    format_ext = target_format if target_format != 'jpeg' else 'jpg'
    output_path = job_dir / f"output.{format_ext}"
    
    try:
        converter = ImageConverterTool()
        result = converter.convert_image(
            str(input_file),
            str(output_path),
            target_format,
            quality=quality,
            target_size_kb=target_size_kb,
            max_width=max_width,
            max_height=max_height,
            preserve_exif=preserve_exif
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
async def get_image_converter_status(job_id: str):
    """Get conversion job status"""
    
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
async def download_converted_image(job_id: str):
    """Download the converted image"""
    
    job_dir = JOBS_DIR / job_id
    
    # Find output file
    output_file = None
    for f in job_dir.glob("output.*"):
        output_file = f
        break
    
    if not output_file or not output_file.exists():
        raise HTTPException(status_code=404, detail="Converted image not ready")
    
    # Get original filename from metadata
    with (job_dir / "metadata.json").open("r") as f:
        metadata = json.load(f)
    
    original_name = Path(metadata.get('filename', 'image')).stem
    target_format = metadata.get('target_format', 'png')
    output_name = f"{original_name}.{target_format}"
    
    # Determine media type
    media_types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'avif': 'image/avif',
        'bmp': 'image/bmp',
        'gif': 'image/gif'
    }
    
    media_type = media_types.get(target_format, 'application/octet-stream')
    
    return FileResponse(
        output_file,
        media_type=media_type,
        filename=output_name
    )
