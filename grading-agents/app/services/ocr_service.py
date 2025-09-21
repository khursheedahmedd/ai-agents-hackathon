import os
import tempfile
import base64
import requests
from typing import Dict, Any
from fastapi import UploadFile
from mistralai import Mistral
from PIL import Image
import tempfile
from pathlib import Path

from app.config import settings
from app.core.exceptions import OCRException
from app.models.schemas import OCRResult

class OCRService:
    """Service for OCR operations using Mistral API"""
    
    def __init__(self):
        self.mistral_client = Mistral(api_key=settings.MISTRAL_API_KEY)
        self.ocr_url = "https://api.mistral.ai/v1/ocr"
        self.headers = {
            "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
            "Content-Type": "application/json",
        }
        self.ocr_model = "pixtral-large-2411"
    
    async def extract_text_from_file(self, file_path: str) -> OCRResult:
        """Extract text from file using Mistral Vision API with Pixtral"""
        try:
            print(f"Using Mistral Pixtral for OCR on file: {file_path}")
            
            # Use Vision API instead of OCR API
            extracted_text = await self.extract_text_with_vision(file_path)
            
            print(f"Mistral Pixtral OCR result: {extracted_text[:200]}...")
            
            # Return OCRResult with the extracted text
            return OCRResult(
                text=extracted_text,
                confidence=0.95,  # High confidence for Pixtral
                pages=[{
                    "page_number": 1,
                    "text": extracted_text,
                    "confidence": 0.95
                }]
            )
            
        except Exception as e:
            print(f"Mistral Pixtral OCR error: {str(e)}")
            raise OCRException(
                message="Failed to extract text from file using Mistral Pixtral",
                detail=str(e)
            )
    
    async def extract_text_from_upload(self, file: UploadFile) -> OCRResult:
        """Extract text from uploaded file"""
        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name
            
            # Extract text
            result = await self.extract_text_from_file(temp_path)
            
            # Clean up
            try:
                os.remove(temp_path)
            except Exception:
                pass
            
            return result
            
        except Exception as e:
            raise OCRException(
                message="Failed to extract text from uploaded file",
                detail=str(e)
            )
    
    async def _convert_to_pdf(self, input_path: str) -> str:
        """Convert image to PDF if needed"""
        try:
            # Check if file is already PDF
            if input_path.lower().endswith('.pdf'):
                return input_path
            
            # Open image and convert to PDF
            with Image.open(input_path) as img:
                # Convert to RGB if needed
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGB')
                
                # Create temporary PDF file
                temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                img.save(temp_pdf.name, format='PDF', resolution=100.0)
                return temp_pdf.name
                
        except Exception as e:
            raise OCRException(
                message="Failed to convert image to PDF",
                detail=str(e)
            )
    
    async def extract_text_with_vision(self, file_path: str) -> str:
        """Extract text using Mistral Vision API as fallback"""
        try:
            # Check if file exists and has content
            if not os.path.exists(file_path):
                print(f"File does not exist: {file_path}")
                return ""
            
            file_size = os.path.getsize(file_path)
            if file_size == 0:
                print(f"File is empty: {file_path}")
                return ""
            
            print(f"Processing file: {file_path} (size: {file_size} bytes)")
            
            # Convert to image if needed
            if file_path.lower().endswith('.pdf'):
                # Try multiple PDF processing methods
                image_path = await self._process_pdf_to_image(file_path)
                if image_path is None:
                    # PDF processing returned None, meaning it was read as text
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if content and len(content.strip()) > 10:
                                print("Using text content directly from PDF")
                                return content
                    except:
                        pass
                    return ""
                elif not image_path:
                    return ""
            else:
                image_path = file_path
            
            # Compress image if it's too large
            compressed_image_path = await self._compress_image_if_needed(image_path)
            
            # Encode image to base64
            try:
                with open(compressed_image_path, "rb") as image_file:
                    base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                
                # Check if image is too large for Mistral API (20MB limit)
                image_size_mb = len(base64_image) / (1024 * 1024)
                print(f"Image size: {image_size_mb:.2f} MB")
                
                if image_size_mb > 20:
                    print("Image too large for Mistral API, compressing further...")
                    # Further compress the image
                    further_compressed = await self._compress_image_aggressively(compressed_image_path)
                    with open(further_compressed, "rb") as image_file:
                        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                    os.remove(further_compressed)
                
            except Exception as e:
                print(f"Failed to encode image: {e}")
                return ""
            
            # Use Mistral Vision API with improved prompt to prevent hallucinations
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """You are an OCR (Optical Character Recognition) system. Your task is to extract text from this image with 100% accuracy.

CRITICAL INSTRUCTIONS:
1. Extract ONLY the text that is actually visible in the image
2. Do NOT add, modify, or interpret any text
3. Do NOT make assumptions about missing words
4. Do NOT complete partial sentences
5. If text is unclear or partially visible, transcribe exactly what you can see
6. Preserve the original formatting, line breaks, and structure
7. If you cannot read something, use [unclear] instead of guessing
8. Do NOT add any explanations, comments, or additional text
9. Return ONLY the extracted text, nothing else

Extract the text now:"""
                        },
                        {
                            "type": "image_url",
                            "image_url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    ]
                }
            ]
            
            response = self.mistral_client.chat.complete(
                model="pixtral-12b-2409",
                messages=messages
            )
            
            extracted_text = response.choices[0].message.content
            print(f"OCR extracted text: {extracted_text[:200]}...")
            
            # Clean up temporary images if created
            if compressed_image_path != file_path:
                try:
                    os.remove(compressed_image_path)
                except Exception:
                    pass
            
            if image_path != file_path and image_path != compressed_image_path:
                try:
                    os.remove(image_path)
                except Exception:
                    pass
            
            return extracted_text
            
        except Exception as e:
            print(f"OCR Vision API error: {e}")
            # Fallback: return empty string instead of raising exception
            return ""
    
    async def _process_pdf_to_image(self, file_path: str) -> str:
        """Process PDF to image with multiple fallback methods"""
        try:
            # Check if it's actually an image file first
            actual_type = self._detect_file_type(file_path)
            if actual_type in ['jpeg', 'png', 'gif', 'bmp']:
                print(f"File is already an image ({actual_type}), using directly")
                return file_path
            
            # Method 1: Try pdf2image with different parameters
            images = None
            try:
                from pdf2image import convert_from_path
                print(f"Attempting PDF conversion with pdf2image: {file_path}")
                
                # Try with different DPI settings - process ALL pages
                for dpi in [150, 200, 300]:
                    try:
                        images = convert_from_path(
                            file_path, 
                            dpi=dpi, 
                            fmt='PNG'
                            # Remove first_page and last_page to process all pages
                        )
                        if images and len(images) > 0:
                            print(f"PDF conversion successful with DPI {dpi} - {len(images)} pages")
                            break
                    except Exception as dpi_error:
                        print(f"PDF conversion failed with DPI {dpi}: {dpi_error}")
                        continue
                
                if not images or len(images) == 0:
                    raise Exception("No images extracted from PDF")
                
                # Process all pages and combine them
                if len(images) == 1:
                    # Single page - save directly
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                        images[0].save(temp_img.name, 'PNG', optimize=True, quality=85)
                        return temp_img.name
                else:
                    # Multiple pages - combine them into a single image
                    print(f"Processing {len(images)} pages from PDF")
                    return await self._combine_pdf_pages(images)
                    
            except Exception as pdf_error:
                print(f"pdf2image conversion failed: {pdf_error}")
                
                # Method 2: Try PyMuPDF (fitz) as fallback
                try:
                    import fitz  # PyMuPDF
                    print(f"Attempting PDF conversion with PyMuPDF: {file_path}")
                    
                    doc = fitz.open(file_path)
                    if doc.page_count > 0:
                        print(f"PyMuPDF processing {doc.page_count} pages")
                        if doc.page_count == 1:
                            # Single page
                            page = doc[0]
                            mat = fitz.Matrix(1.5, 1.5)
                            pix = page.get_pixmap(matrix=mat)
                            
                            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                                pix.save(temp_img.name)
                                doc.close()
                                return temp_img.name
                        else:
                            # Multiple pages - convert to PIL images and combine
                            images = []
                            for page_num in range(doc.page_count):
                                page = doc[page_num]
                                mat = fitz.Matrix(1.5, 1.5)
                                pix = page.get_pixmap(matrix=mat)
                                
                                # Convert to PIL Image
                                img_data = pix.tobytes("png")
                                from PIL import Image
                                import io
                                img = Image.open(io.BytesIO(img_data))
                                images.append(img)
                            
                            doc.close()
                            return await self._combine_pdf_pages(images)
                    else:
                        doc.close()
                        raise Exception("PDF has no pages")
                        
                except Exception as fitz_error:
                    print(f"PyMuPDF conversion failed: {fitz_error}")
                    
                    # Method 3: Try to read as text file (in case it's not actually a PDF)
                    try:
                        print(f"Attempting to read as text file: {file_path}")
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if content and len(content.strip()) > 10:
                                print("Successfully read as text file")
                                return None  # Signal to use text content directly
                    except Exception as text_error:
                        print(f"Text file reading failed: {text_error}")
                        
                    # Method 4: Try with different PDF libraries
                    try:
                        from pdf2image import convert_from_bytes
                        print(f"Attempting PDF conversion with bytes: {file_path}")
                        
                        with open(file_path, 'rb') as f:
                            pdf_bytes = f.read()
                            images = convert_from_bytes(pdf_bytes, dpi=150)
                            
                            if images and len(images) > 0:
                                if len(images) == 1:
                                    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                                        images[0].save(temp_img.name, 'PNG', optimize=True, quality=85)
                                        return temp_img.name
                                else:
                                    return await self._combine_pdf_pages(images)
                    except Exception as bytes_error:
                        print(f"PDF bytes conversion failed: {bytes_error}")
                        
                    return None
                    
        except Exception as e:
            print(f"All PDF processing methods failed: {e}")
            return None
    
    def _detect_file_type(self, file_path: str) -> str:
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
    
    async def _compress_image_if_needed(self, image_path: str) -> str:
        """Compress image if it's too large"""
        try:
            file_size = os.path.getsize(image_path)
            file_size_mb = file_size / (1024 * 1024)
            
            if file_size_mb < 5:  # If less than 5MB, no need to compress
                return image_path
            
            print(f"Compressing image: {file_size_mb:.2f} MB")
            
            from PIL import Image
            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGB')
                
                # Resize if too large
                max_size = 2048  # Max width or height
                if img.width > max_size or img.height > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save with compression
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    img.save(temp_file.name, 'JPEG', quality=85, optimize=True)
                    return temp_file.name
                    
        except Exception as e:
            print(f"Image compression failed: {e}")
            return image_path
    
    async def _compress_image_aggressively(self, image_path: str) -> str:
        """Aggressively compress image for Mistral API"""
        try:
            from PIL import Image
            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGB')
                
                # Resize to smaller size
                max_size = 1024  # Smaller max size
                if img.width > max_size or img.height > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save with high compression
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    img.save(temp_file.name, 'JPEG', quality=60, optimize=True)
                    return temp_file.name
                    
        except Exception as e:
            print(f"Aggressive image compression failed: {e}")
            return image_path
    
    async def _combine_pdf_pages(self, images):
        """Combine multiple PDF pages into a single image for OCR processing"""
        try:
            from PIL import Image
            
            if not images or len(images) == 0:
                return None
            
            if len(images) == 1:
                # Single page, save directly
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                    images[0].save(temp_img.name, 'PNG', optimize=True, quality=85)
                    return temp_img.name
            
            print(f"Combining {len(images)} PDF pages into single image")
            
            # Calculate combined dimensions
            max_width = max(img.width for img in images)
            total_height = sum(img.height for img in images)
            
            # Create a new image to hold all pages
            combined_img = Image.new('RGB', (max_width, total_height), 'white')
            
            # Paste each page vertically
            y_offset = 0
            for i, img in enumerate(images):
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Center the image horizontally if it's narrower than max_width
                x_offset = (max_width - img.width) // 2
                combined_img.paste(img, (x_offset, y_offset))
                y_offset += img.height
                
                print(f"Added page {i+1}/{len(images)} to combined image")
            
            # Save the combined image
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                combined_img.save(temp_img.name, 'PNG', optimize=True, quality=85)
                print(f"Combined image saved: {temp_img.name} ({combined_img.width}x{combined_img.height})")
                return temp_img.name
                
        except Exception as e:
            print(f"Error combining PDF pages: {e}")
            # Fallback: return the first page only
            if images and len(images) > 0:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                    images[0].save(temp_img.name, 'PNG', optimize=True, quality=85)
                    return temp_img.name
            return None
