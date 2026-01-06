"""
Image Filters & Effects Tool
Apply filters and effects using PIL/Pillow - no AI, fully independent
"""

from PIL import Image, ImageEnhance, ImageFilter
from pathlib import Path
import os
from typing import Optional


class ImageFiltersTool:
    """Tool for applying filters and effects to images"""

    def apply_filters(
        self,
        input_path: str,
        output_path: str,
        # Adjustments (0.0 - 2.0, where 1.0 is original)
        brightness: float = 1.0,
        contrast: float = 1.0,
        saturation: float = 1.0,
        sharpness: float = 1.0,
        # Effects
        blur: int = 0,  # 0 = none, 1-10 = blur radius
        sharpen: bool = False,
        edge_enhance: bool = False,
        # Filters
        grayscale: bool = False,
        sepia: bool = False,
        # Output
        output_format: Optional[str] = None,
        quality: int = 95
    ) -> dict:
        """
        Apply filters and effects to image
        
        Args:
            input_path: Path to source image
            output_path: Path for output image
            brightness: 0.0 (black) to 2.0 (very bright), 1.0 = original
            contrast: 0.0 (gray) to 2.0 (high contrast), 1.0 = original
            saturation: 0.0 (grayscale) to 2.0 (very saturated), 1.0 = original
            sharpness: 0.0 (blurred) to 2.0 (sharp), 1.0 = original
            blur: Blur radius (0-10)
            sharpen: Apply sharpen filter
            edge_enhance: Enhance edges
            grayscale: Convert to grayscale
            sepia: Apply sepia tone
            output_format: Output format (jpg, png, webp, etc.)
            quality: Quality for lossy formats (1-100)
            
        Returns:
            dict with processing results
        """
        
        # Open image
        img = Image.open(input_path)
        original_mode = img.mode
        original_format = img.format or 'PNG'
        
        # Convert to RGB if needed (for processing)
        if img.mode not in ['RGB', 'RGBA']:
            img = img.convert('RGB')
        
        # Apply color adjustments
        if brightness != 1.0:
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(brightness)
        
        if contrast != 1.0:
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(contrast)
        
        if saturation != 1.0:
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(saturation)
        
        if sharpness != 1.0:
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(sharpness)
        
        # Apply filters
        if grayscale:
            img = img.convert('L').convert('RGB')
        
        if sepia:
            img = self._apply_sepia(img)
        
        if blur > 0:
            img = img.filter(ImageFilter.GaussianBlur(radius=blur))
        
        if sharpen:
            img = img.filter(ImageFilter.SHARPEN)
        
        if edge_enhance:
            img = img.filter(ImageFilter.EDGE_ENHANCE)
        
        # Determine target format
        if output_format:
            target_format = output_format.upper()
        else:
            target_format = original_format
        
        # Handle transparency for JPEG
        if target_format in ['JPEG', 'JPG'] and img.mode in ['RGBA', 'LA', 'P']:
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[3])
            else:
                background.paste(img)
            img = background
        
        # Save with format-specific options
        save_kwargs = {}
        
        if target_format in ['JPEG', 'JPG']:
            save_kwargs['quality'] = quality
            save_kwargs['optimize'] = True
        elif target_format == 'PNG':
            save_kwargs['optimize'] = True
        elif target_format == 'WEBP':
            save_kwargs['quality'] = quality
            save_kwargs['method'] = 6
        elif target_format == 'AVIF':
            save_kwargs['quality'] = quality
        
        img.save(output_path, format=target_format, **save_kwargs)
        
        # Calculate results
        original_size = os.path.getsize(input_path)
        output_size = os.path.getsize(output_path)
        
        # Track applied filters
        applied_filters = []
        if brightness != 1.0:
            applied_filters.append(f'brightness:{brightness}')
        if contrast != 1.0:
            applied_filters.append(f'contrast:{contrast}')
        if saturation != 1.0:
            applied_filters.append(f'saturation:{saturation}')
        if sharpness != 1.0:
            applied_filters.append(f'sharpness:{sharpness}')
        if blur > 0:
            applied_filters.append(f'blur:{blur}')
        if sharpen:
            applied_filters.append('sharpen')
        if edge_enhance:
            applied_filters.append('edge_enhance')
        if grayscale:
            applied_filters.append('grayscale')
        if sepia:
            applied_filters.append('sepia')
        
        return {
            'original_size': original_size,
            'output_size': output_size,
            'dimensions': img.size,
            'applied_filters': applied_filters,
            'original_format': original_format,
            'output_format': target_format,
            'quality': quality,
            'success': True
        }
    
    def _apply_sepia(self, img: Image.Image) -> Image.Image:
        """Apply sepia tone effect"""
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Sepia matrix
        pixels = img.load()
        width, height = img.size
        
        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y]
                
                # Sepia formula
                tr = int(0.393 * r + 0.769 * g + 0.189 * b)
                tg = int(0.349 * r + 0.686 * g + 0.168 * b)
                tb = int(0.272 * r + 0.534 * g + 0.131 * b)
                
                # Clamp values
                pixels[x, y] = (
                    min(255, tr),
                    min(255, tg),
                    min(255, tb)
                )
        
        return img
    
    def get_image_info(self, image_path: str) -> dict:
        """Get information about an image"""
        img = Image.open(image_path)
        
        return {
            'format': img.format,
            'mode': img.mode,
            'size': img.size,
            'width': img.width,
            'height': img.height,
            'file_size': os.path.getsize(image_path)
        }
