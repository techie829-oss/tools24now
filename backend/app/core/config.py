import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "tools24now.com"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/tools24now")
    
    # Storage
    STORAGE_ROOT: str = os.getenv("STORAGE_ROOT", "storage")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Limits
    MAX_UPLOAD_SIZE_MB: int = 50
    MAX_PAGES: int = 200
    DEFAULT_DPI: int = 200
    
    class Config:
        env_file = ".env"

settings = Settings()
