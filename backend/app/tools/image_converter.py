"""
Image Converter Tool
Converts images between different formats with quality control and advanced options
"""

from PIL import Image
from pathlib import Path
import os
from typing import Optional
import tempfile


class ImageConverterTool:
    """Tool for converting images between formats with advanced options"""

    SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp', 'tiff', 'gif']
    LOSSY_FORMATS = ['jpg', 'jpeg', 'webp', 'avif']

    def convert_image(
        self,
        input_path: str,
        output_path: str,
        target_format: str,
        quality: int = 85,
        target_size_kb: Optional[int] = None,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None,
        preserve_exif: bool = True
    ) -> dict:
        """
        Convert image to target format with quality control
        
        Args:
            input_path: Path to source image
            output_path: Path for output image
            target_format: Target format (jpg, png, webp, avif, bmp, tiff, gif)
            quality: Quality for lossy formats (1-100)
            target_size_kb: Target file size in KB
            max_width: Maximum width for resizing
            max_height: Maximum height for resizing
            preserve_exif: Preserve EXIF metadata
            
        Returns:
            dict with conversion results
        """
        
        # Validate and normalize format
        target_format = target_format.lower()
        if target_format not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {target_format}")
        
        if target_format == 'jpeg':
            target_format = 'jpg'
        
        # Validate quality
        quality = max(1, min(100, quality))
        
        # Open image
        img = Image.open(input_path)
        
        # Get original info
        original_format = img.format.lower() if img.format else 'unknown'
        original_dimensions = (img.width, img.height)
        
        # Preserve EXIF if requested
        exif_data = img.info.get('exif') if preserve_exif else None
        
        # Resize if specified
        if max_width or max_height:
            img = self._resize_image(img, max_width, max_height)
            was_resized = True
        else:
            was_resized = False
        
        # If target size is specified, find optimal quality
        if target_size_kb:
            quality = self._find_quality_for_target_size(
                img, output_path, target_format.upper(), target_size_kb, quality, exif_data
            )
        
        # Handle transparency for formats that don't support it
        if target_format in ['jpg'] and img.mode in ['RGBA', 'LA', 'P']:
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[3])
            elif img.mode == 'LA':
                background.paste(img, mask=img.split()[1])
            else:
                img = img.convert('RGBA')
                background.paste(img, mask=img.split()[3])
            img = background
        
        # Save with format-specific options
        self._save_image(img, output_path, target_format.upper(), quality, exif_data)
        
        # Calculate results
        input_size = os.path.getsize(input_path)
        output_size = os.path.getsize(output_path)
        size_diff_percent = ((output_size - input_size) / input_size * 100) if input_size > 0 else 0
        
        return {
            'original_format': original_format,
            'target_format': target_format,
            'input_size': input_size,
            'output_size': output_size,
            'size_diff_percent': round(size_diff_percent, 2),
            'quality': quality if target_format in self.LOSSY_FORMATS else None,
            'was_resized': was_resized,
            'original_dimensions': original_dimensions,
            'output_dimensions': (img.width, img.height),
            'output_path': output_path,
            'success': True
        }

    def _resize_image(
        self, 
        img: Image.Image, 
        max_width: Optional[int] = None, 
        max_height: Optional[int] = None
    ) -> Image.Image:
        """Resize image maintaining aspect ratio"""
        
        current_width, current_height = img.size
        
        if max_width and max_height:
            ratio = min(max_width / current_width, max_height / current_height)
        elif max_width:
            ratio = max_width / current_width
        elif max_height:
            ratio = max_height / current_height
        else:
            return img
        
        if ratio < 1:
            new_width = int(current_width * ratio)
            new_height = int(current_height * ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return img

    def _find_quality_for_target_size(
        self, 
        img: Image.Image, 
        output_path: str, 
        format: str, 
        target_kb: int,
        initial_quality: int,
        exif_data
    ) -> int:
        """Find optimal quality to hit target file size"""
        
        target_bytes = target_kb * 1024
        low, high = 1, 100
        best_quality = initial_quality
        tolerance = 0.05
        
        with tempfile.NamedTemporaryFile(suffix=f'.{format.lower()}', delete=False) as tmp:
            temp_path = tmp.name
        
        try:
            for _ in range(10):
                mid = (low + high) // 2
                self._save_image(img, temp_path, format, mid, exif_data)
                size = os.path.getsize(temp_path)
                
                if abs(size - target_bytes) < target_bytes * tolerance:
                    best_quality = mid
                    break
                elif size > target_bytes:
                    high = mid - 1
                else:
                    low = mid + 1
                    best_quality = mid
            
            return best_quality
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _save_image(self, img: Image.Image, output_path: str, format: str, quality: int, exif_data=None):
        """Save image with format-specific optimization"""
        
        save_kwargs = {}
        
        if format in ['JPEG', 'JPG']:
            save_kwargs['quality'] = quality
            save_kwargs['optimize'] = True
            save_kwargs['progressive'] = True
            
        elif format == 'PNG':
            save_kwargs['optimize'] = True
            save_kwargs['compress_level'] = int((100 - quality) / 11)
            
        elif format == 'WEBP':
            save_kwargs['quality'] = quality
            save_kwargs['method'] = 6
            
        elif format == 'AVIF':
            save_kwargs['quality'] = quality
            save_kwargs['speed'] = 6
            
        elif format == 'TIFF':
            save_kwargs['compression'] = 'tiff_deflate'
            save_kwargs['quality'] = quality
            
        elif format == 'GIF':
            if img.mode not in ['P', 'L']:
                img = img.convert('P', palette=Image.ADAPTIVE, colors=min(256, int(256 * (quality / 100))))
            save_kwargs['optimize'] = True
            
        elif format == 'BMP':
            if img.mode in ['RGBA', 'LA']:
                img = img.convert('RGB')
        else:
            save_kwargs['optimize'] = True
        
        # Add EXIF if available
        if exif_data and format in ['JPEG', 'JPG']:
            save_kwargs['exif'] = exif_data
        
        img.save(output_path, format=format, **save_kwargs)

    def get_image_info(self, image_path: str) -> dict:
        """Get information about an image"""
        img = Image.open(image_path)
        
        return {
            'format': img.format,
            'mode': img.mode,
            'size': img.size,
            'width': img.width,
            'height': img.height,
            'has_transparency': img.mode in ['RGBA', 'LA', 'P'],
            'file_size': os.path.getsize(image_path)
        }
