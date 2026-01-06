"""
Admin API endpoint for manual cleanup
"""
from fastapi import APIRouter
from app.services.cleanup import cleanup_expired_jobs

router = APIRouter()


@router.post("/cleanup")
async def trigger_cleanup():
    """
    Manually trigger cleanup of expired jobs.
    Useful for testing or immediate cleanup.
    """
    result = cleanup_expired_jobs()
    
    if "error" in result:
        return {
            "success": False,
            "error": result["error"]
        }
    
    return {
        "success": True,
        "deleted_jobs": result["deleted_jobs"],
        "freed_mb": round(result["freed_bytes"] / 1024 / 1024, 2)
    }
