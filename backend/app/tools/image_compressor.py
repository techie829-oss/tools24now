"""
Image Compressor Tool - Enhanced
Reduces image file sizes with advanced compression options
"""

from PIL import Image
from pathlib import Path
import os
from typing import Optional
import tempfile


class ImageCompressorTool:
    """Tool for compressing images with quality control and advanced features"""

    # Quality presets
    QUALITY_PRESETS = {
        'maximum': 98,
        'high': 90,
        'balanced': 75,
        'compress': 60,
        'max_compress': 40
    }

    def compress_image(
        self, 
        input_path: str, 
        output_path: str, 
        quality: int = 85,
        target_size_kb: Optional[int] = None,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None,
        output_format: Optional[str] = None,
        preset: Optional[str] = None
    ) -> dict:
        """
        Compress image with advanced options
        
        Args:
            input_path: Path to source image
            output_path: Path for output image
            quality: Compression quality (1-100)
            target_size_kb: Target file size in KB (auto-adjusts quality)
            max_width: Maximum width (resize if larger)
            max_height: Maximum height (resize if larger)
            output_format: Output format (jpg, png, webp, avif, bmp, tiff, gif)
            preset: Quality preset name
            
        Returns:
            dict with compression results
        """
        
        # Apply preset if provided
        if preset and preset in self.QUALITY_PRESETS:
            quality = self.QUALITY_PRESETS[preset]
        
        # Validate quality
        quality = max(1, min(100, quality))
        
        # Open image
        img = Image.open(input_path)
        
        # Get original format
        original_format = img.format or 'PNG'
        
        # Determine output format
        if output_format:
            target_format = output_format.upper()
        else:
            target_format = original_format
        
        # Resize if specified
        original_dimensions = (img.width, img.height)
        if max_width or max_height:
            img = self._resize_image(img, max_width, max_height)
            was_resized = True
        else:
            was_resized = False
        
        # If target size is specified, find optimal quality
        if target_size_kb:
            quality = self._find_quality_for_target_size(
                img, output_path, target_format, target_size_kb, quality
            )
        
        # Compress and save
        self._save_image(img, output_path, target_format, quality)
        
        # Calculate results
        original_size = os.path.getsize(input_path)
        compressed_size = os.path.getsize(output_path)
        
        # Calculate reduction percentage
        reduction_percent = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0
        
        # Calculate compression ratio
        compression_ratio = (original_size / compressed_size) if compressed_size > 0 else 1
        
        return {
            'original_size': original_size,
            'compressed_size': compressed_size,
            'reduction_percent': round(reduction_percent, 2),
            'compression_ratio': round(compression_ratio, 2),
            'quality': quality,
            'format': target_format,
            'original_format': original_format,
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
        
        # Calculate new dimensions
        if max_width and max_height:
            # Fit within both constraints
            ratio = min(max_width / current_width, max_height / current_height)
        elif max_width:
            ratio = max_width / current_width
        elif max_height:
            ratio = max_height / current_height
        else:
            return img
        
        # Only resize if image is larger
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
        initial_quality: int
    ) -> int:
        """Find optimal quality to hit target file size using binary search"""
        
        target_bytes = target_kb * 1024
        low, high = 1, 100
        best_quality = initial_quality
        tolerance = 0.05  # Within 5% of target
        
        # Use a temporary file for testing
        with tempfile.NamedTemporaryFile(suffix=f'.{format.lower()}', delete=False) as tmp:
            temp_path = tmp.name
        
        try:
            for _ in range(10):  # Max 10 iterations
                mid = (low + high) // 2
                
                # Test compress with mid quality
                self._save_image(img, temp_path, format, mid)
                size = os.path.getsize(temp_path)
                
                # Check if within tolerance
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
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _save_image(self, img: Image.Image, output_path: str, format: str, quality: int):
        """Save image with format-specific optimization"""
        
        save_kwargs = {}
        
        if format in ['JPEG', 'JPG']:
            # JPEG compression
            # Convert RGBA to RGB for JPEG
            if img.mode in ['RGBA', 'LA', 'P']:
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[3])
                elif img.mode == 'LA':
                    background.paste(img, mask=img.split()[1])
                else:
                    img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[3])
                img = background
            
            save_kwargs['quality'] = quality
            save_kwargs['optimize'] = True
            save_kwargs['progressive'] = True
            
        elif format == 'PNG':
            # PNG optimization
            save_kwargs['optimize'] = True
            # PNG compress_level: 0-9, inverse of quality
            save_kwargs['compress_level'] = int((100 - quality) / 11)
            
        elif format == 'WEBP':
            # WebP compression
            save_kwargs['quality'] = quality
            save_kwargs['method'] = 6  # Best compression
            
        elif format == 'AVIF':
            # AVIF compression (requires pillow-avif-plugin)
            save_kwargs['quality'] = quality
            save_kwargs['speed'] = 6  # 0-10, 6 is balanced
            
        elif format == 'TIFF':
            # TIFF compression
            save_kwargs['compression'] = 'tiff_deflate'
            save_kwargs['quality'] = quality
            
        elif format == 'GIF':
            # GIF optimization
            if img.mode != 'P':
                img = img.convert('P', palette=Image.ADAPTIVE, colors=min(256, int(256 * (quality / 100))))
            save_kwargs['optimize'] = True
            
        elif format == 'BMP':
            # BMP has no compression options
            if img.mode in ['RGBA', 'LA']:
                img = img.convert('RGB')
        else:
            # Default: just optimize
            save_kwargs['optimize'] = True
        
        # Save image
        img.save(output_path, format=format, **save_kwargs)

    def get_image_info(self, image_path: str) -> dict:
        """
        Get information about an image
        
        Args:
            image_path: Path to image file
            
        Returns:
            dict with image information
        """
        img = Image.open(image_path)
        
        return {
            'format': img.format,
            'mode': img.mode,
            'size': img.size,
            'width': img.width,
            'height': img.height,
            'file_size': os.path.getsize(image_path)
        }
