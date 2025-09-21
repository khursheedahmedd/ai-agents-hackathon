from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Union
from app.models.schemas import ErrorResponse

logger = logging.getLogger(__name__)

class SmartGradeException(Exception):
    """Base exception for Smart Grade AI"""
    def __init__(self, message: str, detail: str = None):
        self.message = message
        self.detail = detail
        super().__init__(self.message)

class OCRException(SmartGradeException):
    """OCR processing exception"""
    pass

class GradingException(SmartGradeException):
    """Grading process exception"""
    pass

class PDFGenerationException(SmartGradeException):
    """PDF generation exception"""
    pass

class FileProcessingException(SmartGradeException):
    """File processing exception"""
    pass

class AIProcessingException(SmartGradeException):
    """AI model processing exception"""
    pass

class WorkflowException(SmartGradeException):
    """LangGraph workflow exception"""
    pass

def create_error_response(
    status_code: int,
    message: str,
    detail: str = None
) -> JSONResponse:
    """Create standardized error response"""
    # Ensure all data is JSON serializable
    safe_message = str(message) if message else "Unknown error"
    safe_detail = str(detail) if detail else None
    
    error_response = ErrorResponse(
        error=safe_message,
        detail=safe_detail
    )
    return JSONResponse(
        status_code=status_code,
        content=error_response.dict()
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return create_error_response(
        status_code=exc.status_code,
        message=exc.detail,
        detail=f"HTTP {exc.status_code} error"
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation exceptions"""
    logger.error(f"Validation Error: {exc.errors()}")
    # Convert validation errors to JSON serializable format
    errors_list = []
    for error in exc.errors():
        errors_list.append({
            "type": error.get("type", "unknown"),
            "loc": error.get("loc", []),
            "msg": error.get("msg", "Unknown validation error"),
            "input": str(error.get("input", "")) if error.get("input") is not None else None
        })
    
    return create_error_response(
        status_code=422,
        message="Validation error",
        detail=f"Validation failed: {errors_list}"
    )

async def smart_grade_exception_handler(request: Request, exc: SmartGradeException):
    """Handle custom Smart Grade exceptions"""
    logger.error(f"Smart Grade Exception: {exc.message} - {exc.detail}")
    return create_error_response(
        status_code=500,
        message=exc.message,
        detail=exc.detail
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return create_error_response(
        status_code=500,
        message="Internal server error",
        detail="An unexpected error occurred"
    )

def setup_exception_handlers(app):
    """Setup all exception handlers"""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SmartGradeException, smart_grade_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
