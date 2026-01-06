from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import List
import shutil
import os
from app.core.limiter import limiter


from app.db.session import get_db
from app.db.models import Admin, Job
from app.core import security
from app.core.config import settings
from app.schemas.job import JobStatus
from app.services.storage import storage

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/admin/login")

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except security.jwt.JWTError:
        raise credentials_exception
        
    admin = db.query(Admin).filter(Admin.username == username).first()
    if admin is None:
        raise credentials_exception
    return admin

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    if not admin or not security.verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_admin_me(current_admin: Admin = Depends(get_current_admin)):
    return {"username": current_admin.username}

@router.get("/stats")
def get_stats(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_jobs = db.query(Job).count()
    completed_jobs = db.query(Job).filter(Job.status == "completed").count()
    failed_jobs = db.query(Job).filter(Job.status == "failed").count()
    
    # Calculate storage usage (approximate)
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(settings.STORAGE_ROOT):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
            
    total_size_mb = total_size / (1024 * 1024)
    
    return {
        "jobs": {
            "total": total_jobs,
            "completed": completed_jobs,
            "failed": failed_jobs
        },
        "storage": {
            "used_mb": round(total_size_mb, 2)
        }
    }

@router.get("/jobs")
def list_jobs(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db)):
    query = db.query(Job)
    if status and status != "all":
        query = query.filter(Job.status == status)
    
    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    
    # Needs a schema for list response, reusing simplified dict for now
    return [{
        "id": job.id,
        "status": job.status,
        "created_at": job.created_at,
        "pages": job.total_pages,
        "size_mb": round((job.file_size_bytes or 0) / (1024*1024), 2)
    } for job in jobs]

@router.post("/cleanup")
def trigger_cleanup(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Delete expired jobs
    now = datetime.utcnow()
    expired_jobs = db.query(Job).filter(Job.expires_at < now).all()
    count = 0
    
    for job in expired_jobs:
        # Remove files
        storage.delete_job_files(job.id)
        # Update status or delete? Let's delete for cleanup
        db.delete(job)
        count += 1
        
    db.commit()
    return {"deleted_jobs": count}
