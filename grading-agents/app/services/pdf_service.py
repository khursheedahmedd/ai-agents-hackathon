import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from fpdf import FPDF
import cloudinary
import cloudinary.uploader
from pathlib import Path

from app.config import settings
from app.core.exceptions import PDFGenerationException
from app.models.schemas import GradingResult, ReportData

class PDFReport(FPDF):
    """Custom PDF report class with Unicode support"""
    
    def __init__(self):
        super().__init__()
        # Try to add Unicode-compatible fonts, fallback to default if not available
        try:
            self.add_font('DejaVu', '', 'static/fonts/DejaVuSans.ttf', uni=True)
            self.add_font('DejaVu', 'B', 'static/fonts/DejaVuSans-Bold.ttf', uni=True)
            self.add_font('DejaVu', 'I', 'static/fonts/DejaVuSans-Oblique.ttf', uni=True)
            self.font_family = 'DejaVu'
        except Exception as e:
            print(f"Custom fonts not available, using default fonts: {e}")
            self.font_family = 'Arial'  # Use default Arial
    
    def header(self):
        if self.page_no() > 1:
            self.set_font(self.font_family, 'B', 15)
            self.cell(0, 10, 'Grading Report', ln=True, align='C')
            self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font(self.font_family, 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

class PDFService:
    """Service for PDF generation and cloud storage"""
    
    def __init__(self):
        # Configure Cloudinary
        try:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            print("Cloudinary configured successfully")
        except Exception as e:
            print(f"Cloudinary configuration failed: {e}")
            # Continue without Cloudinary - will use local storage
    
    async def generate_pdf(
        self,
        results: List[GradingResult],
        student_name: str,
        exam_title: str,
        date: str = None
    ) -> str:
        """Generate PDF report and return URL"""
        try:
            if date is None:
                date = datetime.now().strftime('%Y-%m-%d')
            
            # Create PDF
            pdf = PDFReport()
            pdf.alias_nb_pages()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            
            # Calculate totals
            total_possible_marks = sum(item.totalMarks for item in results)
            total_awarded_marks = sum(item.marks_awarded for item in results)
            percentage = (total_awarded_marks / total_possible_marks * 100) if total_possible_marks > 0 else 0
            
            # Cover Page
            pdf.set_font(pdf.font_family, 'B', 20)
            pdf.cell(0, 10, 'Grading Report', ln=True, align='C')
            pdf.ln(20)
            
            # Student and Exam Information
            pdf.set_font(pdf.font_family, '', 14)
            pdf.cell(0, 10, f"Student Name: {student_name}", ln=True)
            pdf.cell(0, 10, f"Exam Title: {exam_title}", ln=True)
            pdf.cell(0, 10, f"Date: {date}", ln=True)
            pdf.ln(10)
            
            # Total Marks
            pdf.set_font(pdf.font_family, 'B', 16)
            pdf.cell(0, 10, f"Total Marks Awarded: {total_awarded_marks:.1f} out of {total_possible_marks}", ln=True)
            pdf.cell(0, 10, f"Percentage: {percentage:.1f}%", ln=True)
            pdf.ln(20)
            
            # Add page break
            pdf.add_page()
            
            # Detailed Results
            pdf.set_font(pdf.font_family, size=12)
            
            for item in results:
                # Question Number and Text
                pdf.set_font(pdf.font_family, 'B', 12)
                pdf.multi_cell(0, 10, f"Question {item.question_number}: {item.question}")
                pdf.ln(2)
                
                # Student's Answer
                pdf.set_font(pdf.font_family, '', 12)
                pdf.multi_cell(0, 10, f"Student's Answer:\n{item.student_answer}")
                pdf.ln(2)
                
                # Correct Answer
                pdf.set_font(pdf.font_family, 'I', 12)
                pdf.multi_cell(0, 10, f"Correct Answer:\n{item.correct_answer}")
                pdf.ln(2)
                
                # Marks Awarded
                pdf.set_font(pdf.font_family, '', 12)
                pdf.cell(0, 10, f"Marks Awarded: {item.marks_awarded:.1f} out of {item.totalMarks}", ln=True)
                pdf.ln(2)
                
                # Feedback
                pdf.set_font(pdf.font_family, 'B', 12)
                pdf.set_text_color(0, 128, 0)  # Green color
                pdf.multi_cell(0, 10, f"Feedback: {item.feedback}")
                pdf.set_text_color(0, 0, 0)  # Reset to black
                pdf.ln(10)
            
            # Generate filename and save
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            pdf_filename = f"{student_name.replace(' ', '_')}_{exam_title.replace(' ', '_')}_{timestamp}.pdf"
            pdf_path = os.path.join(settings.PDF_FOLDER, pdf_filename)
            
            # Ensure directory exists
            Path(settings.PDF_FOLDER).mkdir(parents=True, exist_ok=True)
            
            # Save PDF
            pdf.output(pdf_path)
            
            # Upload to Cloudinary
            try:
                upload_result = cloudinary.uploader.upload(
                    pdf_path,
                    resource_type="raw",
                    public_id=f"grading_reports/{pdf_filename}",
                    overwrite=True,
                    use_filename=True,
                    unique_filename=True
                )
                cloudinary_url = upload_result.get("secure_url")
                
                # Clean up local file
                os.remove(pdf_path)
                
                return cloudinary_url
                
            except Exception as e:
                # If Cloudinary upload fails, return local path
                return f"/static/reports/{pdf_filename}"
            
        except Exception as e:
            print(f"PDF generation error: {e}")
            raise PDFGenerationException(
                message="Failed to generate PDF report",
                detail=f"PDF generation failed: {str(e)}"
            )
    
    async def generate_excel_report(self, submissions: List[Dict[str, Any]]) -> str:
        """Generate Excel report from submissions data"""
        try:
            import pandas as pd
            
            # Validate submissions data
            if not submissions or len(submissions) == 0:
                raise PDFGenerationException(
                    message="No submissions data provided",
                    detail="Submissions list is empty"
                )
            
            print(f"[EXCEL] Processing {len(submissions)} submissions")
            
            # Convert to DataFrame with error handling
            try:
                df = pd.DataFrame(submissions)
                print(f"[EXCEL] DataFrame created with shape: {df.shape}")
            except Exception as e:
                raise PDFGenerationException(
                    message="Failed to create DataFrame from submissions",
                    detail=f"Data conversion error: {str(e)}"
                )
            
            # Generate Excel file
            excel_filename = f"Assessment_Results_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
            excel_path = os.path.join(settings.PDF_FOLDER, excel_filename)
            
            # Ensure directory exists
            Path(settings.PDF_FOLDER).mkdir(parents=True, exist_ok=True)
            print(f"[EXCEL] Saving to: {excel_path}")
            
            # Save Excel file with error handling
            try:
                df.to_excel(excel_path, index=False, engine='openpyxl')
                print(f"[EXCEL] Excel file saved successfully")
            except Exception as e:
                raise PDFGenerationException(
                    message="Failed to save Excel file",
                    detail=f"Excel writing error: {str(e)}"
                )
            
            # Upload to Cloudinary
            try:
                print(f"[EXCEL] Uploading to Cloudinary...")
                upload_result = cloudinary.uploader.upload(
                    excel_path,
                    resource_type="raw",
                    public_id=f"excel_reports/{excel_filename}",
                    overwrite=True,
                    use_filename=True,
                    unique_filename=True
                )
                cloudinary_url = upload_result.get("secure_url")
                print(f"[EXCEL] Upload successful: {cloudinary_url}")
                
                # Clean up local file
                try:
                    os.remove(excel_path)
                    print(f"[EXCEL] Local file cleaned up")
                except Exception as cleanup_error:
                    print(f"[EXCEL] Warning: Failed to clean up local file: {cleanup_error}")
                
                return cloudinary_url
                
            except Exception as e:
                print(f"[EXCEL] Cloudinary upload failed: {e}")
                # If Cloudinary upload fails, return local path
                return f"/static/reports/{excel_filename}"
            
        except PDFGenerationException:
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            print(f"[EXCEL] Unexpected error: {e}")
            raise PDFGenerationException(
                message="Failed to generate Excel report",
                detail=f"Unexpected error: {str(e)}"
            )
    
    async def create_report_data(
        self,
        results: List[GradingResult],
        student_name: str,
        exam_title: str,
        feedback: Dict[str, Any] = None
    ) -> ReportData:
        """Create structured report data"""
        try:
            total_marks = sum(item.totalMarks for item in results)
            awarded_marks = sum(item.marks_awarded for item in results)
            percentage = (awarded_marks / total_marks * 100) if total_marks > 0 else 0
            
            return ReportData(
                student_name=student_name,
                exam_title=exam_title,
                total_marks=total_marks,
                awarded_marks=awarded_marks,
                percentage=percentage,
                results=results,
                feedback=feedback,
                generated_at=datetime.now()
            )
            
        except Exception as e:
            raise PDFGenerationException(
                message="Failed to create report data",
                detail=str(e)
            )
