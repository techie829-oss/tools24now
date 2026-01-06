"""
Cleanup Service - Automatically delete expired jobs and their files
"""
import os
import shutil
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.models import Job
from app.db.session import SessionLocal
import logging

logger = logging.getLogger(__name__)


def cleanup_expired_jobs():
    """
    Delete expired jobs and their associated files.
    Should be called periodically (e.g., every hour).
    """
    db: Session = SessionLocal()
    
    try:
        # Find all expired jobs
        now = datetime.now(timezone.utc).replace(tzinfo=None)  # SQLite stores naive datetime
        expired_jobs = db.query(Job).filter(Job.expires_at < now).all()
        
        deleted_count = 0
        freed_bytes = 0
        
        for job in expired_jobs:
            try:
                # Delete job directory and all files
                job_dir = f"storage/jobs/{job.id}"
                
                if os.path.exists(job_dir):
                    # Calculate size before deletion
                    dir_size = get_directory_size(job_dir)
                    freed_bytes += dir_size
                    
                    # Delete directory
                    shutil.rmtree(job_dir)
                    logger.info(f"Deleted job directory: {job_dir} ({dir_size / 1024 / 1024:.2f} MB)")
                
                # Delete job record from database
                db.delete(job)
                deleted_count += 1
                
            except Exception as e:
                logger.error(f"Error deleting job {job.id}: {e}")
                continue
        
        db.commit()
        
        if deleted_count > 0:
            logger.info(
                f"Cleanup completed: Deleted {deleted_count} expired jobs, "
                f"freed {freed_bytes / 1024 / 1024:.2f} MB"
            )
        
        return {
            "deleted_jobs": deleted_count,
            "freed_bytes": freed_bytes
        }
        
    except Exception as e:
        logger.error(f"Cleanup error: {e}")
        db.rollback()
        return {"error": str(e)}
    
    finally:
        db.close()


def get_directory_size(path: str) -> int:
    """Calculate total size of directory in bytes."""
    total_size = 0
    
    for dirpath, dirnames, filenames in os.walk(path):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    
    return total_size


def cleanup_old_jobs_on_startup():
    """
    Run cleanup once on application startup.
    Useful for cleaning up jobs that expired while server was down.
    """
    logger.info("Running startup cleanup...")
    result = cleanup_expired_jobs()
    
    if "error" not in result:
        logger.info(f"Startup cleanup: {result['deleted_jobs']} jobs deleted")
    else:
        logger.error(f"Startup cleanup failed: {result['error']}")
