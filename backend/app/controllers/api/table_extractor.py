from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import pdfplumber
import pandas as pd
import io
import json
from typing import List, Dict, Any

router = APIRouter()

class TableExtractor:
    @staticmethod
    def extract_preview(file_bytes: bytes, flavor: str = "lattice") -> List[Dict[str, Any]]:
        """
        Extracts tables from a PDF and returns them structured for JSON preview.
        flavor: 'lattice' (for bordered tables) or 'stream' (for whitespace tables)
        """
        tables_data = []
        table_settings = {
            "vertical_strategy": "lines" if flavor == "lattice" else "text", 
            "horizontal_strategy": "lines" if flavor == "lattice" else "text",
            "intersection_y_tolerance": 10,  # tweak for lattice
        }
        
        # pdfplumber extract_tables args are a bit different. 
        # It takes a dictionary of settings.
        # simpler: use extract_tables(table_settings={...})
        
        # Actually pdfplumber documentation says:
        # page.extract_tables(table_settings={...}) 
        # And the settings keys define the strategy.
        # For "lattice", we want default behavior usually? Or explicit line detection.
        # For "stream", we rely on text alignment.
        
        # Let's map "lattice" -> default strategy (works best for lines) or explicitly 'lines' related
        # "stream" -> text based.
        
        settings = {}
        if flavor == "stream":
            settings = {"vertical_strategy": "text", "horizontal_strategy": "text"}
        # else default is effectively lattice-like or mixed. 
        
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables(table_settings=settings)
                    for table_idx, table in enumerate(tables):
                        # Clean up None values and excessive whitespace
                        cleaned_table = [
                            [str(cell).strip() if cell is not None else "" for cell in row]
                            for row in table
                        ]
                        
                        if not cleaned_table:
                            continue

                        tables_data.append({
                            "page": page_num + 1,
                            "table_index": table_idx + 1,
                            "rows": cleaned_table
                        })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting tables: {str(e)}")
        
        return tables_data

    @staticmethod
    def extract_and_export(file_bytes: bytes, format: str, flavor: str = "lattice") -> tuple[io.BytesIO, str, str]:
        """
        Extracts tables and exports them to a single CSV (all tables merged) or Excel (sheets per table).
        """
        all_dfs = []
        settings = {}
        if flavor == "stream":
            settings = {"vertical_strategy": "text", "horizontal_strategy": "text"}

        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables(table_settings=settings)
                    for table_idx, table in enumerate(tables):
                        cleaned_table = [
                            [str(cell).strip() if cell is not None else "" for cell in row]
                            for row in table
                        ]
                        if cleaned_table:
                            # For stream, sometimes header is the first row, sometimes not. 
                            # We'll assume first row is header for DataFrame creation, or no header.
                            # To be safe, let's just create DF and let user decide.
                            # But usually row 0 is header.
                            if len(cleaned_table) > 1:
                                df = pd.DataFrame(cleaned_table[1:], columns=cleaned_table[0])
                            else:
                                df = pd.DataFrame(cleaned_table) # Single row table?
                                
                            # Add metadata for tracking
                            df._meta_page = page_num + 1
                            df._meta_idx = table_idx + 1
                            all_dfs.append(df)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting tables: {str(e)}")

        if not all_dfs:
             raise HTTPException(status_code=400, detail="No tables found in this PDF.")

        output = io.BytesIO()

        if format == 'csv':
            # For CSV, we can either zip them or merge them. 
            # Combining into one big CSV with blank lines is often easiest for single file download.
            # Or we just return the first table? 
            # Let's concatenate with a separator row for now to keep it simple in one file.
            final_df = pd.concat(all_dfs, keys=[f"Page {df._meta_page} Table {df._meta_idx}" for df in all_dfs])
            final_df.to_csv(output)
            media_type = "text/csv"
            filename = "extracted_tables.csv"

        elif format == 'xlsx':
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                for i, df in enumerate(all_dfs):
                    sheet_name = f"P{df._meta_page}_T{df._meta_idx}"
                    # Excel sheet names max 31 chars
                    df.to_excel(writer, sheet_name=sheet_name[:31], index=False)
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = "extracted_tables.xlsx"
        
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'csv' or 'xlsx'.")

        output.seek(0)
        return output, media_type, filename


@router.post("/extract-tables")
async def extract_tables_api(file: UploadFile = File(...), flavor: str = Form("lattice")):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    content = await file.read()
    results = TableExtractor.extract_preview(content, flavor)
    
    return JSONResponse(content={"tables": results, "count": len(results)})


@router.post("/download-tables")
async def download_tables_api(file: UploadFile = File(...), format: str = Form("csv"), flavor: str = Form("lattice")):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    content = await file.read()
    output_stream, media_type, filename = TableExtractor.extract_and_export(content, format, flavor)
    
    return StreamingResponse(
        output_stream, 
        media_type=media_type, 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
