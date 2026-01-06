from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageColor
import os
from typing import Tuple, Optional, Union


class ImageWatermarkTool:
    """Tool for adding text and logo watermarks to images"""
    
    def __init__(self, input_path: str):
        """
        Initialize the watermark tool with an image
        """
        self.input_path = input_path
        self.image = Image.open(input_path).convert("RGBA")
        self.original_format = Image.open(input_path).format
        self.original_size = self.image.size
        
        # Load default font (try system fonts or fallback)
        self.font_path = self._get_default_font_path()

    def _get_default_font_path(self) -> str:
        """Try to find a good default font"""
        possible_fonts = [
            "/Library/Fonts/Arial.ttf",              # macOS
            "/System/Library/Fonts/Helvetica.ttc",   # macOS
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", # Linux
            "arial.ttf"                              # Windows/Fallback
        ]
        
        for font in possible_fonts:
            if os.path.exists(font):
                return font
        return "arial.ttf" # PIL default fallback

    def _calculate_position(self, 
                           bg_size: Tuple[int, int], 
                           fg_size: Tuple[int, int], 
                           position: str,
                           padding: int = 20) -> Tuple[int, int]:
        """
        Calculate (x, y) coordinates based on position string
        
        Positions: top-left, top-center, top-right
                   center-left, center, center-right
                   bottom-left, bottom-center, bottom-right
        """
        bg_w, bg_h = bg_size
        fg_w, fg_h = fg_size
        
        x, y = 0, 0
        
        # Horizontal
        if 'left' in position:
            x = padding
        elif 'right' in position:
            x = bg_w - fg_w - padding
        else: # center
            x = (bg_w - fg_w) // 2
            
        # Vertical
        if 'top' in position:
            y = padding
        elif 'bottom' in position:
            y = bg_h - fg_h - padding
        else: # center
            y = (bg_h - fg_h) // 2
            
        return (x, y)

    def add_text_watermark(self, 
                          text: str, 
                          size: int = 40, 
                          color: str = "#ffffff", 
                          opacity: int = 50, 
                          rotation: int = 0,
                          position: str = "center") -> Image.Image:
        """
        Add text watermark to the image
        """
        # Create a transparent layer for the watermark
        txt_layer = Image.new('RGBA', self.image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)
        
        # Load font
        try:
            font = ImageFont.truetype(self.font_path, size)
        except OSError:
            font = ImageFont.load_default()
            
        # Parse color
        if color.startswith('#'):
            rgb = ImageColor.getrgb(color)
        else:
            rgb = (255, 255, 255)
            
        # Draw text
        # Get text size
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Create a separate small image for rotation
        # Add padding to avoid clipping during rotation
        rot_size = int(max(text_width, text_height) * 1.5)
        text_img = Image.new('RGBA', (rot_size, rot_size), (255, 255, 255, 0))
        text_draw = ImageDraw.Draw(text_img)
        
        # Draw centered in the small image
        text_x = (rot_size - text_width) // 2
        text_y = (rot_size - text_height) // 2
        
        text_draw.text((text_x, text_y), text, font=font, fill=(*rgb, int(255 * (opacity / 100))))
        
        # Rotate
        if rotation != 0:
            text_img = text_img.rotate(rotation, resample=Image.BICUBIC, expand=True)
            
        # Calculate position on main image
        final_x, final_y = self._calculate_position(self.image.size, text_img.size, position)
        
        # Paste onto main layer
        self.image.alpha_composite(text_img, dest=(final_x, final_y))
        
        return self.image

    def add_logo_watermark(self, 
                          logo_path: str, 
                          scale: int = 20, 
                          opacity: int = 100, 
                          rotation: int = 0,
                          position: str = "bottom-right") -> Image.Image:
        """
        Add logo watermark to the image
        """
        logo = Image.open(logo_path).convert("RGBA")
        
        # Resize logo based on scale (percentage of main image width)
        target_width = int(self.image.width * (scale / 100))
        aspect_ratio = logo.height / logo.width
        target_height = int(target_width * aspect_ratio)
        
        logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Apply opacity if needed
        if opacity < 100:
            # Create an alpha mask from the logo's alpha channel
            alpha = logo.split()[3]
            alpha = ImageEnhance.Brightness(alpha).enhance(opacity / 100.0)
            logo.putalpha(alpha)
            
        # Rotate
        if rotation != 0:
            logo = logo.rotate(rotation, resample=Image.BICUBIC, expand=True)
            
        # Calculate position
        x, y = self._calculate_position(self.image.size, logo.size, position)
        
        # Composite
        self.image.alpha_composite(logo, dest=(x, y))
        
        return self.image

    def save(self, output_path: str, format: str = None, quality: int = 95) -> dict:
        """Save the processed image"""
        save_format = format or self.original_format or 'JPEG'
        
        # Convert back to RGB if saving as JPEG (no transparency support)
        img_to_save = self.image
        if save_format.upper() in ('JPEG', 'JPG'):
            img_to_save = self.image.convert('RGB')
            
        output_path_final = output_path
        # Ensure extension matches format
        if save_format.upper() == 'JPEG' and not output_path.lower().endswith(('.jpg', '.jpeg')):
             output_path_final = os.path.splitext(output_path)[0] + '.jpg'
             
        img_to_save.save(output_path_final, format=save_format, quality=quality)
        
        return {
            'output_path': output_path_final,
            'width': img_to_save.width,
            'height': img_to_save.height,
            'size_bytes': os.path.getsize(output_path_final)
        }
