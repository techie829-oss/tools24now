import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tools24Now"
    API_V1_STR: str = "/api"
    
    # Database Configuration
    # Priority: DATABASE_URL > Constructed URL from vars
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Generic Database Variables
    DB_TYPE: str = os.getenv("DB_TYPE", "sqlite")  # mysql, postgresql, sqlite
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "tools24now")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # If DATABASE_URL is not set, construct it based on DB_TYPE
        if not self.DATABASE_URL:
            from urllib.parse import quote_plus
            user = quote_plus(self.DB_USER)
            password = quote_plus(self.DB_PASSWORD)
            
            if self.DB_TYPE == "mysql":
                self.DATABASE_URL = f"mysql+pymysql://{user}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            elif self.DB_TYPE == "postgresql":
                # Default PG port if not changed
                port = self.DB_PORT if self.DB_PORT != "3306" else "5432" 
                self.DATABASE_URL = f"postgresql://{user}:{password}@{self.DB_HOST}:{port}/{self.DB_NAME}"
            elif self.DB_TYPE == "sqlite":
                # For SQLite, DB_NAME is the filename (e.g., ./data/app.db)
                db_path = self.DB_NAME if self.DB_NAME.endswith(".db") else f"./data/{self.DB_NAME}.db"
                self.DATABASE_URL = f"sqlite:///{db_path}"

    
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

    # CORS / Host
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]
    ALLOWED_ORIGINS: list[str] = ["*"]  # Update in production!

settings = Settings()
