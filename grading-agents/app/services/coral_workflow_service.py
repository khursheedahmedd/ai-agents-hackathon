import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from app.services.coral_service import CoralService
from app.core.dependencies import save_uploaded_file
import uuid
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class CoralWorkflowService:
    """Service for managing Coral Protocol workflows in the grading system"""
    
    def __init__(self):
        self.coral_service = CoralService()
        self.agent_threads: Dict[str, str] = {}
        self.is_initialized = False
    
    async def initialize_coral_agents(self) -> bool:
        """Initialize all Coral agents and create workflow threads"""
        try:
            logger.info("Initializing Coral agents and workflows...")
            
            # Initialize Coral connection
            if not await self.coral_service.initialize_coral_connection():
                logger.error("Failed to initialize Coral connection")
                return False
            
            # List available agents
            agents = await self.coral_service.list_agents()
            logger.info(f"Available agents: {[agent.get('name', 'unknown') for agent in agents]}")
            
            # Create grading workflow thread
            grading_thread_id = await self.coral_service.create_thread(
                thread_name="grading-workflow",
                participant_ids=["ocr-agent", "grading-agent", "feedback-agent", "document-agent"]
            )
            
            if grading_thread_id:
                self.agent_threads["grading"] = grading_thread_id
                logger.info(f"Created grading workflow thread: {grading_thread_id}")
            
            # Create document processing thread
            document_thread_id = await self.coral_service.create_thread(
                thread_name="document-processing",
                participant_ids=["ocr-agent", "document-agent"]
            )
            
            if document_thread_id:
                self.agent_threads["document"] = document_thread_id
                logger.info(f"Created document processing thread: {document_thread_id}")
            
            self.is_initialized = True
            logger.info("Coral agents initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Coral agents: {str(e)}")
            return False
    
    async def run_coral_grading_workflow(
        self,
        key_path: str,
        answer_path: str,
        rubric: Dict[str, Any],
        student_name: str,
        exam_title: str = "Assessment"
    ) -> Dict[str, Any]:
        """Run the complete grading workflow using Coral agents"""
        try:
            if not self.is_initialized:
                logger.error("Coral agents not initialized")
                return {"success": False, "error": "Coral agents not initialized"}
            
            logger.info(f"Starting Coral grading workflow for {student_name}")
            
            grading_thread_id = self.agent_threads.get("grading")
            if not grading_thread_id:
                logger.error("Grading thread not found")
                return {"success": False, "error": "Grading thread not found"}
            
            # Step 1: Process answer key with document agent
            logger.info("Step 1: Processing answer key with document agent")
            await self.coral_service.send_message(
                thread_id=grading_thread_id,
                content=f"Process answer key document: {key_path}",
                mentions=["document-agent"]
            )
            
            # Step 2: Process student answer with document agent
            logger.info("Step 2: Processing student answer with document agent")
            await self.coral_service.send_message(
                thread_id=grading_thread_id,
                content=f"Process student answer document: {answer_path}",
                mentions=["document-agent"]
            )
            
            # Step 3: Grade answers with grading agent
            logger.info("Step 3: Grading answers with grading agent")
            await self.coral_service.send_message(
                thread_id=grading_thread_id,
                content=f"Grade student answers using rubric: {json.dumps(rubric)}",
                mentions=["grading-agent"]
            )
            
            # Step 4: Generate feedback with feedback agent
            logger.info("Step 4: Generating feedback with feedback agent")
            await self.coral_service.send_message(
                thread_id=grading_thread_id,
                content=f"Generate comprehensive feedback for student: {student_name}",
                mentions=["feedback-agent"]
            )
            
            # Wait for responses from all agents
            logger.info("Waiting for agent responses...")
            responses = await self.coral_service.wait_for_mentions(
                timeout_ms=60000,
                max_responses=4
            )
            
            # Synthesize responses
            result = self._synthesize_grading_responses(responses, student_name, exam_title)
            
            logger.info("Coral grading workflow completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in Coral grading workflow: {str(e)}")
            return {"success": False, "error": f"Coral workflow failed: {str(e)}"}
    
    async def run_coral_document_processing(
        self,
        file_path: str,
        processing_type: str = "qa_extraction"
    ) -> Dict[str, Any]:
        """Run document processing workflow using Coral agents"""
        try:
            if not self.is_initialized:
                logger.error("Coral agents not initialized")
                return {"success": False, "error": "Coral agents not initialized"}
            
            logger.info(f"Starting Coral document processing for {file_path}")
            
            document_thread_id = self.agent_threads.get("document")
            if not document_thread_id:
                logger.error("Document thread not found")
                return {"success": False, "error": "Document thread not found"}
            
            # Step 1: Extract text with OCR agent
            logger.info("Step 1: Extracting text with OCR agent")
            await self.coral_service.send_message(
                thread_id=document_thread_id,
                content=f"Extract text from document: {file_path}",
                mentions=["ocr-agent"]
            )
            
            # Step 2: Process text with document agent
            logger.info("Step 2: Processing text with document agent")
            await self.coral_service.send_message(
                thread_id=document_thread_id,
                content=f"Process extracted text for {processing_type}",
                mentions=["document-agent"]
            )
            
            # Wait for responses
            logger.info("Waiting for document processing responses...")
            responses = await self.coral_service.wait_for_mentions(
                timeout_ms=30000,
                max_responses=2
            )
            
            # Synthesize responses
            result = self._synthesize_document_responses(responses, processing_type)
            
            logger.info("Coral document processing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in Coral document processing: {str(e)}")
            return {"success": False, "error": f"Document processing failed: {str(e)}"}
    
    def _synthesize_grading_responses(
        self,
        responses: List[Dict[str, Any]],
        student_name: str,
        exam_title: str
    ) -> Dict[str, Any]:
        """Synthesize responses from grading workflow agents"""
        try:
            logger.info(f"Synthesizing {len(responses)} grading responses")
            
            # Initialize result structure
            result = {
                "success": True,
                "student_name": student_name,
                "exam_title": exam_title,
                "results": [],
                "total_marks": 0,
                "awarded_marks": 0,
                "percentage": 0,
                "feedback": "",
                "pdf_url": "",
                "agent_responses": responses
            }
            
            # Process responses from different agents
            document_data = None
            grading_data = None
            feedback_data = None
            
            for response in responses:
                agent_name = response.get("sender", "unknown")
                content = response.get("content", "")
                
                if "document-agent" in agent_name.lower():
                    try:
                        document_data = json.loads(content) if content else None
                    except:
                        document_data = {"qa_pairs": []}
                
                elif "grading-agent" in agent_name.lower():
                    try:
                        grading_data = json.loads(content) if content else None
                    except:
                        grading_data = {"results": []}
                
                elif "feedback-agent" in agent_name.lower():
                    feedback_data = content
            
            # Process grading results
            if grading_data and grading_data.get("results"):
                result["results"] = grading_data["results"]
                result["total_marks"] = sum(r.get("total_marks", 0) for r in grading_data["results"])
                result["awarded_marks"] = sum(r.get("marks_awarded", 0) for r in grading_data["results"])
                
                if result["total_marks"] > 0:
                    result["percentage"] = (result["awarded_marks"] / result["total_marks"]) * 100
            
            # Add feedback
            if feedback_data:
                result["feedback"] = feedback_data
            
            logger.info(f"Synthesis completed. Total marks: {result['total_marks']}, Awarded: {result['awarded_marks']}")
            return result
            
        except Exception as e:
            logger.error(f"Error synthesizing grading responses: {str(e)}")
            return {
                "success": False,
                "error": f"Synthesis failed: {str(e)}",
                "student_name": student_name,
                "exam_title": exam_title
            }
    
    def _synthesize_document_responses(
        self,
        responses: List[Dict[str, Any]],
        processing_type: str
    ) -> Dict[str, Any]:
        """Synthesize responses from document processing workflow"""
        try:
            logger.info(f"Synthesizing {len(responses)} document processing responses")
            
            result = {
                "success": True,
                "processing_type": processing_type,
                "extracted_text": "",
                "qa_pairs": [],
                "agent_responses": responses
            }
            
            # Process responses from different agents
            for response in responses:
                agent_name = response.get("sender", "unknown")
                content = response.get("content", "")
                
                if "ocr-agent" in agent_name.lower():
                    result["extracted_text"] = content
                
                elif "document-agent" in agent_name.lower():
                    try:
                        document_data = json.loads(content) if content else None
                        if document_data and document_data.get("qa_pairs"):
                            result["qa_pairs"] = document_data["qa_pairs"]
                    except:
                        pass
            
            logger.info(f"Document synthesis completed. Text length: {len(result['extracted_text'])}, Q&A pairs: {len(result['qa_pairs'])}")
            return result
            
        except Exception as e:
            logger.error(f"Error synthesizing document responses: {str(e)}")
            return {
                "success": False,
                "error": f"Document synthesis failed: {str(e)}",
                "processing_type": processing_type
            }
    
    async def cleanup_temp_files(self, file_paths: List[str]):
        """Clean up temporary files"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as e:
                logger.error(f"Failed to clean up {file_path}: {str(e)}")
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of Coral agents"""
        return {
            "is_initialized": self.is_initialized,
            "is_connected": self.coral_service.is_connected_to_coral(),
            "agent_threads": list(self.agent_threads.keys()),
            "thread_count": len(self.agent_threads)
        }
