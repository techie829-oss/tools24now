"""
PDF Splitter Tool - Extract specific pages from PDF files
"""

import fitz  # PyMuPDF
from pathlib import Path
from typing import List, Tuple
import io
from PIL import Image


class PDFSplitterTool:
    """Tool for splitting PDFs by extracting specific pages"""

    def __init__(self, max_thumbnail_size: Tuple[int, int] = (200, 280)):
        self.max_thumbnail_size = max_thumbnail_size

    def get_page_count(self, pdf_path: str) -> int:
        """Get total number of pages in PDF"""
        doc = fitz.open(pdf_path)
        count = doc.page_count
        doc.close()
        return count

    def extract_pages(self, pdf_path: str, pages: List[int], output_path: str) -> dict:
        """
        Extract specific pages from PDF
        
        Args:
            pdf_path: Path to source PDF
            pages: List of 0-indexed page numbers to extract
            output_path: Path for output PDF
            
        Returns:
            dict with extraction results
        """
        src_doc = fitz.open(pdf_path)
        dst_doc = fitz.open()

        # Validate and extract pages
        extracted_pages = []
        total_pages = src_doc.page_count

        for page_num in sorted(set(pages)):  # Remove duplicates and sort
            if 0 <= page_num < total_pages:
                dst_doc.insert_pdf(src_doc, from_page=page_num, to_page=page_num)
                extracted_pages.append(page_num)

        # Save output
        dst_doc.save(output_path)
        
        # Get file sizes
        import os
        original_size = os.path.getsize(pdf_path)
        split_size = os.path.getsize(output_path)

        dst_doc.close()
        src_doc.close()

        return {
            'total_pages_in_source': total_pages,
            'pages_extracted': len(extracted_pages),
            'extracted_page_numbers': extracted_pages,
            'original_size': original_size,
            'split_size': split_size,
            'output_path': output_path
        }

    def generate_thumbnail(self, pdf_path: str, page_num: int, output_path: str) -> dict:
        """
        Generate thumbnail for a specific page
        
        Args:
            pdf_path: Path to PDF
            page_num: 0-indexed page number
            output_path: Path for thumbnail PNG
            
        Returns:
            dict with thumbnail info
        """
        doc = fitz.open(pdf_path)
        
        if page_num < 0 or page_num >= doc.page_count:
            doc.close()
            raise ValueError(f"Invalid page number: {page_num}")

        page = doc[page_num]
        
        # Render at higher resolution for quality
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)

        # Convert to PIL Image
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))

        # Resize to thumbnail size
        img.thumbnail(self.max_thumbnail_size, Image.Resampling.LANCZOS)

        # Save
        img.save(output_path, "PNG", optimize=True)

        width, height = img.size
        doc.close()

        return {
            'page_number': page_num,
            'width': width,
            'height': height,
            'path': output_path
        }

    def parse_page_ranges(self, range_str: str, total_pages: int) -> List[int]:
        """
        Parse page range string into list of 0-indexed page numbers
        
        Examples:
            "1,3,5" -> [0, 2, 4]
            "1-3,5" -> [0, 1, 2, 4]
            "all" -> [0, 1, 2, ..., total_pages-1]
            
        Args:
            range_str: Page range string
            total_pages: Total pages in PDF
            
        Returns:
            List of 0-indexed page numbers
        """
        if not range_str or range_str.strip().lower() == "all":
            return list(range(total_pages))

        pages = set()
        parts = range_str.split(',')

        for part in parts:
            part = part.strip()
            if '-' in part:
                # Range like "1-5"
                start, end = part.split('-', 1)
                start = int(start.strip()) - 1  # Convert to 0-indexed
                end = int(end.strip()) - 1
                
                # Clamp to valid range
                start = max(0, min(start, total_pages - 1))
                end = max(0, min(end, total_pages - 1))
                
                if start <= end:
                    pages.update(range(start, end + 1))
            else:
                # Single page like "3"
                page = int(part) - 1  # Convert to 0-indexed
                if 0 <= page < total_pages:
                    pages.add(page)

        return sorted(list(pages))
