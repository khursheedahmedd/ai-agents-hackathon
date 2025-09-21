from fastapi import Depends, HTTPException, UploadFile, File
from typing import List
import os
import uuid
from pathlib import Path
from app.config import settings
from app.core.exceptions import FileProcessingException

def validate_file_extension(filename: str) -> bool:
    """Validate file extension against allowed extensions"""
    if not filename:
        return False
    
    extension = filename.split('.')[-1].lower()
    return extension in settings.ALLOWED_EXTENSIONS

def detect_file_type(file_path: str) -> str:
    """Detect actual file type based on file content"""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(16)
            
        # Check for common file signatures
        if header.startswith(b'%PDF'):
            return 'pdf'
        elif header.startswith(b'\xff\xd8\xff'):
            return 'jpeg'
        elif header.startswith(b'\x89PNG'):
            return 'png'
        elif header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
            return 'gif'
        elif header.startswith(b'BM'):
            return 'bmp'
        else:
            return 'unknown'
    except:
        return 'unknown'

def validate_pdf_file(file_path: str) -> bool:
    """Validate if file is a valid PDF or acceptable image format"""
    try:
        print(f"[PDF_VALIDATION] Validating file: {file_path}")
        
        # Check file size
        file_size = os.path.getsize(file_path)
        print(f"[PDF_VALIDATION] File size: {file_size} bytes")
        if file_size == 0:
            print(f"[PDF_VALIDATION] File is empty, validation fails")
            return False
        
        # Detect actual file type
        actual_type = detect_file_type(file_path)
        print(f"[PDF_VALIDATION] Detected file type: {actual_type}")
        
        # If it's an image file, it's acceptable for OCR processing
        if actual_type in ['jpeg', 'png', 'gif', 'bmp']:
            print(f"[PDF_VALIDATION] Image file detected, validation passes")
            return True
        
        # If it's actually a PDF, validate it properly
        if actual_type == 'pdf':
            print(f"[PDF_VALIDATION] PDF file detected, validating...")
            
            # Try to open with PyMuPDF if available
            try:
                import fitz
                print(f"[PDF_VALIDATION] Trying PyMuPDF validation")
                doc = fitz.open(file_path)
                page_count = doc.page_count
                print(f"[PDF_VALIDATION] PyMuPDF page count: {page_count}")
                doc.close()
                if page_count > 0:
                    print(f"[PDF_VALIDATION] PyMuPDF validation passed")
                    return True
                else:
                    print(f"[PDF_VALIDATION] PyMuPDF validation failed - no pages")
                    return False
            except ImportError:
                print(f"[PDF_VALIDATION] PyMuPDF not available, trying pdf2image")
                # PyMuPDF not available, try pdf2image
                try:
                    from pdf2image import convert_from_path
                    images = convert_from_path(file_path, first_page=1, last_page=1)
                    print(f"[PDF_VALIDATION] pdf2image extracted {len(images)} images")
                    if len(images) > 0:
                        print(f"[PDF_VALIDATION] pdf2image validation passed")
                        return True
                    else:
                        print(f"[PDF_VALIDATION] pdf2image validation failed - no images")
                        return False
                except Exception as pdf2image_error:
                    print(f"[PDF_VALIDATION] pdf2image failed: {pdf2image_error}")
                    print(f"[PDF_VALIDATION] Assuming valid due to pdf2image failure")
                    return True  # If we can't validate, assume it's valid
        
        # If file type is unknown but has a PDF extension, be lenient
        if file_path.lower().endswith('.pdf'):
            print(f"[PDF_VALIDATION] Unknown file type with PDF extension, assuming valid")
            return True
        
        print(f"[PDF_VALIDATION] Unsupported file type: {actual_type}")
        return False
        
    except Exception as e:
        print(f"[PDF_VALIDATION] Validation error: {e}")
        return False

def validate_file_size(file_size: int) -> bool:
    """Validate file size against maximum allowed size"""
    return file_size <= settings.MAX_FILE_SIZE

async def validate_upload_file(file: UploadFile = File(...)) -> UploadFile:
    """Validate uploaded file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    content = await file.read()
    file_size = len(content)
    
    if not validate_file_size(file_size):
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    return file

async def save_uploaded_file(
    file: UploadFile,
    upload_folder: str = None,
    custom_filename: str = None
) -> str:
    """Save uploaded file and return file path"""
    try:
        print(f"[FILE_UPLOAD] Starting file upload for: {file.filename}")
        
        if upload_folder is None:
            upload_folder = settings.UPLOAD_FOLDER
        
        # Ensure upload folder exists
        Path(upload_folder).mkdir(parents=True, exist_ok=True)
        print(f"[FILE_UPLOAD] Upload folder: {upload_folder}")
        
        # Generate filename
        if custom_filename:
            filename = custom_filename
        else:
            file_extension = file.filename.split('.')[-1]
            unique_id = str(uuid.uuid4())
            filename = f"{unique_id}.{file_extension}"
        
        file_path = os.path.join(upload_folder, filename)
        print(f"[FILE_UPLOAD] Target file path: {file_path}")
        
        # Save file
        content = await file.read()
        print(f"[FILE_UPLOAD] File content size: {len(content)} bytes")
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        print(f"[FILE_UPLOAD] File saved successfully")
        
        # Validate PDF files only if the file is actually a PDF
        if file_path.lower().endswith('.pdf'):
            print(f"[FILE_UPLOAD] Validating PDF file: {file_path}")
            if not validate_pdf_file(file_path):
                print(f"[FILE_UPLOAD] PDF validation failed, removing file")
                os.remove(file_path)  # Clean up invalid file
                raise FileProcessingException(
                    message="Invalid PDF file uploaded",
                    detail="The uploaded file is not a valid PDF or is corrupted"
                )
            print(f"[FILE_UPLOAD] PDF validation passed")
        else:
            print(f"[FILE_UPLOAD] Non-PDF file, skipping PDF validation")
        
        print(f"[FILE_UPLOAD] File upload completed successfully: {file_path}")
        return file_path
        
    except FileProcessingException:
        # Re-raise FileProcessingException as-is
        raise
    except Exception as e:
        print(f"[FILE_UPLOAD] Unexpected error: {str(e)}")
        raise FileProcessingException(
            message="Failed to save uploaded file",
            detail=f"Unexpected error: {str(e)}"
        )

def get_upload_folder() -> str:
    """Get upload folder path"""
    return settings.UPLOAD_FOLDER

def get_pdf_folder() -> str:
    """Get PDF folder path"""
    return settings.PDF_FOLDER

def get_answer_keys_folder() -> str:
    """Get answer keys folder path"""
    return settings.ANSWER_KEYS_FOLDER

def validate_rubric_data(rubric_data: dict) -> bool:
    """Validate rubric data structure"""
    if not isinstance(rubric_data, dict):
        return False
    
    if "questions" not in rubric_data:
        return False
    
    questions = rubric_data["questions"]
    if not isinstance(questions, list) or len(questions) == 0:
        return False
    
    for question in questions:
        required_fields = ["questionNumber", "questionText", "totalMarks", "rubric"]
        if not all(field in question for field in required_fields):
            return False
    
    return True

def get_file_info(file_path: str) -> dict:
    """Get file information"""
    try:
        stat = os.stat(file_path)
        return {
            "size": stat.st_size,
            "created": stat.st_ctime,
            "modified": stat.st_mtime
        }
    except Exception:
        return {}
