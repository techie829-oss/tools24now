"""
PDF Deskew Tool - Automatically correct skewed/tilted scanned documents
"""
import fitz  # PyMuPDF
from PIL import Image
import cv2
import numpy as np
import os
from typing import Callable, Optional
from skimage.transform import rotate
from skimage.color import rgb2gray


def detect_skew_angle(image_array: np.ndarray) -> float:
    """
    Detect skew angle of an image using Hough Line Transform.
    
    Args:
        image_array: Image as numpy array
    
    Returns:
        Detected skew angle in degrees
    """
    # Convert to grayscale if needed
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    
    # Apply edge detection
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    
    # Detect lines using Hough transform
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
    
    if lines is None:
        return 0.0
    
    # Calculate angles of detected lines
    angles = []
    for rho, theta in lines[:, 0]:
        angle = np.degrees(theta) - 90
        # Focus on horizontal lines (around 0 degrees)
        if -45 < angle < 45:
            angles.append(angle)
    
    if not angles:
        return 0.0
    
    # Return median angle (robust to outliers)
    return float(np.median(angles))


def deskew_image(image: Image.Image) -> Image.Image:
    """
    Deskew a PIL Image.
    
    Args:
        image: PIL Image
    
    Returns:
        Deskewed PIL Image
    """
    # Convert PIL Image to numpy array
    img_array = np.array(image)
    
    # Detect skew angle
    angle = detect_skew_angle(img_array)
    
    # If angle is very small, skip rotation
    if abs(angle) < 0.1:
        return image
    
    # Rotate to correct skew
    # Note: rotate from skimage handles RGB images properly
    rotated = rotate(img_array, angle, resize=True, mode='edge', preserve_range=True)
    
    # Convert back to PIL Image
    rotated = rotated.astype(np.uint8)
    return Image.fromarray(rotated)


def deskew_pdf(
    input_pdf_path: str,
    output_pdf_path: str,
    progress_callback: Optional[Callable[[int, int], None]] = None
) -> dict:
    """
    Deskew all pages in a PDF.
    
    Args:
        input_pdf_path: Path to input PDF
        output_pdf_path: Path to save deskewed PDF
        progress_callback: Optional callback(current_page, total_pages)
    
    Returns:
        dict with processing results
    """
    if not os.path.exists(input_pdf_path):
        raise FileNotFoundError(f"PDF not found: {input_pdf_path}")
    
    try:
        doc = fitz.open(input_pdf_path)
        total_pages = len(doc)
        
        # Create output PDF
        out_doc = fitz.open()
        
        angles_detected = []
        
        for page_num in range(total_pages):
            page = doc[page_num]
            
            # Render page at high resolution for better skew detection
            mat = fitz.Matrix(300 / 72, 300 / 72)  # 300 DPI
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Deskew the image
            deskewed_img = deskew_image(img)
            
            # Get angle that was corrected (for reporting)
            img_array = np.array(img)
            angle = detect_skew_angle(img_array)
            angles_detected.append(angle)
            
            # Convert back to PDF
            # Save deskewed image to bytes
            import io
            img_bytes = io.BytesIO()
            deskewed_img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Create new page with same dimensions asoriginal
            rect = page.rect
            new_page = out_doc.new_page(width=rect.width, height=rect.height)
            
            # Insert deskewed image
            new_page.insert_image(rect, stream=img_bytes.read())
            
            if progress_callback:
                progress_callback(page_num + 1, total_pages)
        
        doc.close()
        
        # Save output PDF
        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
        out_doc.save(output_pdf_path)
        out_doc.close()
        
        return {
            'total_pages': total_pages,
            'angles_corrected': angles_detected,
            'avg_angle': float(np.mean([abs(a) for a in angles_detected])),
            'output_file': output_pdf_path
        }
        
    except Exception as e:
        raise Exception(f"Deskew failed: {str(e)}")
