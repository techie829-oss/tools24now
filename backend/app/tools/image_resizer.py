"""
Image Resizer Tool
Resizes images using dimensions, percentage, or presets
"""

from PIL import Image
from pathlib import Path
import os
from typing import Optional, Tuple


class ImageResizerTool:
    """Tool for resizing images with multiple methods"""

    RESAMPLING_METHODS = {
        'lanczos': Image.Resampling.LANCZOS,      # Best quality
        'bicubic': Image.Resampling.BICUBIC,      # Good quality
        'bilinear': Image.Resampling.BILINEAR,    # Fast
        'nearest': Image.Resampling.NEAREST       # Fastest, pixelated
    }

    PRESETS = {
        'thumbnail': (150, 150),
        'small': (480, 480),
        'medium': (800, 800),
        'large': (1200, 1200),
        'hd': (1920, 1080),
        '4k': (3840, 2160)
    }

    def resize_image(
        self,
        input_path: str,
        output_path: str,
        # Resize methods
        width: Optional[int] = None,
        height: Optional[int] = None,
        scale_percent: Optional[float] = None,
        preset: Optional[str] = None,
        # Options
        maintain_aspect: bool = True,
        resampling: str = 'lanczos',
        output_format: Optional[str] = None,
        quality: int = 85
    ) -> dict:
        """
        Resize image using various methods
        
        Args:
            input_path: Path to source image
            output_path: Path for output image
            width: Target width in pixels
            height: Target height in pixels
            scale_percent: Scale percentage (e.g., 50 = 50%)
            preset: Preset name (thumbnail, small, medium, large, hd, 4k)
            maintain_aspect: Maintain aspect ratio
            resampling: Resampling method (lanczos, bicubic, bilinear, nearest)
            output_format: Output format (jpg, png, webp, etc.)
            quality: Quality for lossy formats (1-100)
            
        Returns:
            dict with resize results
        """
        
        # Open image
        img = Image.open(input_path)
        original_width, original_height = img.size
        original_format = img.format or 'PNG'
        
        # Determine target format
        if output_format:
            target_format = output_format.upper()
        else:
            target_format = original_format
        
        # Calculate target dimensions (priority: preset > scale_percent > width/height)
        if preset and preset in self.PRESETS:
            # Use preset dimensions
            target_width, target_height = self.PRESETS[preset]
            resize_method = f'preset:{preset}'
            
        elif scale_percent is not None:
            # Calculate from percentage
            target_width = int(original_width * (scale_percent / 100))
            target_height = int(original_height * (scale_percent / 100))
            resize_method = f'percentage:{scale_percent}%'
            
        else:
            # Use provided width/height
            if maintain_aspect:
                # Calculate missing dimension
                if width and not height:
                    aspect_ratio = original_height / original_width
                    target_width = width
                    target_height = int(width * aspect_ratio)
                elif height and not width:
                    aspect_ratio = original_width / original_height
                    target_height = height
                    target_width = int(height * aspect_ratio)
                elif width and height:
                    # Both provided, use as-is but warn
                    target_width = width
                    target_height = height
                else:
                    raise ValueError("Must provide width, height, scale_percent, or preset")
            else:
                # Use exact dimensions
                if not width or not height:
                    raise ValueError("Must provide both width and height when aspect ratio is not maintained")
                target_width = width
                target_height = height
            
            resize_method = f'dimensions:{target_width}x{target_height}'
        
        # Detect upscaling
        is_upscaling = (target_width > original_width) or (target_height > original_height)
        
        # Get resampling filter
        resample_filter = self.RESAMPLING_METHODS.get(resampling, Image.Resampling.LANCZOS)
        
        # Resize image
        resized_img = img.resize((target_width, target_height), resample_filter)
        
        # Handle transparency for formats that don't support it
        if target_format in ['JPEG', 'JPG'] and resized_img.mode in ['RGBA', 'LA', 'P']:
            background = Image.new('RGB', resized_img.size, (255, 255, 255))
            if resized_img.mode == 'RGBA':
                background.paste(resized_img, mask=resized_img.split()[3])
            elif resized_img.mode == 'LA':
                background.paste(resized_img, mask=resized_img.split()[1])
            else:
                resized_img = resized_img.convert('RGBA')
                background.paste(resized_img, mask=resized_img.split()[3])
            resized_img = background
        
        # Save with format-specific options
        save_kwargs = {}
        
        if target_format in ['JPEG', 'JPG']:
            save_kwargs['quality'] = quality
            save_kwargs['optimize'] = True
            save_kwargs['progressive'] = True
        elif target_format == 'PNG':
            save_kwargs['optimize'] = True
        elif target_format == 'WEBP':
            save_kwargs['quality'] = quality
            save_kwargs['method'] = 6
        elif target_format == 'AVIF':
            save_kwargs['quality'] = quality
            save_kwargs['speed'] = 6
        else:
            save_kwargs['optimize'] = True
        
        resized_img.save(output_path, format=target_format, **save_kwargs)
        
        # Calculate results
        original_size = os.path.getsize(input_path)
        resized_size = os.path.getsize(output_path)
        
        # Calculate scale factor
        scale_factor_x = target_width / original_width
        scale_factor_y = target_height / original_height
        
        return {
            'original_dimensions': (original_width, original_height),
            'resized_dimensions': (target_width, target_height),
            'original_size': original_size,
            'resized_size': resized_size,
            'scale_factor_x': round(scale_factor_x, 2),
            'scale_factor_y': round(scale_factor_y, 2),
            'resize_method': resize_method,
            'resampling': resampling,
            'is_upscaling': is_upscaling,
            'maintained_aspect': maintain_aspect,
            'original_format': original_format,
            'output_format': target_format,
            'quality': quality,
            'output_path': output_path,
            'success': True
        }

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
