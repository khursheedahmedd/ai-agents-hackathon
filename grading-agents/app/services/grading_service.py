import json
import os
from typing import Dict, Any, List, Tuple
from openai import AzureOpenAI
from app.config import settings
from app.core.exceptions import GradingException, AIProcessingException
from app.models.schemas import GradingResult, GradingResponse, GradingRubric
from app.services.ocr_service import OCRService

class GradingService:
    """Service for grading operations using AI models"""
    
    def __init__(self):
        # Use ENDPOINT_URL if AZURE_OPENAI_ENDPOINT is not set (for backward compatibility)
        endpoint = settings.AZURE_OPENAI_ENDPOINT or settings.ENDPOINT_URL
        self.azure_client = AzureOpenAI(
            api_version="2024-02-15-preview",
            azure_endpoint=endpoint,
            api_key=settings.AZURE_OPENAI_API_KEY,
        )
        self.ocr_service = OCRService()
    
    async def process_with_gpt(self, text: str) -> str:
        """Process text with GPT to structure Q&A pairs"""
        try:
            prompt = (
                """You are a text processing system that extracts question-answer pairs from academic documents.

CRITICAL INSTRUCTIONS:
1. Process the text EXACTLY as provided - do not add, modify, or interpret anything
2. Identify questions and their corresponding answers in the text
3. After each complete question-answer pair, insert the separator '>>>>>>'
4. If you find a question without an answer, include only the question (no separator)
5. Do NOT make assumptions about missing answers
6. Do NOT complete partial sentences or add missing words
7. Do NOT change the wording of questions or answers
8. Preserve the original text exactly as written
9. If text is unclear, include it as-is with [unclear] markers
10. Return ONLY the processed text with separators, no explanations

Format: Question: [exact question text] Answer: [exact answer text] >>>>>>

Process this text:
"""
                f"{text}"
            )
            
            # Use DEPLOYMENT_NAME if AZURE_OPENAI_DEPLOYMENT_NAME is not set (for backward compatibility)
            deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME or os.getenv("DEPLOYMENT_NAME", "gpt-4")
            
            completion = self.azure_client.chat.completions.create(
                model=deployment_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4096,
                temperature=0.1  # Lower temperature for more consistent, factual responses
            )
            
            if hasattr(completion, 'choices') and len(completion.choices) > 0:
                return completion.choices[0].message.content.strip()
            else:
                raise AIProcessingException("No response from GPT model")
                
        except Exception as e:
            raise AIProcessingException(
                message="Failed to process text with GPT",
                detail=str(e)
            )
    
    def extract_qa_pairs(self, processed_text: str) -> List[Tuple[str, str]]:
        """Extract question-answer pairs from processed text"""
        try:
            # Validate input text
            if not processed_text or len(processed_text.strip()) < 10:
                print("Warning: Very short or empty processed text")
                return []
            
            # Check for potential hallucinations
            if self._detect_hallucination(processed_text):
                print("Warning: Potential hallucination detected in processed text")
                return []
            
            # Split by separator
            raw_sections = processed_text.split('>>>>>')
            sections = [sec.strip() for sec in raw_sections if sec.strip()]
            
            qa_pairs = []
            for i, section in enumerate(sections):
                if self._is_trivial_section(section):
                    continue
                
                # Split question and answer
                if '\nAnswer:' in section:
                    question_part, answer_part = section.split('\nAnswer:', 1)
                else:
                    lines = section.split('\n', 1)
                    question_part = lines[0].strip()
                    answer_part = lines[1].strip() if len(lines) > 1 else ""
                
                question = question_part.strip()
                answer = answer_part.strip()
                
                # Validate question and answer
                if not question and not answer:
                    continue
                if self._is_trivial_section(question) and not answer:
                    continue
                
                # Check for reasonable question length
                if len(question) < 5:
                    print(f"Warning: Very short question detected: {question}")
                    continue
                
                qa_pairs.append((question, answer))
                print(f"Extracted Q&A pair {i+1}: Q={len(question)} chars, A={len(answer)} chars")
            
            print(f"Total Q&A pairs extracted: {len(qa_pairs)}")
            return qa_pairs
            
        except Exception as e:
            raise GradingException(
                message="Failed to extract Q&A pairs",
                detail=str(e)
            )
    
    def _is_trivial_section(self, text: str) -> bool:
        """Check if text section is trivial/useless"""
        stripped = text.strip()
        if not stripped:
            return True
        
        allowed_chars = set(".,:;!?><-*_`'\"()[]{}|\\/\n\r\t ")
        if all(ch in allowed_chars for ch in stripped):
            return True
        
        return False
    
    def _detect_hallucination(self, text: str) -> bool:
        """Detect potential hallucinations in processed text"""
        try:
            # Check for common hallucination patterns
            hallucination_indicators = [
                "I cannot see the image clearly",
                "The image appears to be",
                "Based on what I can see",
                "I'm not sure about",
                "It looks like",
                "I think this might be",
                "The text seems to be",
                "I can make out",
                "From what I can tell",
                "It appears that",
                "I believe this is",
                "This might be",
                "I'm not certain",
                "I can't quite make out",
                "The image is unclear",
                "I cannot determine",
                "I'm unable to see",
                "The text is not clear",
                "I cannot read",
                "I'm having trouble seeing"
            ]
            
            text_lower = text.lower()
            for indicator in hallucination_indicators:
                if indicator.lower() in text_lower:
                    print(f"Hallucination indicator found: {indicator}")
                    return True
            
            # Check for excessive uncertainty markers
            uncertainty_count = text.count('[unclear]') + text.count('unclear') + text.count('?')
            if uncertainty_count > len(text) / 50:  # More than 2% uncertainty
                print(f"High uncertainty detected: {uncertainty_count} markers")
                return True
            
            # Check for very generic responses
            generic_responses = [
                "this is a question about",
                "the answer is",
                "this appears to be",
                "based on the information",
                "the text shows",
                "this document contains"
            ]
            
            generic_count = sum(1 for phrase in generic_responses if phrase in text_lower)
            if generic_count > 2:
                print(f"Generic response detected: {generic_count} generic phrases")
                return True
            
            return False
            
        except Exception as e:
            print(f"Error in hallucination detection: {e}")
            return False
    
    async def grade_with_rubric(
        self,
        key_text: str,
        answer_text: str,
        rubric: Dict[str, Any]
    ) -> List[GradingResult]:
        """Grade answers using provided rubric"""
        try:
            # Process texts with GPT
            key_questions = await self.process_with_gpt(key_text)
            student_answers = await self.process_with_gpt(answer_text)
            
            if not key_questions or not student_answers:
                raise GradingException("Failed to process texts with GPT")
            
            # Extract Q&A pairs
            key_qa_pairs = self.extract_qa_pairs(key_questions)
            student_qa_pairs = self.extract_qa_pairs(student_answers)
            
            if not key_qa_pairs or not student_qa_pairs:
                raise GradingException("Failed to extract Q&A pairs")
            
            # Grade each question
            results = []
            questions = rubric.get('questions', [])
            
            for i, question in enumerate(questions):
                try:
                    question_number = question.get('questionNumber', i + 1)
                    question_text = question.get('questionText', f"Question {i + 1}")
                    total_marks = question.get('totalMarks', 0)
                    question_rubric = question.get('rubric', {})
                    
                    # Get corresponding answers
                    key_answer = key_qa_pairs[i][1] if i < len(key_qa_pairs) else ""
                    student_answer = student_qa_pairs[i][1] if i < len(student_qa_pairs) else ""
                    
                    # Grade the answer
                    marks_awarded, feedback = await self._grade_with_llm_for_rubric(
                        question=question_text,
                        correct_answer=key_answer,
                        student_answer=student_answer,
                        question_rubric=question_rubric
                    )
                    
                    results.append(GradingResult(
                        question_number=question_number,
                        question=question_text,
                        correct_answer=key_answer,
                        student_answer=student_answer,
                        marks_awarded=marks_awarded,
                        feedback=feedback,
                        totalMarks=total_marks
                    ))
                    
                except Exception as e:
                    results.append(GradingResult(
                        question_number=i + 1,
                        question=f"Question {i + 1}",
                        correct_answer="",
                        student_answer="",
                        marks_awarded=0,
                        feedback=f"Error grading question: {str(e)}",
                        totalMarks=0
                    ))
            
            return results
            
        except Exception as e:
            raise GradingException(
                message="Failed to grade with rubric",
                detail=str(e)
            )
    
    async def _grade_with_llm_for_rubric(
        self,
        question: str,
        correct_answer: str,
        student_answer: str,
        question_rubric: Dict[str, Any]
    ) -> Tuple[float, str]:
        """Grade a single answer using LLM with custom rubric"""
        try:
            total_marks = question_rubric.get('totalMarks', 5)
            rubric_str = "\n".join([f"{k}: {v}" for k, v in question_rubric.items() if k != 'totalMarks'])
            
            prompt = f"""You are an expert academic grader. Evaluate the student's answer against the correct answer using the provided rubric.

GRADING INSTRUCTIONS:
1. Compare the student's answer with the correct answer objectively
2. Apply the rubric criteria strictly and fairly
3. Award partial credit for partially correct answers
4. Consider key concepts, accuracy, and completeness
5. Provide constructive feedback that helps the student improve
6. Base your evaluation ONLY on what the student actually wrote
7. Do not penalize for minor spelling/grammar errors unless specified in rubric

QUESTION: {question}

CORRECT ANSWER: {correct_answer}

STUDENT ANSWER: {student_answer}

RUBRIC CRITERIA:
{rubric_str}

TOTAL MARKS: {total_marks}

Provide your evaluation in this exact JSON format (no markdown, no extra text):
{{
    "score": <number between 0 and 100>,
    "feedback": "<specific feedback on what the student did well and what needs improvement>",
    "suggestions": "<concrete suggestions for improvement>"
}}"""
            
            # Use DEPLOYMENT_NAME if AZURE_OPENAI_DEPLOYMENT_NAME is not set (for backward compatibility)
            deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME or os.getenv("DEPLOYMENT_NAME", "gpt-4")
            
            completion = self.azure_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=deployment_name,
                temperature=0.1,  # Lower temperature for more consistent grading
                max_tokens=1000
            )
            
            response = completion.choices[0].message.content
            
            # Clean and parse JSON response
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            result = json.loads(cleaned_response)
            percentage_score = result.get('score', 0)
            scaled_score = (percentage_score / 100) * total_marks
            feedback = result.get('feedback', 'No feedback provided.')
            
            return scaled_score, feedback
            
        except json.JSONDecodeError as e:
            return 0, f"Error parsing grading response: {str(e)}"
        except Exception as e:
            raise AIProcessingException(
                message="Failed to grade with LLM",
                detail=str(e)
            )
    
    async def grade_simple(
        self,
        key_text: str,
        answer_text: str,
        total_marks: List[int],
        grading_criteria: str
    ) -> List[GradingResult]:
        """Simple grading without rubric"""
        try:
            # Process texts
            processed_key = await self.process_with_gpt(key_text)
            processed_answer = await self.process_with_gpt(answer_text)
            
            # Extract Q&A pairs
            key_qa_pairs = self.extract_qa_pairs(processed_key)
            answer_qa_pairs = self.extract_qa_pairs(processed_answer)
            
            # Handle length mismatch
            len_key = len(key_qa_pairs)
            len_ans = len(answer_qa_pairs)
            
            if len_key > len_ans:
                for _ in range(len_key - len_ans):
                    answer_qa_pairs.append(("", ""))
            elif len_ans > len_key:
                answer_qa_pairs = answer_qa_pairs[:len_key]
            
            results = []
            for i, ((key_q, key_a), (ans_q, ans_a)) in enumerate(zip(key_qa_pairs, answer_qa_pairs)):
                current_mark = total_marks[i] if i < len(total_marks) else 0
                
                marks_awarded, feedback = await self._grade_with_llm_simple(
                    question=key_q,
                    correct_answer=key_a,
                    student_answer=ans_a,
                    total_mark=current_mark,
                    grading_criteria=grading_criteria
                )
                
                results.append(GradingResult(
                    question_number=i + 1,
                    question=key_q,
                    correct_answer=key_a,
                    student_answer=ans_a,
                    marks_awarded=marks_awarded,
                    feedback=feedback,
                    totalMarks=current_mark
                ))
            
            return results
            
        except Exception as e:
            raise GradingException(
                message="Failed to perform simple grading",
                detail=str(e)
            )
    
    async def _grade_with_llm_simple(
        self,
        question: str,
        correct_answer: str,
        student_answer: str,
        total_mark: int,
        grading_criteria: str
    ) -> Tuple[float, str]:
        """Simple LLM grading without rubric"""
        try:
            prompt = f"""You are an expert academic examiner. Grade the student's answer objectively and fairly.

GRADING INSTRUCTIONS:
1. Compare the student's answer with the correct answer
2. Award marks based on accuracy, completeness, and understanding
3. Ignore minor spelling and grammar errors unless they affect meaning
4. Award partial credit for partially correct answers
5. Base evaluation ONLY on what the student actually wrote
6. Provide constructive feedback to help the student improve

QUESTION: {question}

CORRECT ANSWER: {correct_answer}

STUDENT ANSWER: {student_answer}

GRADING CRITERIA: {grading_criteria}

TOTAL MARKS AVAILABLE: {total_mark}

Return ONLY this JSON format (no markdown, no extra text):
{{
    "marks_awarded": <number between 0 and {total_mark}>,
    "feedback": "<specific feedback on what the student did well and what needs improvement>"
}}"""
            
            # Use DEPLOYMENT_NAME if AZURE_OPENAI_DEPLOYMENT_NAME is not set (for backward compatibility)
            deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME or os.getenv("DEPLOYMENT_NAME", "gpt-4")
            
            completion = self.azure_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=100000,
                model=deployment_name,
                temperature=0.1  # Lower temperature for more consistent grading
            )
            
            response_text = completion.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                data = json.loads(response_text)
                marks_awarded = float(data.get("marks_awarded", 0))
                feedback = data.get("feedback", "No feedback provided.")
            except json.JSONDecodeError:
                marks_awarded = 0.0
                feedback = "Error parsing grading response."
            
            # Ensure we don't exceed total_mark
            marks_awarded = min(marks_awarded, total_mark)
            return marks_awarded, feedback
            
        except Exception as e:
            raise AIProcessingException(
                message="Failed to grade with simple LLM",
                detail=str(e)
            )
