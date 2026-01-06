"""
PDF OCR Tool - Extract text from scanned PDFs using Tesseract OCR
"""
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance
import pytesseract
import io
import os
import numpy as np
from typing import Callable, Optional, List, Dict
import json


# Supported languages
SUPPORTED_LANGUAGES = {
    'auto': 'Auto (All Languages)',  # Auto-detect using multiple languages
    'eng': 'English',
    'hin': 'Hindi',
    'spa': 'Spanish',
    'fra': 'French',
    'deu': 'German',
    'ara': 'Arabic',
    'chi_sim': 'Chinese (Simplified)',
    'jpn': 'Japanese',
    'kor': 'Korean',
    'rus': 'Russian',
}


def extract_text_from_pdf(
    input_pdf_path: str,
    language: str = 'eng',
    progress_callback: Optional[Callable[[int, int], None]] = None
) -> Dict:
    """
    Extract text from PDF using OCR.
    
    Args:
        input_pdf_path: Path to PDF file
        language: Tesseract language code (e.g., 'eng', 'hin', 'spa')
        progress_callback: Optional callback(current_page, total_pages)
    
    Returns:
        dict with extracted text and metadata
    """
    if not os.path.exists(input_pdf_path):
        raise FileNotFoundError(f"PDF not found: {input_pdf_path}")
    
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language: {language}")
    
    try:
        doc = fitz.open(input_pdf_path)
        total_pages = len(doc)
        
        results = {
            'total_pages': total_pages,
            'language': language,
            'pages': []
        }
        
        for page_num in range(total_pages):
            page = doc[page_num]
            
            # Extract text from page (if any native text exists)
            native_text = page.get_text().strip()
            
            # Get page as image for OCR with HIGHER DPI for better accuracy
            mat = fitz.Matrix(400 / 72, 400 / 72)  # 400 DPI for better detail
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Enhanced preprocessing for better OCR
            # Convert to grayscale
            if img.mode != 'L':
                img = img.convert('L')
            
            # Enhance contrast for better text recognition
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.5)  # 1.5x contrast boost
            
            # Handle auto language detection
            # Use ONLY eng+hin for Indian documents (no Arabic)
            ocr_lang = language
            if language == 'auto':
                ocr_lang = 'eng+hin'  # English + Hindi only
            
            # Detect columns by analyzing the image
            # Convert to numpy array for analysis
            img_array = np.array(img)
            width = img_array.shape[1]
            
            # Check if this is a multi-column layout
            # Simple heuristic: if width > 2000 pixels, likely 2 columns
            is_multi_column = width > 2000
            
            extracted_text = ""
            
            if is_multi_column:
                # Split into left and right columns
                mid_point = width // 2
                
                # Left column
                left_img = img.crop((0, 0, mid_point, img.height))
                
                # Right column  
                right_img = img.crop((mid_point, 0, width, img.height))
                
                # OCR left column
                try:
                    config = r'--oem 3 --psm 6'  # Single block for each column
                    left_text = pytesseract.image_to_string(left_img, lang=ocr_lang, config=config)
                except:
                    left_text = ""
                
                # OCR right column
                try:
                    config = r'--oem 3 --psm 6'
                    right_text = pytesseract.image_to_string(right_img, lang=ocr_lang, config=config)
                except:
                    right_text = ""
                
                # Combine with clear separation
                extracted_text = "=== LEFT COLUMN ===\n\n" + left_text.strip()
                extracted_text += "\n\n\n=== RIGHT COLUMN ===\n\n" + right_text.strip()
                
            else:
                # Single column - use best PSM mode
                best_result = ""
                
                # Try PSM 1
                try:
                    config = r'--oem 3 --psm 1'
                    result = pytesseract.image_to_string(img, lang=ocr_lang, config=config)
                    if len(result.strip()) > len(best_result):
                        best_result = result.strip()
                except:
                    pass
                
                # Try PSM 3
                try:
                    config = r'--oem 3 --psm 3'
                    result = pytesseract.image_to_string(img, lang=ocr_lang, config=config)
                    if len(result.strip()) > len(best_result):
                        best_result = result.strip()
                except:
                    pass
                
                # Try PSM 6
                try:
                    config = r'--oem 3 --psm 6'
                    result = pytesseract.image_to_string(img, lang=ocr_lang, config=config)
                    if len(result.strip()) > len(best_result):
                        best_result = result.strip()
                except:
                    pass
                
                extracted_text = best_result
            
            # Use OCR text if it has more content or if native text is minimal
            if len(native_text) < 100 or len(extracted_text) > len(native_text):
                final_text = extracted_text
            else:
                final_text = native_text
            
            results['pages'].append({
                'page_number': page_num + 1,
                'text': final_text,
                'has_native_text': len(native_text) > 0,
                'ocr_confidence': 'high' if final_text else 'none'
            })
            
            if progress_callback:
                progress_callback(page_num + 1, total_pages)
        
        doc.close()
        
        # Generate full text
        full_text = '\n\n'.join([
            f"=== Page {p['page_number']} ===\n{p['text']}" 
            for p in results['pages'] if p['text']
        ])
        
        results['full_text'] = full_text
        results['total_characters'] = len(full_text)
        
        return results
        
    except Exception as e:
        raise Exception(f"OCR failed: {str(e)}")


def save_results_as_text(results: Dict, output_path: str):
    """Save OCR results as plain text file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(results['full_text'])


def save_results_as_json(results: Dict, output_path: str):
    """Save OCR results as JSON with page-by-page breakdown."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
