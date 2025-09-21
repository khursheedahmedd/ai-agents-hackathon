from pydantic_settings import BaseSettings
from typing import List, Set
import os
from pathlib import Path

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Smart Grade AI"
    VERSION: str = "1.0.0"
    
    # CORS - Updated for Node.js backend integration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",  # Node.js backend
        "http://localhost:5173",  # Frontend (Vite)
        "http://localhost:5174",  # Frontend (alternative port)
        "http://localhost:8080",  # Alternative frontend port
        "http://127.0.0.1:3000",  # Node.js backend (localhost)
        "http://127.0.0.1:5173",  # Frontend (localhost)
        "https://www.smartgradeai.com",  # Production frontend
    ]
    
    # File Upload Settings
    UPLOAD_FOLDER: str = "static/uploads"
    PDF_FOLDER: str = "static/reports"
    ANSWER_KEYS_FOLDER: str = "static/answer_keys"
    ALLOWED_EXTENSIONS: Set[str] = {"pdf", "jpg", "jpeg", "png"}
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # AI Services Configuration
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_DEPLOYMENT_NAME: str = ""
    MISTRAL_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # LangGraph Configuration
    LANGGRAPH_DEBUG: bool = False
    
    # Node.js Backend Integration
    NODE_SERVER_URL: str = "http://localhost:3000"
    NODE_API_BASE: str = "/api"
    
    # Coral Protocol Configuration
    CORAL_SSE_URL: str = "http://localhost:8080/sse"
    CORAL_MAIN_AGENT_ID: str = "fastapi-grading-system"
    CORAL_OCR_AGENT_ID: str = "ocr-agent"
    CORAL_GRADING_AGENT_ID: str = "grading-agent"
    CORAL_FEEDBACK_AGENT_ID: str = "feedback-agent"
    CORAL_DOCUMENT_AGENT_ID: str = "document-agent"
    CORAL_ORCHESTRATION_RUNTIME: str = ""
    TIMEOUT_MS: int = 30000
    
    # Legacy environment variables (for compatibility)
    ENDPOINT_URL: str = ""
    FRONTEND_URL: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure directories exist
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            self.UPLOAD_FOLDER,
            self.PDF_FOLDER,
            self.ANSWER_KEYS_FOLDER
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)

settings = Settings()
