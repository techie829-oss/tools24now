import zipfile
from pathlib import Path
from typing import List

class ZipGenerator:
    def create_zip(self, file_paths: List[str], zip_path: str):
        """
        Creates a ZIP file containing the specified files.
        """
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for file_path in file_paths:
                # Add file to zip with just the filename (no directories)
                zf.write(file_path, arcname=Path(file_path).name)
                
zip_generator = ZipGenerator()
