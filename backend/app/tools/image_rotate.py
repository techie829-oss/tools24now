from PIL import Image
import os
from typing import Tuple, Optional


class ImageRotateTool:
    """Tool for rotating and flipping images using PIL"""
    
    def __init__(self, input_path: str):
        """
        Initialize the rotate tool with an image
        
        Args:
            input_path: Path to the input image file
        """
        self.input_path = input_path
        self.image = Image.open(input_path)
        self.original_format = self.image.format
        self.original_size = self.image.size
        
        # Convert RGBA to RGB if saving as JPEG
        if self.image.mode == 'RGBA':
            self.has_alpha = True
        else:
            self.has_alpha = False
    
    def get_image_info(self) -> dict:
        """Get information about the image"""
        return {
            'width': self.image.width,
            'height': self.image.height,
            'format': self.original_format,
            'mode': self.image.mode,
            'size_bytes': os.path.getsize(self.input_path)
        }
    
    def apply_transforms(self, rotation: float, flip_h: bool, flip_v: bool) -> Image.Image:
        """
        Apply rotation and flip transformations
        
        Args:
            rotation: Rotation angle in degrees
            flip_h: Whether to flip horizontally
            flip_v: Whether to flip vertically
            
        Returns:
            Transformed PIL Image
        """
        img = self.image.copy()
        
        # 1. Apply Rotation (negative because PIL rotates counter-clockwise by default)
        # expand=True resizing the canvas to fit the rotated image
        if rotation != 0:
            img = img.rotate(-rotation, expand=True, resample=Image.BICUBIC)
            
        # 2. Apply Flips
        if flip_h:
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
            
        if flip_v:
            img = img.transpose(Image.FLIP_TOP_BOTTOM)
            
        return img
    
    def save(
        self,
        output_path: str,
        transformed_image: Image.Image,
        output_format: Optional[str] = None,
        quality: int = 95
    ) -> dict:
        """
        Save the transformed image
        
        Args:
            output_path: Path where to save the image
            transformed_image: The PIL Image to save
            output_format: Output format (jpg, png, webp) or None to keep original
            quality: JPEG quality (1-100)
        
        Returns:
            Dictionary with output file info
        """
        # Determine output format
        if output_format:
            save_format = output_format.upper()
            if save_format == 'JPG':
                save_format = 'JPEG'
        else:
            save_format = self.original_format or 'JPEG'
        
        # Convert RGBA to RGB for JPEG
        if save_format == 'JPEG' and transformed_image.mode in ('RGBA', 'LA', 'P'):
            rgb_image = Image.new('RGB', transformed_image.size, (255, 255, 255))
            if transformed_image.mode == 'P':
                transformed_image = transformed_image.convert('RGBA')
            rgb_image.paste(transformed_image, mask=transformed_image.split()[-1] if transformed_image.mode == 'RGBA' else None)
            transformed_image = rgb_image
        
        # Save with appropriate parameters
        save_kwargs = {}
        if save_format == 'JPEG':
            save_kwargs['quality'] = quality
            save_kwargs['optimize'] = True
        elif save_format == 'PNG':
            save_kwargs['optimize'] = True
        elif save_format == 'WEBP':
            save_kwargs['quality'] = quality
        
        transformed_image.save(output_path, format=save_format, **save_kwargs)
        
        return {
            'output_path': output_path,
            'format': save_format,
            'width': transformed_image.width,
            'height': transformed_image.height,
            'size_bytes': os.path.getsize(output_path)
        }
