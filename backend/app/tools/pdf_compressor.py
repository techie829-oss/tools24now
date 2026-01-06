"""
PDF Compressor Tool - Reduce PDF file size with quality options
"""
import fitz  # PyMuPDF
from typing import Callable, Optional
import os


# Quality presets
QUALITY_SETTINGS = {
    'low': {
        'image_quality': 50,
        'dpi': 72,
        'description': 'Smallest file size, lower quality (best for sharing)'
    },
    'medium': {
        'image_quality': 75,
        'dpi': 150,
        'description': 'Balanced size and quality (recommended)'
    },
    'high': {
        'image_quality': 85,
        'dpi': 300,
        'description': 'Best quality, larger file (for printing)'
    }
}


def compress_pdf(
    input_pdf_path: str,
    output_pdf_path: str,
    quality: str = 'medium',
    compress_by_percent: Optional[int] = None,
    max_file_size_mb: Optional[float] = None,
    progress_callback: Optional[Callable[[int, int], None]] = None
) -> dict:
    """
    Compress PDF by reducing image quality and optimizing structure.
    
    Args:
        input_pdf_path: Path to source PDF
        output_pdf_path: Path to save compressed PDF
        quality: 'low', 'medium', or 'high' (used if compress_by_percent and max_file_size_mb are None)
        compress_by_percent: Target compression percentage (e.g., 50 = reduce by 50%)
        max_file_size_mb: Target maximum file size in MB (e.g., 5.0 = max 5MB)
        progress_callback: Optional callback(current_page, total_pages)
    
    Returns:
        dict with compression results
        
    Raises:
        ValueError: If quality level is invalid
        FileNotFoundError: If input PDF doesn't exist
    """
    if not os.path.exists(input_pdf_path):
        raise FileNotFoundError(f"Input PDF not found: {input_pdf_path}")
    
    original_size = os.path.getsize(input_pdf_path)
    
    # Determine target size
    target_size = None
    if compress_by_percent:
        target_size = original_size * (1 - compress_by_percent / 100.0)
    elif max_file_size_mb:
        target_size = max_file_size_mb * 1024 * 1024
    
    # If target-based, use iterative compression
    if target_size:
        return _compress_to_target(
            input_pdf_path, 
            output_pdf_path, 
            target_size,
            original_size,
            progress_callback
        )
    
    # Otherwise use quality preset
    if quality not in QUALITY_SETTINGS:
        raise ValueError(f"Invalid quality: {quality}. Must be 'low', 'medium', or 'high'")
    
    settings = QUALITY_SETTINGS[quality]
    
    try:
        result = _compress_with_settings(
            input_pdf_path,
            output_pdf_path,
            settings,
            progress_callback
        )
        
        original_size = os.path.getsize(input_pdf_path)
        compressed_size = os.path.getsize(output_pdf_path)
        
        if original_size > 0:
            reduction_percent = ((original_size - compressed_size) / original_size) * 100
        else:
            reduction_percent = 0
        
        return {
            'success': True,
            'original_size': original_size,
            'compressed_size': compressed_size,
            'reduction_percent': round(reduction_percent, 1),
            'quality': quality,
            'total_pages': result['total_pages']
        }
        
    except Exception as e:
        raise Exception(f"Compression failed: {str(e)}")


def _compress_with_settings(input_path, output_path, settings, progress_callback=None):
    """Compress PDF with given quality settings."""
    from PIL import Image
    import io
    
    doc = fitz.open(input_path)
    total_pages = len(doc)
    out_doc = fitz.open()
    
    for page_num in range(total_pages):
        page = doc[page_num]
        
        # Get page dimensions
        rect = page.rect
        
        # Render page as image with quality-based DPI
        dpi = settings['dpi']
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PIL Image for JPEG compression
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Compress as JPEG
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=settings['image_quality'], optimize=True)
        output.seek(0)
        jpeg_data = output.read()
        
        # Create new PDF page with proper dimensions and insert compressed image
        new_page = out_doc.new_page(width=rect.width, height=rect.height)
        new_page.insert_image(rect, stream=jpeg_data)
        
        if progress_callback:
            progress_callback(page_num + 1, total_pages)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    out_doc.save(output_path, garbage=3, deflate=True, clean=True)
    out_doc.close()
    doc.close()
    
    return {'total_pages': total_pages}


