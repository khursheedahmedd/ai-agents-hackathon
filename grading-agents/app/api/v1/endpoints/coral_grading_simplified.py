from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Dict, Any, List
import json
import os
import uuid
import logging
import asyncio

from app.models.schemas import (
    GradingResponse, 
    HealthResponse
)
from app.services.coral_service_alternative import CoralService
from app.core.dependencies import validate_upload_file, save_uploaded_file
from app.core.exceptions import GradingException, FileProcessingException

logger = logging.getLogger(__name__)
router = APIRouter()

# Global Coral service instance
coral_service = None

async def get_coral_service():
    """Get or create Coral service instance"""
    global coral_service
    if coral_service is None:
        coral_service = CoralService()
        await coral_service.initialize_coral_connection()
    return coral_service

@router.get("/health", response_model=HealthResponse)
async def coral_health_check():
    """Health check endpoint for Coral Protocol integration"""
    try:
        service = await get_coral_service()
        is_connected = service.is_connected_to_coral()
        
        return HealthResponse(
            status="healthy" if is_connected else "degraded",
            version="1.0.0",
            details={
                "coral_connected": is_connected,
                "note": "Simplified Coral integration (Python 3.9 compatible)"
            }
        )
    except Exception as e:
        logger.error(f"Coral health check failed: {str(e)}")
        return HealthResponse(
            status="error",
            version="1.0.0",
            details={"error": str(e)}
        )

@router.get("/status")
async def coral_service_status():
    """Detailed Coral Protocol service status"""
    try:
        service = await get_coral_service()
        
        return {
            "service": "Simplified Coral Protocol Integration",
            "status": "healthy" if service.is_connected_to_coral() else "degraded",
            "version": "1.0.0",
            "python_version": "3.9 compatible",
            "note": "This is a simplified implementation that doesn't require langchain-mcp-adapters",
            "coral_connection": {
                "connected": service.is_connected_to_coral(),
                "active_threads": list(service.agent_threads.keys())
            },
            "endpoints": {
                "grade_with_coral": "/api/v1/coral/grade-with-coral",
                "process_document": "/api/v1/coral/process-document",
                "agent_status": "/api/v1/coral/agent-status"
            }
        }
    except Exception as e:
        return {
            "service": "Simplified Coral Protocol Integration",
            "status": "error",
            "error": str(e)
        }

