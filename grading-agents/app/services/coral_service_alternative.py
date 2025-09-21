import urllib.parse
import os
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
import aiohttp
import sseclient

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class CoralService:
    """Service for managing Coral Protocol connections and agent communication"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.coral_tools: List[Any] = []
        self.agent_threads: Dict[str, str] = {}
        self.is_connected = False
    
    async def initialize_coral_connection(self) -> bool:
        """Initialize connection to Coral Server"""
        try:
            logger.info("Initializing Coral Server connection...")
            
            # Get Coral connection parameters
            base_url = os.getenv("CORAL_SSE_URL")
            agent_id = os.getenv("CORAL_MAIN_AGENT_ID", "fastapi-grading-system")
            
            if not base_url:
                logger.error("CORAL_SSE_URL environment variable not set")
                return False
            
            coral_params = {
                "agentId": agent_id,
                "agentDescription": "FastAPI Grading System Main Agent"
            }
            
            query_string = urllib.parse.urlencode(coral_params)
            coral_url = f"{base_url}?{query_string}"
            
            logger.info(f"Connecting to Coral Server: {coral_url}")
            
            # Initialize HTTP session
            self.session = aiohttp.ClientSession()
            
            # Test connection
            try:
                async with self.session.get(coral_url) as response:
                    if response.status == 200:
                        self.is_connected = True
                        logger.info("Coral Server connection established successfully")
                        return True
                    else:
                        logger.error(f"Coral Server connection failed: {response.status}")
                        return False
            except Exception as e:
                logger.error(f"Failed to connect to Coral Server: {str(e)}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to initialize Coral connection: {str(e)}")
            self.is_connected = False
            return False
    
    async def create_thread(self, thread_name: str, participant_ids: List[str]) -> Optional[str]:
        """Create a new thread for agent communication"""
        try:
            if not self.is_connected:
                logger.error("Coral connection not established")
                return None
            
            # Create thread via HTTP API
            thread_data = {
                "threadName": thread_name,
                "participantIds": participant_ids
            }
            
            # This would need to be implemented based on Coral Server API
            # For now, we'll generate a mock thread ID
            thread_id = f"thread_{thread_name}_{hash(str(participant_ids))}"
            self.agent_threads[thread_name] = thread_id
            
            logger.info(f"Created thread '{thread_name}' with ID: {thread_id}")
            return thread_id
            
        except Exception as e:
            logger.error(f"Error creating thread '{thread_name}': {str(e)}")
            return None
    
    async def send_message(self, thread_id: str, content: str, mentions: List[str] = None) -> bool:
        """Send a message to a thread"""
        try:
            if not self.is_connected:
                logger.error("Coral connection not established")
                return False
            
            # Send message via HTTP API
            message_data = {
                "threadId": thread_id,
                "content": content,
                "mentions": mentions or []
            }
            
            # This would need to be implemented based on Coral Server API
            logger.info(f"Sent message to thread {thread_id}: {content[:100]}...")
            return True
            
        except Exception as e:
            logger.error(f"Error sending message to thread {thread_id}: {str(e)}")
            return False
    
    async def wait_for_mentions(self, timeout_ms: int = 30000, max_responses: int = 1) -> List[Dict[str, Any]]:
        """Wait for mentions from other agents"""
        try:
            if not self.is_connected:
                logger.error("Coral connection not established")
                return []
            
            # This would need to be implemented based on Coral Server SSE API
            # For now, we'll return mock responses
            responses = []
            
            # Simulate waiting for responses
            await asyncio.sleep(min(timeout_ms / 1000, 5))
            
            # Mock response for testing
            mock_response = {
                "sender": "mock-agent",
                "content": "Mock response from agent",
                "timestamp": "2024-01-01T00:00:00Z"
            }
            responses.append(mock_response)
            
            logger.info(f"Received {len(responses)} mentions")
            return responses
            
        except Exception as e:
            logger.error(f"Error in wait_for_mentions: {str(e)}")
            return []
    
    async def list_agents(self) -> List[Dict[str, Any]]:
        """List all connected agents"""
        try:
            if not self.is_connected:
                logger.error("Coral connection not established")
                return []
            
            # This would need to be implemented based on Coral Server API
            # For now, we'll return mock agents
            agents = [
                {"name": "ocr-agent", "description": "OCR processing agent", "status": "connected"},
                {"name": "grading-agent", "description": "AI grading agent", "status": "connected"},
                {"name": "feedback-agent", "description": "Feedback generation agent", "status": "connected"},
                {"name": "document-agent", "description": "Document processing agent", "status": "connected"}
            ]
            
            logger.info(f"Retrieved {len(agents)} agents")
            return agents
            
        except Exception as e:
            logger.error(f"Error listing agents: {str(e)}")
            return []
    
    async def add_participant(self, thread_id: str, participant_ids: List[str]) -> bool:
        """Add participants to a thread"""
        try:
            if not self.is_connected:
                logger.error("Coral connection not established")
                return False
            
            # This would need to be implemented based on Coral Server API
            logger.info(f"Added participants {participant_ids} to thread {thread_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding participants to thread {thread_id}: {str(e)}")
            return False
    
    def get_thread_id(self, thread_name: str) -> Optional[str]:
        """Get thread ID by name"""
        return self.agent_threads.get(thread_name)
    
    def is_connected_to_coral(self) -> bool:
        """Check if connected to Coral Server"""
        return self.is_connected
    
    async def close(self):
        """Close the connection"""
        if self.session:
            await self.session.close()
            self.is_connected = False
