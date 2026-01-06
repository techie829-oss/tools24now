"""
PDF Merger Tool - Combine multiple PDFs into one
"""
import fitz  # PyMuPDF
from typing import List, Callable, Optional
import os


def merge_pdfs(
    input_pdf_paths: List[str],
    output_pdf_path: str,
    progress_callback: Optional[Callable[[int, int], None]] = None
) -> dict:
    """
    Merge multiple PDFs into one.
    
    Args:
        input_pdf_paths: List of paths to PDF files (in order to merge)
        output_pdf_path: Path to save merged PDF
        progress_callback: Optional callback(current_file, total_files)
    
    Returns:
        dict with success status and metadata
        
    Raises:
        ValueError: If less than 2 PDFs provided
        FileNotFoundError: If any input PDF doesn't exist
    """
    if len(input_pdf_paths) < 2:
        raise ValueError("At least 2 PDF files required for merging")
    
    # Validate all files exist
    for path in input_pdf_paths:
        if not os.path.exists(path):
            raise FileNotFoundError(f"PDF not found: {path}")
    
    # Create merged PDF
    merged_pdf = fitz.open()
    total_files = len(input_pdf_paths)
    total_pages = 0
    
    for i, pdf_path in enumerate(input_pdf_paths):
        try:
            source_pdf = fitz.open(pdf_path)
            
            # Insert all pages from source PDF
            merged_pdf.insert_pdf(source_pdf)
            total_pages += len(source_pdf)
            
            source_pdf.close()
            
            if progress_callback:
                progress_callback(i + 1, total_files)
                
        except Exception as e:
            merged_pdf.close()
            raise Exception(f"Error merging {pdf_path}: {str(e)}")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    
    # Save merged PDF
    merged_pdf.save(output_pdf_path)
    merged_pdf.close()
    
    return {
        "success": True,
        "total_files": total_files,
        "total_pages": total_pages,
        "output_path": output_pdf_path,
        "output_size": os.path.getsize(output_pdf_path)
    }
