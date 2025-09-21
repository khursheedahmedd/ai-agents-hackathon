from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Dict, Any, List
import json
import os
import uuid
import logging

from app.models.schemas import (
    GradingResponse, 
    HealthResponse
)
from app.services.coral_workflow_service import CoralWorkflowService
from app.core.dependencies import validate_upload_file, save_uploaded_file
from app.core.exceptions import GradingException, FileProcessingException

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def coral_health_check():
    """Health check endpoint for Coral Protocol integration"""
    try:
        coral_service = CoralWorkflowService()
        status = coral_service.get_agent_status()
        
        return HealthResponse(
            status="healthy" if status["is_connected"] else "degraded",
            version="1.0.0",
            details={
                "coral_connected": status["is_connected"],
                "agents_initialized": status["is_initialized"],
                "active_threads": status["thread_count"]
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
        coral_service = CoralWorkflowService()
        status = coral_service.get_agent_status()
        
        return {
            "service": "Coral Protocol Integration",
            "status": "healthy" if status["is_connected"] else "degraded",
            "version": "1.0.0",
            "coral_connection": {
                "connected": status["is_connected"],
                "initialized": status["is_initialized"],
                "active_threads": status["agent_threads"]
            },
            "endpoints": {
                "grade_with_coral": "/api/v1/coral/grade-with-coral",
                "process_document": "/api/v1/coral/process-document",
                "agent_status": "/api/v1/coral/agent-status"
            }
        }
    except Exception as e:
        return {
            "service": "Coral Protocol Integration",
            "status": "error",
            "error": str(e)
        }

@router.post("/grade-with-coral", response_model=GradingResponse)
async def grade_with_coral_protocol(
    background_tasks: BackgroundTasks,
    answer_file: UploadFile = Depends(validate_upload_file),
    key_file: UploadFile = Depends(validate_upload_file),
    rubric: str = Form(...),
    student_name: str = Form(...),
    exam_title: str = Form(default="Assessment")
):
    """Grade student answer using Coral Protocol multi-agent system"""
    try:
        logger.info(f"Starting Coral grading workflow for {student_name}")
        
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
        
        # Initialize Coral workflow service
        coral_service = CoralWorkflowService()
        
        # Initialize Coral agents if not already done
        if not coral_service.is_initialized:
            if not await coral_service.initialize_coral_agents():
                raise HTTPException(status_code=500, detail="Failed to initialize Coral agents")
        
        # Run Coral grading workflow
        result = await coral_service.run_coral_grading_workflow(
            key_path=key_path,
            answer_path=answer_path,
            rubric=rubric_data,
            student_name=student_name,
            exam_title=exam_title
        )
        
        # Clean up temporary files
        background_tasks.add_task(coral_service.cleanup_temp_files, [key_path, answer_path])
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Calculate percentage
        total_marks = result.get("total_marks", 0)
        awarded_marks = result.get("awarded_marks", 0)
        percentage = (awarded_marks / total_marks * 100) if total_marks > 0 else 0
        
        return GradingResponse(
            message="Coral Protocol grading completed successfully",
            results=result.get("results", []),
            pdf_url=result.get("pdf_url", ""),
            total_marks=total_marks,
            awarded_marks=awarded_marks,
            percentage=percentage,
            details={
                "coral_workflow": True,
                "agent_responses": len(result.get("agent_responses", [])),
                "feedback": result.get("feedback", "")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Coral grading failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Coral grading failed: {str(e)}")

@router.post("/process-document")
async def process_document_with_coral(
    background_tasks: BackgroundTasks,
    document_file: UploadFile = Depends(validate_upload_file),
    processing_type: str = Form(default="qa_extraction")
):
    """Process document using Coral Protocol agents"""
    try:
        logger.info(f"Starting Coral document processing: {document_file.filename}")
        
        # Save uploaded file temporarily
        document_path = await save_uploaded_file(
            document_file, 
            custom_filename=f"doc_{uuid.uuid4()}.{document_file.filename.split('.')[-1]}"
        )
        
        # Initialize Coral workflow service
        coral_service = CoralWorkflowService()
        
        # Initialize Coral agents if not already done
        if not coral_service.is_initialized:
            if not await coral_service.initialize_coral_agents():
                raise HTTPException(status_code=500, detail="Failed to initialize Coral agents")
        
        # Run Coral document processing workflow
        result = await coral_service.run_coral_document_processing(
            file_path=document_path,
            processing_type=processing_type
        )
        
        # Clean up temporary file
        background_tasks.add_task(coral_service.cleanup_temp_files, [document_path])
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "message": "Coral Protocol document processing completed successfully",
            "processing_type": processing_type,
            "extracted_text": result.get("extracted_text", ""),
            "qa_pairs": result.get("qa_pairs", []),
            "details": {
                "coral_workflow": True,
                "agent_responses": len(result.get("agent_responses", [])),
                "text_length": len(result.get("extracted_text", "")),
                "qa_pairs_count": len(result.get("qa_pairs", []))
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Coral document processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Coral document processing failed: {str(e)}")

@router.get("/agent-status")
async def get_coral_agent_status():
    """Get detailed status of Coral agents"""
    try:
        coral_service = CoralWorkflowService()
        status = coral_service.get_agent_status()
        
        # Get list of agents if connected
        agents = []
        if status["is_connected"]:
            try:
                agents = await coral_service.coral_service.list_agents()
            except Exception as e:
                logger.warning(f"Failed to list agents: {str(e)}")
        
        return {
            "coral_service": status,
            "available_agents": [
                {
                    "name": agent.get("name", "unknown"),
                    "description": agent.get("description", ""),
                    "status": agent.get("status", "unknown")
                }
                for agent in agents
            ],
            "agent_threads": {
                thread_name: thread_id 
                for thread_name, thread_id in coral_service.agent_threads.items()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get agent status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent status: {str(e)}")

@router.post("/initialize-agents")
async def initialize_coral_agents():
    """Manually initialize Coral agents"""
    try:
        coral_service = CoralWorkflowService()
        
        if coral_service.is_initialized:
            return {
                "message": "Coral agents already initialized",
                "status": coral_service.get_agent_status()
            }
        
        success = await coral_service.initialize_coral_agents()
        
        if success:
            return {
                "message": "Coral agents initialized successfully",
                "status": coral_service.get_agent_status()
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to initialize Coral agents")
        
    except Exception as e:
        logger.error(f"Failed to initialize Coral agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize Coral agents: {str(e)}")

@router.post("/test-agent-communication")
async def test_coral_agent_communication():
    """Test communication between Coral agents"""
    try:
        coral_service = CoralWorkflowService()
        
        if not coral_service.is_initialized:
            if not await coral_service.initialize_coral_agents():
                raise HTTPException(status_code=500, detail="Failed to initialize Coral agents")
        
        # Test basic communication
        grading_thread_id = coral_service.agent_threads.get("grading")
        if not grading_thread_id:
            raise HTTPException(status_code=500, detail="Grading thread not found")
        
        # Send test message
        success = await coral_service.coral_service.send_message(
            thread_id=grading_thread_id,
            content="Test message from FastAPI - please respond if you can hear this",
            mentions=["ocr-agent", "grading-agent", "feedback-agent", "document-agent"]
        )
        
        if success:
            # Wait for responses
            responses = await coral_service.coral_service.wait_for_mentions(
                timeout_ms=10000,
                max_responses=4
            )
            
            return {
                "message": "Agent communication test completed",
                "test_successful": True,
                "responses_received": len(responses),
                "responses": responses
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send test message")
        
    except Exception as e:
        logger.error(f"Agent communication test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent communication test failed: {str(e)}")
