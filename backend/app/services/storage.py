import os
import shutil
from pathlib import Path
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.root = Path(settings.STORAGE_ROOT)
        self.root.mkdir(parents=True, exist_ok=True)

    def get_job_dir(self, job_id: str) -> Path:
        return self.root / job_id

    def create_job_dirs(self, job_id: str):
        job_dir = self.get_job_dir(job_id)
        job_dir.mkdir(parents=True, exist_ok=True)
        (job_dir / "output").mkdir(exist_ok=True)
        return job_dir

    async def save_upload(self, job_id: str, file_content: bytes, filename: str) -> str:
        job_dir = self.create_job_dirs(job_id)
        input_path = job_dir / "input.pdf"
        
        with open(input_path, "wb") as f:
            f.write(file_content)
            
        return str(input_path)

    def delete_job_files(self, job_id: str):
        job_dir = self.get_job_dir(job_id)
        if job_dir.exists():
            shutil.rmtree(job_dir)
            
storage = StorageService()
