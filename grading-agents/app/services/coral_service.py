import urllib.parse
import os
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from langchain_mcp_adapters.client import MultiServerMCPClient
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class CoralService:
    """Service for managing Coral Protocol connections and agent communication"""
    
    def __init__(self):
        self.client: Optional[MultiServerMCPClient] = None
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
            
            # Initialize Coral connection
            timeout = float(os.getenv("TIMEOUT_MS", "30000"))
            self.client = MultiServerMCPClient(
                connections={
                    "coral": {
                        "transport": "sse",
                        "url": coral_url,
                        "timeout": timeout,
                        "sse_read_timeout": timeout,
                    }
                }
            )
            
            # Get Coral tools
            self.coral_tools = await self.client.get_tools(server_name="coral")
            logger.info(f"Retrieved {len(self.coral_tools)} coral tools")
            
            self.is_connected = True
            logger.info("Coral Server connection established successfully")
            return True
            
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
            
            # Find the create_thread tool
            create_thread_tool = None
            for tool in self.coral_tools:
                if tool.name == "create_thread":
                    create_thread_tool = tool
                    break
            
            if not create_thread_tool:
                logger.error("create_thread tool not found")
                return None
            
            # Create thread
            result = await create_thread_tool.ainvoke({
                "threadName": thread_name,
                "participantIds": participant_ids
            })
            
            thread_id = result.get("threadId") if isinstance(result, dict) else str(result)
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
            
            # Find the send_message tool
            send_message_tool = None
            for tool in self.coral_tools:
                if tool.name == "send_message":
                    send_message_tool = tool
                    break
            
            if not send_message_tool:
                logger.error("send_message tool not found")
                return False
            
            # Send message
            await send_message_tool.ainvoke({
                "threadId": thread_id,
                "content": content,
                "mentions": mentions or []
            })
            
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
            
            # Find the wait_for_mentions tool
            wait_for_mentions_tool = None
            for tool in self.coral_tools:
                if tool.name == "wait_for_mentions":
                    wait_for_mentions_tool = tool
                    break
            
            if not wait_for_mentions_tool:
                logger.error("wait_for_mentions tool not found")
                return []
            
            responses = []
            for _ in range(max_responses):
                try:
                    result = await wait_for_mentions_tool.ainvoke({
                        "timeoutMs": timeout_ms
                    })
                    
                    if result:
                        responses.append(result)
                        logger.info(f"Received mention: {result}")
                    
                except asyncio.TimeoutError:
                    logger.info("Timeout waiting for mentions")
                    break
                except Exception as e:
                    logger.error(f"Error waiting for mentions: {str(e)}")
                    break
            
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
            
            # Find the list_agents tool
            list_agents_tool = None
            for tool in self.coral_tools:
                if tool.name == "list_agents":
                    list_agents_tool = tool
                    break
            
            if not list_agents_tool:
                logger.error("list_agents tool not found")
                return []
            
            result = await list_agents_tool.ainvoke({})
            agents = result.get("agents", []) if isinstance(result, dict) else []
            
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
            
            # Find the add_participant tool
            add_participant_tool = None
            for tool in self.coral_tools:
                if tool.name == "add_participant":
                    add_participant_tool = tool
                    break
            
            if not add_participant_tool:
                logger.error("add_participant tool not found")
                return False
            
            # Add participants
            await add_participant_tool.ainvoke({
                "threadId": thread_id,
                "participantIds": participant_ids
            })
            
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
