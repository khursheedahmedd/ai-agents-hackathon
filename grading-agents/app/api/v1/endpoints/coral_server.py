from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

# Mock agent registry for Coral server
AGENT_REGISTRY = {
    "ocr-agent": {
        "id": "ocr-agent",
        "name": "OCR Agent",
        "description": "OCR processing agent for document text extraction",
        "status": "running",
        "endpoint": "http://localhost:8000/api/v1/coral/agents/ocr-agent",
        "capabilities": ["text_extraction", "pdf_processing", "image_processing"]
    },
    "grading-agent": {
        "id": "grading-agent", 
        "name": "Grading Agent",
        "description": "AI grading agent for student assessment",
        "status": "running",
        "endpoint": "http://localhost:8000/api/v1/coral/agents/grading-agent",
        "capabilities": ["grading", "rubric_evaluation", "score_calculation"]
    },
    "feedback-agent": {
        "id": "feedback-agent",
        "name": "Feedback Agent", 
        "description": "Feedback generation agent for student improvement",
        "status": "running",
        "endpoint": "http://localhost:8000/api/v1/coral/agents/feedback-agent",
        "capabilities": ["feedback_generation", "performance_analysis", "suggestions"]
    },
    "document-agent": {
        "id": "document-agent",
        "name": "Document Agent",
        "description": "Document processing and formatting agent",
        "status": "running", 
        "endpoint": "http://localhost:8000/api/v1/coral/agents/document-agent",
        "capabilities": ["document_processing", "formatting", "metadata_extraction"]
    }
}

# Mock session registry
SESSIONS = {}

@router.get("/agents")
async def list_agents():
    """List all available agents for Coral server"""
    try:
        logger.info("Coral server requested agent list")
        return {
            "agents": list(AGENT_REGISTRY.values()),
            "total": len(AGENT_REGISTRY),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error listing agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")

@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent information"""
    try:
        if agent_id not in AGENT_REGISTRY:
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
        
        logger.info(f"Coral server requested agent info: {agent_id}")
        return {
            "agent": AGENT_REGISTRY[agent_id],
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent: {str(e)}")

@router.get("/sessions")
async def list_sessions():
    """List all active sessions"""
    try:
        logger.info("Coral server requested session list")
        return {
            "sessions": list(SESSIONS.values()),
            "total": len(SESSIONS),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")

@router.post("/sessions")
async def create_session(session_data: Dict[str, Any]):
    """Create a new session"""
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        session = {
            "id": session_id,
            "created_at": "2024-01-01T00:00:00Z",
            "status": "active",
            "participants": session_data.get("participants", []),
            "metadata": session_data.get("metadata", {})
        }
        
        SESSIONS[session_id] = session
        
        logger.info(f"Created new session: {session_id}")
        return {
            "session": session,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get specific session information"""
    try:
        if session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        logger.info(f"Coral server requested session info: {session_id}")
        return {
            "session": SESSIONS[session_id],
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

@router.post("/sessions/{session_id}/messages")
async def send_message_to_session(session_id: str, message_data: Dict[str, Any]):
    """Send a message to a session"""
    try:
        if session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Mock message processing
        import uuid
        message_id = str(uuid.uuid4())
        message = {
            "id": message_id,
            "session_id": session_id,
            "content": message_data.get("content", ""),
            "sender": message_data.get("sender", "system"),
            "timestamp": "2024-01-01T00:00:00Z",
            "mentions": message_data.get("mentions", [])
        }
        
        logger.info(f"Message sent to session {session_id}: {message_id}")
        return {
            "message": message,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message to session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str):
    """Get messages from a session"""
    try:
        if session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Mock message history
        messages = [
            {
                "id": "msg-1",
                "session_id": session_id,
                "content": "Session initialized",
                "sender": "system",
                "timestamp": "2024-01-01T00:00:00Z",
                "mentions": []
            }
        ]
        
        logger.info(f"Retrieved messages for session {session_id}")
        return {
            "messages": messages,
            "total": len(messages),
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

@router.get("/registry")
async def get_registry():
    """Get agent registry information"""
    try:
        logger.info("Coral server requested registry")
        return {
            "registry": {
                "agents": AGENT_REGISTRY,
                "sessions": SESSIONS,
                "version": "1.0.0",
                "status": "active"
            },
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error getting registry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get registry: {str(e)}")

@router.get("/health")
async def coral_server_health():
    """Health check for Coral server integration"""
    try:
        return {
            "status": "healthy",
            "service": "Coral Server Integration",
            "version": "1.0.0",
            "agents_registered": len(AGENT_REGISTRY),
            "active_sessions": len(SESSIONS),
            "details": {
                "fastapi_integration": True,
                "coral_protocol": "compatible",
                "agent_communication": "active"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")
