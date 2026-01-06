"""
Background scheduler for periodic tasks like cleanup
"""
import threading
import time
import logging
from app.services.cleanup import cleanup_expired_jobs

logger = logging.getLogger(__name__)


class BackgroundScheduler:
    def __init__(self, interval_minutes: int = 60):
        self.interval_minutes = interval_minutes
        self.running = False
        self.thread = None
    
    def start(self):
        """Start the background scheduler."""
        if self.running:
            logger.warning("Scheduler already running")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        logger.info(f"Background scheduler started (interval: {self.interval_minutes} minutes)")
    
    def stop(self):
        """Stop the background scheduler."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Background scheduler stopped")
    
    def _run(self):
        """Main scheduler loop."""
        while self.running:
            try:
                # Wait for interval
                time.sleep(self.interval_minutes * 60)
                
                if not self.running:
                    break
                
                # Run cleanup
                logger.info("Running scheduled cleanup...")
                result = cleanup_expired_jobs()
                
                if "error" not in result:
                    logger.info(
                        f"Scheduled cleanup: {result['deleted_jobs']} jobs deleted, "
                        f"{result['freed_bytes'] / 1024 / 1024:.2f} MB freed"
                    )
                
            except Exception as e:
                logger.error(f"Scheduler error: {e}")


# Global scheduler instance
scheduler = BackgroundScheduler(interval_minutes=60)  # Run every hour
