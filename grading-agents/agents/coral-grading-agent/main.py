import os
import asyncio
import json
import logging
from typing import Dict, Any, List
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class CoralGradingAgent:
    """Coral-compatible Grading Agent for Smart Grade AI"""
    
    def __init__(self):
        """Initialize Coral Grading Agent with current FastAPI configuration"""
        # Use Azure OpenAI configuration from env
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT") or os.getenv("ENDPOINT_URL")
        deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME") or os.getenv("DEPLOYMENT_NAME", "gpt-4")
        
        self.llm = init_chat_model(
            model=deployment_name,
            model_provider="openai",
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            temperature=float(os.getenv("MODEL_TEMPERATURE", "0.1")),
            max_tokens=int(os.getenv("MODEL_MAX_TOKENS", "8000")),
            base_url=endpoint
        )
        
        logger.info("Coral Grading Agent initialized successfully")
    
    def get_tools_description(self, tools: List[Any]) -> str:
        """Generate tools description for agent prompt"""
        return "\n".join(
            f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
            for tool in tools
        )
    
    async def create_agent(self) -> AgentExecutor:
        """Create Coral-compatible grading agent"""
        # Create grading-specific tools
        grading_tools = [
            Tool(
                name="extract_qa_pairs",
                func=self.extract_qa_pairs,
                description="Extract question-answer pairs from text"
            ),
            Tool(
                name="grade_with_rubric",
                func=self.grade_with_rubric,
                description="Grade answer against rubric criteria"
            ),
            Tool(
                name="process_text",
                func=self.process_text,
                description="Process and clean text for grading"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                f"""You are a grading agent for Smart Grade AI.
                Your role is to grade student answers against answer keys and rubrics.
                
                Available tools: {self.get_tools_description(grading_tools)}
                
                When you receive grading requests:
                1. Extract question-answer pairs from both key and answer text
                2. Grade each answer against the rubric criteria
                3. Provide detailed feedback and scores
                """
            ),
            ("placeholder", "{agent_scratchpad}")
        ])
        
        agent = create_tool_calling_agent(self.llm, grading_tools, prompt)
        return AgentExecutor(agent=agent, tools=grading_tools, verbose=True, handle_parsing_errors=True)
    
    def extract_qa_pairs(self, text: str) -> str:
        """Extract question-answer pairs from text"""
        try:
            # This would use the existing grading service logic
            # For now, return a simple response
            return f"Extracted Q&A pairs from text: {text[:100]}..."
        except Exception as e:
            logger.error(f"Error extracting Q&A pairs: {str(e)}")
            return f"Error extracting Q&A pairs: {str(e)}"
    
    def grade_with_rubric(self, answer: str, key: str, rubric: str) -> str:
        """Grade answer against rubric"""
        try:
            # This would use the existing grading service logic
            # For now, return a simple response
            return f"Graded answer against rubric. Score: 85/100"
        except Exception as e:
            logger.error(f"Error grading with rubric: {str(e)}")
            return f"Error grading with rubric: {str(e)}"
    
    def process_text(self, text: str) -> str:
        """Process and clean text for grading"""
        try:
            # Simple text processing
            cleaned_text = text.strip()
            return f"Processed text: {cleaned_text[:100]}..."
        except Exception as e:
            logger.error(f"Error processing text: {str(e)}")
            return f"Error processing text: {str(e)}"

async def main():
    """Main function to run the Coral Grading Agent"""
    logger.info("Starting Coral Grading Agent...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create grading agent
    grading_agent = CoralGradingAgent()
    agent_executor = await grading_agent.create_agent()
    
    logger.info("Coral Grading Agent initialized successfully")
    logger.info("Agent is ready to process grading requests via FastAPI endpoints")
    
    # Keep the agent running without interactive input
    # It will be called via FastAPI endpoints
    try:
        while True:
            await asyncio.sleep(60)  # Sleep for 1 minute intervals
            logger.debug("Coral Grading Agent is running...")
    except KeyboardInterrupt:
        logger.info("Agent stopped by user")
    except Exception as e:
        logger.error(f"Error in agent loop: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())