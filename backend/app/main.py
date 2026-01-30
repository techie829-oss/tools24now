from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Cleanup scheduler
from app.services.cleanup import cleanup_old_jobs_on_startup
from app.services.scheduler import scheduler

@app.on_event("startup")
async def startup_event():
    """Run cleanup on startup and start periodic scheduler."""
    cleanup_old_jobs_on_startup()
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    """Stop scheduler on shutdown."""
    scheduler.stop()

from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter
from app.core.templates import templates
import os

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from fastapi.middleware.cors import CORSMiddleware

# Security Headers (Basic)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Mount static directory for assets (CSS/JS)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API Controllers (JSON)
from app.controllers.api import jobs as api_jobs
from app.controllers.api import files as api_files
from app.controllers.api import admin as api_admin
from app.controllers.api import organize as api_organize
from app.controllers.api import merge as api_merge
from app.controllers.api import compress as api_compress
from app.controllers.api import ocr as api_ocr # Added for OCR
from app.controllers.api import deskew as api_deskew # Added for Deskew
from app.controllers.api import cleanup_admin
from app.routers import split_pdf  # Split PDF router
from app.routers import pdf_to_word  # PDF to Word router
from app.routers import image_converter  # Image Converter router
from app.routers import image_compressor  # Image Compressor router
from app.routers import image_resizer  # Image Resizer router
from app.routers import image_cropper  # Image Cropper router
from app.routers import image_filters  # Image Filters router
from app.routers import image_rotate  # Image Rotate & Flip router
from app.routers import image_watermark  # Image Watermark router
from app.routers import markdown_pdf  # Markdown to PDF router
from app.controllers.api import table_extractor # Added for Table Extractor
from app.controllers.api import receipt_scanner # Added for Receipt Scanner
from app.controllers.api import network_tools # Added for Network Tools
from app.controllers.api import security_tools # Added for Security Tools
from app.db.session import Base, engine

Base.metadata.create_all(bind=engine)

app.include_router(api_jobs.router, prefix=settings.API_V1_STR, tags=["api_jobs"])
app.include_router(api_files.router, prefix="/files", tags=["api_files"])
app.include_router(api_admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["api_admin"])
app.include_router(api_organize.router, prefix=settings.API_V1_STR, tags=["api_organize"])
app.include_router(api_merge.router, prefix=settings.API_V1_STR, tags=["api_merge"])
app.include_router(api_compress.router, prefix=settings.API_V1_STR, tags=["api_compress"])
app.include_router(api_ocr.router, prefix=settings.API_V1_STR, tags=["api_ocr"])
app.include_router(api_deskew.router, prefix=settings.API_V1_STR, tags=["api_deskew"])
app.include_router(table_extractor.router, prefix=settings.API_V1_STR, tags=["api_table_extractor"])
app.include_router(split_pdf.router, prefix=settings.API_V1_STR, tags=["split_pdf"])
app.include_router(pdf_to_word.router, prefix=settings.API_V1_STR, tags=["pdf_to_word"])
app.include_router(image_converter.router, prefix=settings.API_V1_STR, tags=["image_converter"])
app.include_router(image_compressor.router, prefix=settings.API_V1_STR, tags=["image_compressor"])
app.include_router(image_resizer.router, prefix=settings.API_V1_STR, tags=["image_resizer"])
app.include_router(image_cropper.router, prefix=settings.API_V1_STR, tags=["image_cropper"])
app.include_router(image_filters.router, prefix=settings.API_V1_STR, tags=["image_filters"])
app.include_router(image_rotate.router, prefix=settings.API_V1_STR, tags=["image_rotate"])
app.include_router(image_watermark.router, prefix=settings.API_V1_STR, tags=["image_watermark"])
app.include_router(markdown_pdf.router, prefix=settings.API_V1_STR, tags=["markdown_pdf"])
app.include_router(receipt_scanner.router, prefix=settings.API_V1_STR, tags=["Receipt Scanner"])
app.include_router(network_tools.router, prefix=settings.API_V1_STR, tags=["Network Tools"])
app.include_router(security_tools.router, prefix=settings.API_V1_STR, tags=["Security Tools"])

# Web Controllers (HTML)
# Currently only Landing Page (root) and Admin (via api_admin) are served.
# Flutter App uses the API controllers above.
from app.controllers.web import admin as web_admin
app.include_router(web_admin.router, prefix="/admin", tags=["web_admin"])
