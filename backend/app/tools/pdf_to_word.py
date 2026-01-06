"""
PDF to Word Converter Tool
Converts PDF files to editable Word (.docx) format
"""

from pdf2docx import Converter
from pathlib import Path
import os


class PdfToWordTool:
    """Tool for converting PDF files to Word documents"""

    def convert_pdf_to_word(self, pdf_path: str, word_path: str) -> dict:
        """
        Convert PDF to Word (.docx) format
        
        Args:
            pdf_path: Path to source PDF file
            word_path: Path for output Word file
            
        Returns:
            dict with conversion results
        """
        
        # Validate input file
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        # Create converter instance
        cv = Converter(pdf_path)
        
        # Convert entire document
        cv.convert(word_path, start=0, end=None)
        cv.close()
        
        # Get file sizes
        original_size = os.path.getsize(pdf_path)
        word_size = os.path.getsize(word_path)
        
        return {
            'original_size': original_size,
            'word_size': word_size,
            'output_path': word_path,
            'format': 'docx',
            'success': True
        }

    def convert_pdf_to_word_pages(self, pdf_path: str, word_path: str, 
                                   start_page: int = 0, end_page: int = None) -> dict:
        """
        Convert specific pages from PDF to Word
        
        Args:
            pdf_path: Path to source PDF
            word_path: Path for output Word file
            start_page: Starting page (0-indexed)
            end_page: Ending page (0-indexed), None for all pages
            
        Returns:
            dict with conversion results
        """
        
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        cv = Converter(pdf_path)
        cv.convert(word_path, start=start_page, end=end_page)
        cv.close()
        
        original_size = os.path.getsize(pdf_path)
        word_size = os.path.getsize(word_path)
        
        return {
            'original_size': original_size,
            'word_size': word_size,
            'output_path': word_path,
            'pages_converted': f"{start_page} to {end_page or 'end'}",
           'format': 'docx',
            'success': True
        }