def _compress_to_target(input_path, output_path, target_size, original_size, progress_callback=None):
    """Iteratively compress PDF to reach target file size using smart search."""
    import tempfile
    from PIL import Image
    import io
    
    # Get total pages from source document
    source_doc = fitz.open(input_path)
    total_pages = len(source_doc)
    source_doc.close()
    
    # Use a smarter approach - try combinations from low to high quality
    # Goal: Find the HIGHEST quality that still meets the target
    # More granular levels for better accuracy
    attempts = [
        {'dpi': 72, 'quality': 30},   # Lowest
        {'dpi': 72, 'quality': 40},   
        {'dpi': 72, 'quality': 50},   
        {'dpi': 72, 'quality': 60},   
        {'dpi': 100, 'quality': 45},  
        {'dpi': 100, 'quality': 55},  
        {'dpi': 100, 'quality': 65},  
        {'dpi': 100, 'quality': 75},  
        {'dpi': 150, 'quality': 60},  
        {'dpi': 150, 'quality': 70},  
        {'dpi': 150, 'quality': 80},  
        {'dpi': 200, 'quality': 70},  
        {'dpi': 200, 'quality': 80},  
        {'dpi': 200, 'quality': 90},  
        {'dpi': 300, 'quality': 85},  # Highest
    ]
    
    best_under_target = None  # Best quality that's under target
    closest_over_target = None  # Closest to target but over
    temp_path = output_path + ".tmp"
    
    for attempt in attempts:
        settings = {'dpi': attempt['dpi'], 'image_quality': attempt['quality']}
        
        try:
            print(f"Trying DPI:{attempt['dpi']}, Q:{attempt['quality']}")
            _compress_with_settings(input_path, temp_path, settings, progress_callback)
            compressed_size = os.path.getsize(temp_path)
            
            print(f"  Result: {compressed_size / 1024 / 1024:.1f}MB (target: {target_size / 1024 / 1024:.1f}MB)")
            
            # Calculate how close we are to target
            distance_from_target = abs(compressed_size - target_size)
            
            # If we're under target, keep it as best option so far
            if compressed_size <= target_size:
                if not best_under_target or compressed_size > best_under_target['size']:
                    # We want the HIGHEST file size that's still under target
                    # (this means best quality while meeting requirement)
                    best_under_target = {
                        'size': compressed_size,
                        'dpi': attempt['dpi'],
                        'quality': attempt['quality'],
                        'distance': distance_from_target
                    }
                    print(f"  ✓ New best (under target, {distance_from_target / 1024:.0f}KB from target)")
            else:
                # Track closest over target in case we can't get under
                if not closest_over_target or compressed_size < closest_over_target['size']:
                    closest_over_target = {
                        'size': compressed_size,
                        'dpi': attempt['dpi'],
                        'quality': attempt['quality'],
                        'distance': distance_from_target
                    }
                    
        except Exception as e:
            print(f"Failed with DPI:{attempt['dpi']}, Q:{attempt['quality']}: {e}")
            continue
    
    # Prefer best under target, but if none, use closest over target
    final_result = best_under_target if best_under_target else closest_over_target
    
    if final_result:
        settings = {'dpi': final_result['dpi'], 'image_quality': final_result['quality']}
        _compress_with_settings(input_path, output_path, settings, progress_callback)
        
        compressed_size = os.path.getsize(output_path)
        reduction_percent = ((original_size - compressed_size) / original_size) * 100
        
        # Calculate target reduction for comparison
        target_reduction = ((original_size - target_size) / original_size) * 100
        
        result = {
            'success': True,
            'original_size': original_size,
            'compressed_size': compressed_size,
            'reduction_percent': round(reduction_percent, 1),
            'quality': f'DPI:{final_result["dpi"]}, Q:{final_result["quality"]}',
            'total_pages': total_pages
        }
        
        # Add warning if we couldn't hit target
        if compressed_size > target_size:
            result['warning'] = f'Could not reach target. Best effort: {compressed_size / 1024 / 1024:.1f}MB (target was {target_size / 1024 / 1024:.1f}MB)'
        
        return result
    
    # Last resort - use lowest settings
    settings = {'dpi': 72, 'quality': 25}
    _compress_with_settings(input_path, output_path, settings, progress_callback)
    
    compressed_size = os.path.getsize(output_path)
    reduction_percent = ((original_size - compressed_size) / original_size) * 100
    
    return {
        'success': True,
        'original_size': original_size,
        'compressed_size': compressed_size,
        'reduction_percent': round(reduction_percent, 1),
        'quality': 'DPI:72, Q:25',
        'total_pages': total_pages,
        'warning': f'Used minimum quality. Result: {compressed_size / 1024 / 1024:.1f}MB'
    }
