import fitz  # PyMuPDF
from pathlib import Path
from typing import List, Tuple

class PDFEngine:
    def process_pdf(self, input_path: str, output_dir: str, dpi: int = 200, fmt: str = "png") -> Tuple[int, List[str]]:
        """
        Renders PDF pages to images.
        Returns (total_pages, list_of_output_paths)
        """
        doc = fitz.open(input_path)
        total_pages = len(doc)
        generated_files = []
        
        # Calculate zoom factor based on DPI (72 is base DPI)
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        
        output_path_obj = Path(output_dir)
        
        for i in range(total_pages):
            page = doc.load_page(i)
            pix = page.get_pixmap(matrix=mat)
            
            filename = f"page_{i+1:04d}.{fmt}"
            filepath = output_path_obj / filename
            
            pix.save(str(filepath))
            generated_files.append(str(filepath))
            
        doc.close()
        return total_pages, generated_files

pdf_engine = PDFEngine()
