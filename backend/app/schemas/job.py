from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobCreate(BaseModel):
    dpi: int = 200
    format: str = "png"
    zip: bool = True

class JobStatus(BaseModel):
    job_id: str
    filename: str
    status: str
    progress: dict
    error: Optional[str] = None
    created_at: datetime
    expires_at: datetime

class Jobimage(BaseModel):
    page: int
    url: str

class JobResult(BaseModel):
    job_id: str
    status: str
    total_pages: int
    images: List[Jobimage]
    zip_url: Optional[str] = None
