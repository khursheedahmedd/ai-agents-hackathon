import httpx
import asyncio
from typing import Dict, Any, Optional
from app.config import settings
from app.core.exceptions import AIProcessingException

class NodeIntegrationService:
    """Service for communicating with Node.js backend"""
    
    def __init__(self):
        self.node_base_url = settings.NODE_SERVER_URL
        self.timeout = httpx.Timeout(30.0)
    
    async def check_node_backend_health(self) -> Dict[str, Any]:
        """Check if Node.js backend is healthy"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.node_base_url}/")
                return {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "status_code": response.status_code,
                    "response": response.text
                }
        except Exception as e:
            return {
                "status": "unreachable",
                "error": str(e)
            }
    
    async def notify_grading_complete(
        self, 
        task_id: str, 
        student_id: str, 
        grading_results: Dict[str, Any]
    ) -> bool:
        """Notify Node.js backend that grading is complete"""
        try:
            payload = {
                "task_id": task_id,
                "student_id": student_id,
                "grading_results": grading_results,
                "status": "completed"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.node_base_url}/api/grading/complete",
                    json=payload
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Failed to notify Node.js backend: {e}")
            return False
    
    async def get_student_info(self, student_email: str) -> Optional[Dict[str, Any]]:
        """Get student information from Node.js backend"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.node_base_url}/api/students/info",
                    params={"email": student_email}
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Failed to get student info: {e}")
            return None
    
    async def get_assessment_info(self, folder_id: str) -> Optional[Dict[str, Any]]:
        """Get assessment information from Node.js backend"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.node_base_url}/api/folders/{folder_id}"
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Failed to get assessment info: {e}")
            return None
    
    async def update_grading_status(
        self, 
        task_id: str, 
        status: str, 
        error_message: str = None
    ) -> bool:
        """Update grading status in Node.js backend"""
        try:
            payload = {
                "task_id": task_id,
                "status": status,
                "error_message": error_message
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.put(
                    f"{self.node_base_url}/api/grading/status",
                    json=payload
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Failed to update grading status: {e}")
            return False
