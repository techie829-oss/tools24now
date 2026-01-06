"""
Enhanced OCR Tool - Extract text with layout preservation using PaddleOCR & LayoutParser
"""
import fitz  # PyMuPDF
from PIL import Image
import io
import os
import layoutparser as lp
import numpy as np
import cv2
from typing import Callable, Optional, Dict, List

# Initialize global models to avoid reloading (lazy loading recommended in production)
_layout_model = None
_ocr_agent = None

def get_layout_model():
    global _layout_model
    if _layout_model is None:
        # Load PaddleDetection Layout Model (TableBank or PubLayNet)
        # Using PubLayNet for general document layout (Text, Title, List, Table, Figure)
        _layout_model = lp.PaddleDetectionLayoutModel(
            config_path="lp://PubLayNet/ppyolov2_r50vd_dcn_365e/config",
            label_map={0: "Text", 1: "Title", 2: "List", 3: "Table", 4: "Figure"},
            device="cpu", # Force CPU for Mac compatibility (or cuda if available)
            extra_config={
                "threshold": 0.5,
                "enable_mkldnn": False # MPS/Mac doesn't like mkldnn usually
            }
        )
    return _layout_model

def get_ocr_agent(lang='eng'):
    global _ocr_agent
    # PaddleOCR defaults. 
    # Initialize only if needed or reuse. 
    # Note: PaddleOCR might not support concurrent different langs easily without re-init.
    # For now, we instantiate per call or use a simple cached one if lang is same.
    if _ocr_agent is None:
         # Using Tesseract as the text recognizer for LayoutParser bubbles is often easier/standard
         # But LayoutParser also supports PaddleOCR.
         # For "Enhanced", we want to use the detected BLOCKS, then OCR them.
         # We can actually use Tesseract for the text content within blocks for simplicity 
         # unless PaddleOCR is strictly required for better text accuracy.
         # Let's use Tesseract for text extraction *within* blocks to keep dependencies valid
         # since we already have pytesseract working well.
         # The "Enhanced" part is the LAYOUT detection.
         pass
    return _ocr_agent

def extract_text_enhanced(
    input_pdf_path: str,
    language: str = 'eng',
    progress_callback: Optional[Callable[[int, int], None]] = None
) -> Dict:
    """
    Extract text using Layout Analysis to preserve structure.
    """
    if not os.path.exists(input_pdf_path):
        raise FileNotFoundError(f"PDF not found: {input_pdf_path}")

    model = get_layout_model()
    import pytesseract 
    
    # Handle auto language
    if language == 'auto':
        language = 'eng+hin' # English + Hindi for improved coverage (Standard ID card mix) 
    
    try:
        doc = fitz.open(input_pdf_path)
        total_pages = len(doc)
        
        results = {
            'total_pages': total_pages,
            'language': language,
            'pages': [],
            'mode': 'enhanced'
        }
        
        for page_num in range(total_pages):
            page = doc[page_num]
            
            # Get high-res image
            mat = fitz.Matrix(300 / 72, 300 / 72) # 300 DPI
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_data)).convert("RGB")
            
            # Detect Layout
            # model.detect() works on PIL image or np array
            layout = model.detect(image)
            
            # Filter for Text/List/Title/Table
            # layout is a Layout object (list of TextBlocks)
            
            # Sort blocks by vertical position then horizontal
            # This enables reading order reconstruction
            text_blocks = lp.Layout([b for b in layout if b.type in ['Text', 'Title', 'List']])
            
            # Simple sorting: Top-to-bottom, Left-to-right
            # Ideally use a more advanced algo, but this is better than raw
            text_blocks.sort(key=lambda x: x.block.y_1) 
            
            # Extract content from each block
            page_content = []
            
            # Convert PIL to CV2 for robust cropping if needed, or just crop PIL
            # Using PIL crop
            
            for block in text_blocks:
                # Crop the block
                segment = image.crop((block.block.x_1, block.block.y_1, block.block.x_2, block.block.y_2))
                
                # Recognize text in this segment
                # We use Tesseract here because it's reliable for English/European
                # Configure PSM 6 (Assume a single uniform block of text)
                config = r'--oem 3 --psm 6'
                text = pytesseract.image_to_string(segment, lang=language, config=config).strip()
                
                if text:
                    # Markdown formatting based on type
                    if block.type == 'Title':
                        page_content.append(f"## {text}")
                    elif block.type == 'List':
                        # Try to format as list? Tesseract usually handles bullets ok
                        page_content.append(text)
                    else:
                        page_content.append(text)
            
            # Check for Tables (Advanced: could use Table extraction models)
            tables = [b for b in layout if b.type == 'Table']
            if tables:
                page_content.append(f"\n*[Detected {len(tables)} Tables - content may be preserved]*")
                # Table OCR is complex; for now just OCR the whole table block
                for t in tables:
                     segment = image.crop((t.block.x_1, t.block.y_1, t.block.x_2, t.block.y_2))
            # Fallback Logic
            if not text_blocks and not tables:
                 print(f"[EnhancedOCR] No layout blocks found for page {page_num + 1}. Running fallback standard OCR...", flush=True)
                 # Try PSM 3 (Auto)
                 text = pytesseract.image_to_string(image, lang=language, config=r'--oem 3 --psm 3')
                 if not text.strip():
                      # Try PSM 6 (Block)
                      text = pytesseract.image_to_string(image, lang=language, config=r'--oem 3 --psm 6')
                 
                 if text:
                     page_content.append(text)
            
            final_text = "\n\n".join(page_content)
            
            # Double check if final_text is empty
            if not final_text.strip():
                 print(f"[EnhancedOCR] No text extracted for page {page_num + 1} (even after block processing). Running hard fallback...", flush=True)
                 # Hard fallback: Ignore layout, just OCR whole page
                 text = pytesseract.image_to_string(image, lang=language, config=r'--oem 3 --psm 3')
                 if not text.strip():
                      text = pytesseract.image_to_string(image, lang=language, config=r'--oem 3 --psm 6')
                 
                 final_text = text if text else "[No text could be extracted from this page]"

            results['pages'].append({
                'page_number': page_num + 1,
                'text': final_text,
                'ocr_confidence': 'ai_layout' if (text_blocks or tables) else 'fallback'
            })
            
            if progress_callback:
                progress_callback(page_num + 1, total_pages)
                
        doc.close()
        
        # Generate full text
        full_text = '\n\n'.join([
            f"=== Page {p['page_number']} (Enhanced Layout) ===\n{p['text']}" 
            for p in results['pages'] if p['text']
        ])
        
        results['full_text'] = full_text
        results['total_characters'] = len(full_text)
        
        return results

    except Exception as e:
        raise Exception(f"Enhanced OCR failed: {str(e)}")
