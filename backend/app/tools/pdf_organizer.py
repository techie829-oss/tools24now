"""
PDF Organizer Tool - Reorder, rearrange, and organize PDF pages
"""
import fitz  # PyMuPDF
from typing import List, Callable, Optional
import os


def reorder_pdf_pages(
    input_pdf_path: str,
    output_pdf_path: str,
    page_order: List[int],
    progress_callback: Optional[Callable[[int, int], None]] = None
) -> dict:
    """
    Reorder PDF pages based on provided order.
    
    Args:
        input_pdf_path: Path to source PDF
        output_pdf_path: Path to save reorganized PDF
        page_order: List of zero-indexed page numbers in desired order
                   e.g., [2, 0, 1] means page 3, page 1, page 2
        progress_callback: Optional callback(current, total)
    
    Returns:
        dict with success status and metadata
        
    Raises:
        ValueError: If page_order is invalid
        FileNotFoundError: If input PDF doesn't exist
    """
    if not os.path.exists(input_pdf_path):
        raise FileNotFoundError(f"Input PDF not found: {input_pdf_path}")
    
    # Open source PDF
    src_pdf = fitz.open(input_pdf_path)
    total_pages = len(src_pdf)
    
    # Validate page_order
    if len(page_order) != total_pages:
        src_pdf.close()
        raise ValueError(
            f"Page order length ({len(page_order)}) must match total pages ({total_pages})"
        )
    
    if set(page_order) != set(range(total_pages)):
        src_pdf.close()
        raise ValueError(
            "Invalid page order: must contain all page indices exactly once"
        )
    
    # Create new PDF with reordered pages
    new_pdf = fitz.open()
    
    for i, page_idx in enumerate(page_order):
        # Insert specific page from source PDF
        new_pdf.insert_pdf(src_pdf, from_page=page_idx, to_page=page_idx)
        
        if progress_callback:
            progress_callback(i + 1, total_pages)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    
    # Save output
    new_pdf.save(output_pdf_path)
    new_pdf.close()
    src_pdf.close()
    
    return {
        "success": True,
        "total_pages": total_pages,
        "output_path": output_pdf_path
    }


def generate_page_thumbnails(
    pdf_path: str,
    output_dir: str,
    thumbnail_width: int = 200,
    format: str = "png"
) -> List[str]:
    """
    Generate thumbnail images for all pages in a PDF.
    
    Args:
        pdf_path: Path to PDF file
        output_dir: Directory to save thumbnails
        thumbnail_width: Width of thumbnails in pixels (height auto-calculated)
        format: Image format ('png' or 'jpg')
    
    Returns:
        List of thumbnail file paths
    """
    os.makedirs(output_dir, exist_ok=True)
    
    pdf = fitz.open(pdf_path)
    thumbnail_paths = []
    
    for page_num in range(len(pdf)):
        page = pdf[page_num]
        
        # Calculate zoom to achieve desired width
        zoom = thumbnail_width / page.rect.width
        mat = fitz.Matrix(zoom, zoom)
        
        # Render page to image
        pix = page.get_pixmap(matrix=mat)
        
        # Save thumbnail
        filename = f"thumb_{page_num + 1:04d}.{format}"
        filepath = os.path.join(output_dir, filename)
        pix.save(filepath)
        
        thumbnail_paths.append(filepath)
    
    pdf.close()
    
    return thumbnail_paths
