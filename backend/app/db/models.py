import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, BigInteger
from app.db.session import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tool = Column(String(50), index=True, default="pdf_to_images")
    status = Column(String(20), index=True, default="queued")  # queued, processing, completed, failed, expired
    
    original_filename = Column(String(255))
    mime_type = Column(String(100))
    file_size_bytes = Column(BigInteger)
    
    input_path = Column(String(512))
    output_dir = Column(String(512))
    zip_path = Column(String(512), nullable=True)
    
    output_format = Column(String(20), default="png")
    dpi = Column(Integer, default=200)
    
    total_pages = Column(Integer, nullable=True)
    processed_pages = Column(Integer, default=0)
    page_order = Column(Text, nullable=True)  # CSV of page indices for organize tool
    
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    
    request_ip = Column(String(45), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, index=True)

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))
