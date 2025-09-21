import urllib.parse
import os
import asyncio
import json
import logging
from typing import Dict, Any, List
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
from pdf2image import convert_from_path
import tempfile
from mistralai import Mistral
import base64

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class CoralOCRAgent:
    """Coral-compatible OCR Agent for Smart Grade AI"""
    
    def __init__(self):
        """Initialize Coral OCR Agent with current FastAPI configuration"""
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
        
        # Initialize Mistral for OCR
        self.mistral_client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))
        
        logger.info("Coral OCR Agent initialized successfully")
    
    def get_tools_description(self, tools: List[Any]) -> str:
        """Generate tools description for agent prompt"""
        return "\n".join(
            f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
            for tool in tools
        )
    
    async def create_agent(self) -> AgentExecutor:
        """Create Coral-compatible OCR agent"""
        # Create OCR-specific tools
        ocr_tools = [
            Tool(
                name="extract_text_from_pdf",
                func=self.extract_text_from_pdf,
                description="Extract text from PDF file using OCR"
            ),
            Tool(
                name="extract_text_from_image",
                func=self.extract_text_from_image,
                description="Extract text from image file using Mistral Vision API"
            ),
            Tool(
                name="process_document",
                func=self.process_document,
                description="Process document (PDF or image) and extract text"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                f"""You are an OCR processing agent for Smart Grade AI.
                Your role is to process documents and extract text using OCR.
                
                Available tools: {self.get_tools_description(ocr_tools)}
                
                When you receive a request to process a document:
                1. Use the appropriate tool based on file type
                2. Extract text accurately
                3. Return the extracted text
                """
            ),
            ("placeholder", "{agent_scratchpad}")
        ])
        
        agent = create_tool_calling_agent(self.llm, ocr_tools, prompt)
        return AgentExecutor(agent=agent, tools=ocr_tools, verbose=True, handle_parsing_errors=True)
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using Mistral Vision API"""
        try:
            logger.info(f"Processing PDF: {file_path}")
            extracted_text = ""
            images = convert_from_path(file_path)
            
            for page_num, image in enumerate(images):
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_image:
                    image.save(temp_image.name, 'PNG')
                    page_text = self.extract_text_from_image(temp_image.name)
                    extracted_text += f"\n--- Page {page_num + 1} ---\n{page_text}"
            
            logger.info(f"PDF processing completed. Extracted {len(extracted_text)} characters")
            return extracted_text
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {str(e)}")
            return f"Error processing PDF: {str(e)}"
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using Mistral Vision API"""
        try:
            logger.info(f"Processing image: {image_path}")
            base64_image = self._encode_image(image_path)
            if not base64_image:
                return "Error: Could not encode image"
            
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extract all text from this image. "
                                "Preserve the structure and formatting as much as possible. "
                                "If you see questions and answers, maintain their relationship. "
                                "Do not add interpretations or corrections."
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    ]
                }
            ]
            
            chat_response = self.mistral_client.chat.complete(
                model="pixtral-12b-2409",
                messages=messages
            )
            
            extracted_text = chat_response.choices[0].message.content
            logger.info(f"Image processing completed. Extracted {len(extracted_text)} characters")
            return extracted_text
            
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            return f"Error processing image: {str(e)}"
    
    def process_document(self, file_path: str) -> str:
        """Process document (PDF or image) and extract text"""
        try:
            if not os.path.exists(file_path):
                return f"Error: File not found: {file_path}"
            
            if file_path.lower().endswith('.pdf'):
                return self.extract_text_from_pdf(file_path)
            else:
                return self.extract_text_from_image(file_path)
                
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {str(e)}")
            return f"Error processing document: {str(e)}"
    
    def _encode_image(self, image_path: str) -> str:
        """Encode image to base64 string"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image {image_path}: {str(e)}")
            return ""

async def main():
    """Main function to run the Coral OCR Agent"""
    logger.info("Starting Coral OCR Agent...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create OCR agent
    ocr_agent = CoralOCRAgent()
    agent_executor = await ocr_agent.create_agent()
    
    logger.info("Coral OCR Agent initialized successfully")
    logger.info("Agent is ready to process documents via FastAPI endpoints")
    
    # Keep the agent running without interactive input
    # It will be called via FastAPI endpoints
    try:
        while True:
            await asyncio.sleep(60)  # Sleep for 1 minute intervals
            logger.debug("Coral OCR Agent is running...")
    except KeyboardInterrupt:
        logger.info("Agent stopped by user")
    except Exception as e:
        logger.error(f"Error in agent loop: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())