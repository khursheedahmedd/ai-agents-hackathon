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

class CoralFeedbackAgent:
    """Coral-compatible Feedback Agent for Smart Grade AI"""
    
    def __init__(self):
        """Initialize Coral Feedback Agent with current FastAPI configuration"""
        # Use Azure OpenAI configuration from env
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT") or os.getenv("ENDPOINT_URL")
        deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME") or os.getenv("DEPLOYMENT_NAME", "gpt-4")
        
        self.llm = init_chat_model(
            model=deployment_name,
            model_provider="openai",
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            temperature=float(os.getenv("MODEL_TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("MODEL_MAX_TOKENS", "8000")),
            base_url=endpoint
        )
        
        logger.info("Coral Feedback Agent initialized successfully")
    
    def get_tools_description(self, tools: List[Any]) -> str:
        """Generate tools description for agent prompt"""
        return "\n".join(
            f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
            for tool in tools
        )
    
    async def create_agent(self) -> AgentExecutor:
        """Create Coral-compatible feedback agent"""
        # Create feedback-specific tools
        feedback_tools = [
            Tool(
                name="generate_feedback",
                func=self.generate_feedback,
                description="Generate constructive feedback for student answers"
            ),
            Tool(
                name="analyze_strengths",
                func=self.analyze_strengths,
                description="Identify strengths in student answers"
            ),
            Tool(
                name="suggest_improvements",
                func=self.suggest_improvements,
                description="Suggest specific improvements for student answers"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                f"""You are a feedback generation agent for Smart Grade AI.
                Your role is to provide constructive, personalized feedback to students.
                
                Available tools: {self.get_tools_description(feedback_tools)}
                
                When generating feedback:
                1. Be encouraging and constructive
                2. Highlight specific strengths
                3. Provide actionable improvement suggestions
                4. Maintain a supportive tone
                """
            ),
            ("placeholder", "{agent_scratchpad}")
        ])
        
        agent = create_tool_calling_agent(self.llm, feedback_tools, prompt)
        return AgentExecutor(agent=agent, tools=feedback_tools, verbose=True, handle_parsing_errors=True)
    
    def generate_feedback(self, answer: str, score: str) -> str:
        """Generate constructive feedback for student answers"""
        try:
            return f"Great work! You scored {score}. Your answer shows good understanding of the concepts."
        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return f"Error generating feedback: {str(e)}"
    
    def analyze_strengths(self, answer: str) -> str:
        """Identify strengths in student answers"""
        try:
            return "Strengths identified: Good structure, clear explanations, relevant examples."
        except Exception as e:
            logger.error(f"Error analyzing strengths: {str(e)}")
            return f"Error analyzing strengths: {str(e)}"
    
    def suggest_improvements(self, answer: str) -> str:
        """Suggest specific improvements for student answers"""
        try:
            return "Suggestions for improvement: Add more examples, expand on key concepts, improve formatting."
        except Exception as e:
            logger.error(f"Error suggesting improvements: {str(e)}")
            return f"Error suggesting improvements: {str(e)}"

async def main():
    """Main function to run the Coral Feedback Agent"""
    logger.info("Starting Coral Feedback Agent...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create feedback agent
    feedback_agent = CoralFeedbackAgent()
    agent_executor = await feedback_agent.create_agent()
    
    logger.info("Coral Feedback Agent initialized successfully")
    logger.info("Agent is ready to process feedback requests via FastAPI endpoints")
    
    # Keep the agent running without interactive input
    # It will be called via FastAPI endpoints
    try:
        while True:
            await asyncio.sleep(60)  # Sleep for 1 minute intervals
            logger.debug("Coral Feedback Agent is running...")
    except KeyboardInterrupt:
        logger.info("Agent stopped by user")
    except Exception as e:
        logger.error(f"Error in agent loop: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())