from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path

from app.config import settings
from app.core.exceptions import setup_exception_handlers
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Smart Grade AI FastAPI...")
    
    # Ensure required directories exist
    directories = [
        settings.UPLOAD_FOLDER,
        settings.PDF_FOLDER,
        settings.ANSWER_KEYS_FOLDER,
        "static/fonts"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Ensured directory exists: {directory}")
    
    # Validate configuration
    required_env_vars = [
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_ENDPOINT", 
        "AZURE_OPENAI_DEPLOYMENT_NAME",
        "MISTRAL_API_KEY",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET"
    ]
    
    missing_vars = [var for var in required_env_vars if not getattr(settings, var, None)]
    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
    
    logger.info("Smart Grade AI FastAPI started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Smart Grade AI FastAPI...")

# Create FastAPI application
app = FastAPI(
    title="Smart Grade AI API",
    description="""
    AI-powered grading system with Coral Protocol integration.
    """,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Setup exception handlers
setup_exception_handlers(app)

@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Grade AI API is running!",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/v1/grading/health"
    }

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "service": "Smart Grade AI API"
    }

@app.get("/api/v1/health", tags=["health"])
async def detailed_health_check():
    """Detailed health check for Node.js backend integration"""
    try:
        from app.services.node_integration_service import NodeIntegrationService
        
        # Check FastAPI services
        fastapi_status = {
            "status": "healthy",
            "version": settings.VERSION,
            "services": {
                "azure_openai": "configured" if settings.AZURE_OPENAI_API_KEY else "missing",
                "mistral": "configured" if settings.MISTRAL_API_KEY else "missing",
                "cloudinary": "configured" if settings.CLOUDINARY_CLOUD_NAME else "missing"
            }
        }
        
        # Check Node.js backend connectivity
        node_service = NodeIntegrationService()
        node_status = await node_service.check_node_backend_health()
        
        return {
            "fastapi": fastapi_status,
            "node_backend": node_status,
            "integration": "ready" if node_status["status"] == "healthy" else "degraded"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "fastapi": {"status": "error"},
            "node_backend": {"status": "unreachable"}
        }

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"The requested resource {request.url.path} was not found",
            "available_endpoints": [
                "/docs - API Documentation",
                "/health - Health Check",
                "/api/v1/grading/health - Detailed Health Check",
                "/api/v1/grading/grade - Grade with Workflow",
                "/api/v1/grading/grade-simple - Simple Grading",
                "/api/v1/grading/upload-key - Upload Answer Key",
                "/api/v1/grading/generate-excel - Generate Excel Report"
            ]
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
