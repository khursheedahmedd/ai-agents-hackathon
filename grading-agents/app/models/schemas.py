from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class GradingCriteria(str, Enum):
    STRICT = "strict"
    MODERATE = "moderate"
    LENIENT = "lenient"

class QuestionAnswer(BaseModel):
    question: str = Field(..., min_length=1, description="The question text")
    answer: str = Field(..., description="The answer text")
    marks: int = Field(default=5, ge=0, le=100, description="Maximum marks for this question")

class RubricItem(BaseModel):
    criteria: str = Field(..., description="Grading criteria description")
    points: int = Field(..., ge=0, description="Points for this criteria")
    description: str = Field(..., description="Detailed description of the criteria")

class QuestionRubric(BaseModel):
    questionNumber: int = Field(..., ge=1, description="Question number")
    questionText: str = Field(..., min_length=1, description="Question text")
    totalMarks: int = Field(..., ge=0, le=100, description="Total marks for this question")
    rubric: Dict[str, Any] = Field(..., description="Rubric details for this question")

class GradingRubric(BaseModel):
    questions: List[QuestionRubric] = Field(..., min_items=1, description="List of questions with rubrics")

class GradingResult(BaseModel):
    question_number: int = Field(..., description="Question number")
    question: str = Field(..., description="Question text")
    correct_answer: str = Field(..., description="Correct answer")
    student_answer: str = Field(..., description="Student's answer")
    marks_awarded: float = Field(..., ge=0, description="Marks awarded")
    feedback: str = Field(..., description="Detailed feedback")
    totalMarks: int = Field(..., ge=0, description="Total possible marks")

class GradingResponse(BaseModel):
    message: str = Field(..., description="Response message")
    results: List[GradingResult] = Field(..., description="Grading results")
    pdf_url: str = Field(..., description="URL to generated PDF report")
    total_marks: float = Field(..., description="Total possible marks")
    awarded_marks: float = Field(..., description="Marks awarded")
    percentage: float = Field(..., description="Percentage score")

class UploadKeyResponse(BaseModel):
    message: str = Field(..., description="Response message")
    qa_pairs: List[QuestionAnswer] = Field(..., description="Extracted question-answer pairs")

class StudentUploadRequest(BaseModel):
    student_name: str = Field(..., min_length=1, max_length=100, description="Student's name")
    exam_title: Optional[str] = Field(default="Exam", description="Exam title")

class ExcelRequest(BaseModel):
    submissions: List[Dict[str, Any]] = Field(..., min_items=1, description="List of submissions to export")

class ExcelResponse(BaseModel):
    excelUrl: str = Field(..., description="URL to generated Excel file")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Health status")
    version: str = Field(..., description="API version")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Response timestamp")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Error timestamp")

class WorkflowState(BaseModel):
    """LangGraph workflow state"""
    key_path: Optional[str] = None
    answer_path: Optional[str] = None
    rubric: Optional[Dict[str, Any]] = None
    student_name: Optional[str] = None
    exam_title: Optional[str] = None
    key_qa_pairs: List[Dict[str, Any]] = Field(default_factory=list)
    student_qa_pairs: List[Dict[str, Any]] = Field(default_factory=list)
    grading_results: List[Dict[str, Any]] = Field(default_factory=list)
    report: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class OCRResult(BaseModel):
    text: str = Field(..., description="Extracted text")
    confidence: float = Field(..., ge=0, le=1, description="OCR confidence score")
    pages: List[Dict[str, Any]] = Field(default_factory=list, description="Page-wise results")

class FeedbackAnalysis(BaseModel):
    overall_performance: str = Field(..., description="Overall performance summary")
    strengths: List[str] = Field(default_factory=list, description="Student strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Areas for improvement")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")
    encouragement: str = Field(..., description="Motivational message")

class ReportData(BaseModel):
    student_name: str = Field(..., description="Student name")
    exam_title: str = Field(..., description="Exam title")
    total_marks: float = Field(..., description="Total possible marks")
    awarded_marks: float = Field(..., description="Marks awarded")
    percentage: float = Field(..., description="Percentage score")
    results: List[GradingResult] = Field(..., description="Detailed results")
    feedback: Optional[FeedbackAnalysis] = Field(None, description="Feedback analysis")
    generated_at: datetime = Field(default_factory=datetime.now, description="Report generation time")

# File upload models
class FileUploadInfo(BaseModel):
    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="File MIME type")
    size: int = Field(..., ge=0, description="File size in bytes")
    extension: str = Field(..., description="File extension")

class UploadResponse(BaseModel):
    message: str = Field(..., description="Upload status message")
    file_info: FileUploadInfo = Field(..., description="Uploaded file information")
    file_id: str = Field(..., description="Unique file identifier")
