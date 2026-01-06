"""
Image Cropper Tool
Crops images using coordinates or aspect ratio presets
"""

from PIL import Image
from pathlib import Path
import os
from typing import Optional, Tuple


class ImageCropperTool:
    """Tool for cropping images with aspect ratio presets"""

    ASPECT_RATIOS = {
        '1:1': (1, 1),      # Square - Instagram, profile pics
        '4:3': (4, 3),      # Classic photos
        '3:2': (3, 2),      # Standard camera
        '16:9': (16, 9),    # Widescreen, YouTube
        '9:16': (9, 16),    # Vertical video, stories
        'custom': None      # Freeform
    }

    def crop_image(
        self,
        input_path: str,
        output_path: str,
        # Crop coordinates
        x: int = 0,
        y: int = 0,
        width: Optional[int] = None,
        height: Optional[int] = None,
        # Or use aspect ratio
        aspect_ratio: Optional[str] = None,
        center_crop: bool = False,
        # Options
        output_format: Optional[str] = None,
        quality: int = 85
    ) -> dict:
        """
        Crop image to specified area
        
        Args:
            input_path: Path to source image
            output_path: Path for output image
            x: Left position of crop box
            y: Top position of crop box
            width: Width of crop box
            height: Height of crop box
            aspect_ratio: Aspect ratio preset (1:1, 4:3, 16:9, etc.)
            center_crop: Center the crop box in image
            output_format: Output format (jpg, png, webp, etc.)
            quality: Quality for lossy formats (1-100)
            
        Returns:
            dict with crop results
        """
        
        # Open image
        img = Image.open(input_path)
        img_width, img_height = img.size
        original_format = img.format or 'PNG'
        
        # Determine target format
        if output_format:
            target_format = output_format.upper()
        else:
            target_format = original_format
        
        # Calculate crop box
        if aspect_ratio and aspect_ratio != 'custom':
            # Use aspect ratio preset
            if aspect_ratio not in self.ASPECT_RATIOS:
                raise ValueError(f"Unknown aspect ratio: {aspect_ratio}")
            
            ratio_w, ratio_h = self.ASPECT_RATIOS[aspect_ratio]
            
            if center_crop:
                # Calculate max dimensions that fit the aspect ratio
                if img_width / img_height > ratio_w / ratio_h:
                    # Image is wider, fit to height
                    crop_height = img_height
                    crop_width = int(crop_height * ratio_w / ratio_h)
                else:
                    # Image is taller, fit to width
                    crop_width = img_width
                    crop_height = int(crop_width * ratio_h / ratio_w)
                
                # Center the crop box
                crop_x = (img_width - crop_width) // 2
                crop_y = (img_height - crop_height) // 2
            else:
                # Use provided x, y or default to 0, 0
                # Calculate dimensions from aspect ratio
                if width:
                    crop_width = width
                    crop_height = int(width * ratio_h / ratio_w)
                elif height:
                    crop_height = height
                    crop_width = int(height * ratio_w / ratio_h)
                else:
                    # Use max size that fits aspect ratio
                    if img_width / img_height > ratio_w / ratio_h:
                        crop_height = img_height
                        crop_width = int(crop_height * ratio_w / ratio_h)
                    else:
                        crop_width = img_width
                        crop_height = int(crop_width * ratio_h / ratio_w)
                
                crop_x = x
                crop_y = y
            
            resize_method = f'aspect_ratio:{aspect_ratio}'
        else:
            # Use provided coordinates
            if not width or not height:
                raise ValueError("Width and height required for custom crop")
            
            crop_x = x
            crop_y = y
            crop_width = width
            crop_height = height
            resize_method = f'coordinates:{crop_x},{crop_y},{crop_width},{crop_height}'
        
        # Validate crop box
        if crop_x < 0 or crop_y < 0:
            raise ValueError("Crop position cannot be negative")
        if crop_x + crop_width > img_width or crop_y + crop_height > img_height:
            raise ValueError(f"Crop area ({crop_x},{crop_y},{crop_width},{crop_height}) exceeds image boundaries ({img_width}×{img_height})")
        if crop_width <= 0 or crop_height <= 0:
            raise ValueError("Crop dimensions must be positive")
        
        # Crop image (PIL format: left, upper, right, lower)
        crop_box = (crop_x, crop_y, crop_x + crop_width, crop_y + crop_height)
        cropped_img = img.crop(crop_box)
        
        # Handle transparency for formats that don't support it
        if target_format in ['JPEG', 'JPG'] and cropped_img.mode in ['RGBA', 'LA', 'P']:
            background = Image.new('RGB', cropped_img.size, (255, 255, 255))
            if cropped_img.mode == 'RGBA':
                background.paste(cropped_img, mask=cropped_img.split()[3])
            elif cropped_img.mode == 'LA':
                background.paste(cropped_img, mask=cropped_img.split()[1])
            else:
                cropped_img = cropped_img.convert('RGBA')
                background.paste(cropped_img, mask=cropped_img.split()[3])
            cropped_img = background
        
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
        
        cropped_img.save(output_path, format=target_format, **save_kwargs)
        
        # Calculate results
        original_size = os.path.getsize(input_path)
        cropped_size = os.path.getsize(output_path)
        
        # Calculate aspect ratio of cropped image
        final_aspect_ratio = f"{crop_width}:{crop_height}"
        if aspect_ratio and aspect_ratio != 'custom':
            final_aspect_ratio = aspect_ratio
        
        return {
            'original_dimensions': (img_width, img_height),
            'cropped_dimensions': (crop_width, crop_height),
            'crop_box': (crop_x, crop_y, crop_x + crop_width, crop_y + crop_height),
            'original_size': original_size,
            'cropped_size': cropped_size,
            'crop_method': resize_method,
            'aspect_ratio': final_aspect_ratio,
            'center_crop': center_crop,
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