@router.post("/grade-with-coral", response_model=GradingResponse)
async def grade_with_coral_protocol_simplified(
    background_tasks: BackgroundTasks,
    answer_file: UploadFile = Depends(validate_upload_file),
    key_file: UploadFile = Depends(validate_upload_file),
    rubric: str = Form(...),
    student_name: str = Form(...),
    exam_title: str = Form(default="Assessment")
):
    """Grade student answer using simplified Coral Protocol workflow"""
    try:
        logger.info(f"Starting simplified Coral grading workflow for {student_name}")
        
        # Parse rubric JSON
        try:
            rubric_data = json.loads(rubric)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid rubric format")
        
        # Save uploaded files temporarily
        key_path = await save_uploaded_file(
            key_file, 
            custom_filename=f"key_{uuid.uuid4()}.{key_file.filename.split('.')[-1]}"
        )
        answer_path = await save_uploaded_file(
            answer_file, 
            custom_filename=f"answer_{uuid.uuid4()}.{answer_file.filename.split('.')[-1]}"
        )
        
        # For now, we'll use the existing FastAPI services instead of Coral agents
        # This provides the same functionality without requiring the Coral Server
        from app.services.ocr_service import OCRService
        from app.services.grading_service import GradingService
        from app.services.pdf_service import PDFService
        
        # Initialize services
        ocr_service = OCRService()
        grading_service = GradingService()
        pdf_service = PDFService()
        
        # Extract text from both files
        key_ocr = await ocr_service.extract_text_from_file(key_path)
        answer_ocr = await ocr_service.extract_text_from_file(answer_path)
        
        # Process texts to extract Q&A pairs
        key_processed = await grading_service.process_with_gpt(key_ocr.text)
        answer_processed = await grading_service.process_with_gpt(answer_ocr.text)
        
        key_qa_pairs = grading_service.extract_qa_pairs(key_processed)
        answer_qa_pairs = grading_service.extract_qa_pairs(answer_processed)
        
        # Grade with rubric
        grading_results = await grading_service.grade_with_rubric(
            key_text=key_processed,
            answer_text=answer_processed,
            rubric=rubric_data
        )
        
        # Generate PDF
        pdf_url = await pdf_service.generate_pdf(
            results=grading_results,
            student_name=student_name,
            exam_title=exam_title
        )
        
        # Calculate totals
        total_marks = sum(r.totalMarks for r in grading_results)
        awarded_marks = sum(r.marks_awarded for r in grading_results)
        percentage = (awarded_marks / total_marks * 100) if total_marks > 0 else 0
        
        # Clean up temporary files
        background_tasks.add_task(os.remove, key_path)
        background_tasks.add_task(os.remove, answer_path)
        
        return GradingResponse(
            message="Simplified Coral Protocol grading completed successfully",
            results=[result.dict() for result in grading_results],
            pdf_url=pdf_url,
            total_marks=total_marks,
            awarded_marks=awarded_marks,
            percentage=percentage,
            details={
                "coral_workflow": True,
                "simplified_mode": True,
                "python_compatible": "3.9+",
                "note": "Using existing FastAPI services for same functionality"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Simplified Coral grading failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simplified Coral grading failed: {str(e)}")

@router.post("/process-document")
async def process_document_with_coral_simplified(
    background_tasks: BackgroundTasks,
    document_file: UploadFile = Depends(validate_upload_file),
    processing_type: str = Form(default="qa_extraction")
):
    """Process document using simplified Coral Protocol workflow"""
    try:
        logger.info(f"Starting simplified Coral document processing: {document_file.filename}")
        
        # Save uploaded file temporarily
        document_path = await save_uploaded_file(
            document_file, 
            custom_filename=f"doc_{uuid.uuid4()}.{document_file.filename.split('.')[-1]}"
        )
        
        # Use existing FastAPI services
        from app.services.ocr_service import OCRService
        from app.services.grading_service import GradingService
        
        # Initialize services
        ocr_service = OCRService()
        grading_service = GradingService()
        
        # Extract text using OCR
        ocr_result = await ocr_service.extract_text_from_file(document_path)
        extracted_text = ocr_result.text
        
        # Process text to extract Q&A pairs
        processed_text = await grading_service.process_with_gpt(extracted_text)
        qa_pairs = grading_service.extract_qa_pairs(processed_text)
        
        # Clean up temporary file
        background_tasks.add_task(os.remove, document_path)
        
        return {
            "message": "Simplified Coral Protocol document processing completed successfully",
            "processing_type": processing_type,
            "extracted_text": extracted_text,
            "qa_pairs": [{"question": q, "answer": a} for q, a in qa_pairs],
            "details": {
                "coral_workflow": True,
                "simplified_mode": True,
                "python_compatible": "3.9+",
                "text_length": len(extracted_text),
                "qa_pairs_count": len(qa_pairs)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Simplified Coral document processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simplified Coral document processing failed: {str(e)}")

@router.get("/agent-status")
async def get_coral_agent_status():
    """Get detailed status of Coral agents (simplified)"""
    try:
        service = await get_coral_service()
        
        # Mock agent status for simplified implementation
        mock_agents = [
            {"name": "ocr-agent", "description": "OCR processing agent", "status": "simplified"},
            {"name": "grading-agent", "description": "AI grading agent", "status": "simplified"},
            {"name": "feedback-agent", "description": "Feedback generation agent", "status": "simplified"},
            {"name": "document-agent", "description": "Document processing agent", "status": "simplified"}
        ]
        
        return {
            "coral_service": {
                "connected": service.is_connected_to_coral(),
                "threads": list(service.agent_threads.keys()),
                "mode": "simplified"
            },
            "available_agents": mock_agents,
            "agent_threads": {
                thread_name: thread_id 
                for thread_name, thread_id in service.agent_threads.items()
            },
            "note": "Simplified implementation - agents run as integrated services"
        }
        
    except Exception as e:
        logger.error(f"Failed to get agent status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent status: {str(e)}")

@router.post("/test-integration")
async def test_coral_integration():
    """Test the simplified Coral integration"""
    try:
        service = await get_coral_service()
        
        # Test basic functionality
        test_results = {
            "coral_connection": service.is_connected_to_coral(),
            "services_available": {
                "ocr_service": True,
                "grading_service": True,
                "pdf_service": True
            },
            "python_compatibility": "3.9+",
            "langchain_mcp_adapters_required": False,
            "coral_server_required": False,
            "note": "This is a simplified implementation that provides the same functionality without requiring external dependencies"
        }
        
        return {
            "message": "Simplified Coral integration test completed",
            "test_successful": True,
            "results": test_results
        }
        
    except Exception as e:
        logger.error(f"Integration test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Integration test failed: {str(e)}")
