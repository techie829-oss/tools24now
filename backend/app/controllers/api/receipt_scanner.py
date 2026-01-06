from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import pytesseract
import io
import re
from datetime import datetime
import dateparser

router = APIRouter()

class ReceiptScanner:
    @staticmethod
    def _clean_text(text: str) -> str:
        return text.strip()

    @staticmethod
    def _extract_vendor(lines: list[str]) -> str:
        """
        Heuristic: Vendor is usually the first non-empty line that isn't a known generic keyword.
        """
        generic_keywords = ["receipt", "invoice", "bill", "tax", "tel:", "fax:", "date", "total", "welcome"]
        for line in lines[:5]:  # Check top 5 lines
            cleaned = line.strip().lower()
            if not cleaned or len(cleaned) < 2:
                continue
            if any(keyword in cleaned for keyword in generic_keywords):
                continue
            # Assume this is the vendor
            return line.strip().title()
        return "Unknown Vendor"

    @staticmethod
    def _extract_date(text: str) -> str:
        """
        Uses regex and dateparser to find the date.
        """
        # Common date patterns: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-Mon-YYYY
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', # 12/05/2023
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',   # 2023-05-12
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}' # 12 May 2023
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Try to parse
                try:
                    dt = dateparser.parse(match)
                    if dt:
                        return dt.strftime('%Y-%m-%d')
                except:
                    continue
        return None

    @staticmethod
    def _extract_amounts(text: str) -> dict:
        """
        Extracts Total and Tax amounts.
        Heuristic: 'Total' usually followed by the largest number at the bottom.
        """
        lines = text.split('\n')
        total_amount = None
        tax_amount = 0.0
        
        # Regex for currency: $10.00, 10.00, 10,00 USD, etc.
        amount_pattern = r'[\$£€₹]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        
        # Look for Total
        # Reverse search lines for "Total", "Amount Due", etc.
        total_keywords = ["total", "amount due", "grand total", "balance", "sum"]
        
        found_total = False
        
        # Strategy 1: Look for line with "Total" and a number
        for line in reversed(lines):
            lower_line = line.lower()
            if any(k in lower_line for k in total_keywords):
                # Try to find number in this line
                matches = re.findall(amount_pattern, line)
                if matches:
                    try:
                        # Take the last number in the line (usually the value)
                        val_str = matches[-1].replace(',', '')
                        val = float(val_str)
                        if val > 0:
                            total_amount = val
                            found_total = True
                            break
                    except:
                        pass
        
        # Strategy 2: If found "Total" keyword but no number, check NEXT line
        if not found_total:
             for i in range(len(lines) - 1, 0, -1):
                lower_line = lines[i].lower()
                if any(k in lower_line for k in total_keywords):
                    # Check next line (i+1) if it exists, sometimes formatting puts it there
                    if i + 1 < len(lines):
                        matches = re.findall(amount_pattern, lines[i+1])
                        if matches:
                             try:
                                val_str = matches[0].replace(',', '') # First num in next line
                                val = float(val_str)
                                total_amount = val
                                break
                             except:
                                 pass

        # Look for Tax
        tax_keywords = ["tax", "vat", "gst", "hst"]
        for line in lines:
            lower_line = line.lower()
            # Avoid lines that say "Tax Invoice" if they don't have amounts, but simple check first
            if any(k in lower_line for k in tax_keywords) and "invoice" not in lower_line:
                 matches = re.findall(amount_pattern, line)
                 if matches:
                    try:
                        val_str = matches[-1].replace(',', '')
                        val = float(val_str)
                        # Heuristic: Tax is usually smaller than total, but we might not have total yet.
                        # Accumulate taxes? Or just take the largest "Tax" line? 
                        # Usually multiple taxes (SGST, CGST). Let's just find the first or last?
                        # Let's sum them if multiple? Risks parsing "Tax %" as amount.
                        # For MVP, let's take the first non-zero tax amount found or try to sum known tax lines.
                        # Safer: Just one tax field for now.
                        if val > 0 and (total_amount is None or val < total_amount):
                            tax_amount = val # Simple overwrite
                    except:
                        pass

        return {"total": total_amount, "tax": tax_amount}

    @staticmethod
    def _extract_line_items(lines: list[str]) -> list[dict]:
        """
        Experimental: Extract line items based on 'Text... Price' pattern.
        """
        items = []
        # Regex for price at end of line: "Burger 10.00" or "Burger ... 10.00"
        # Matches: Any text (lazy), then whitespace, then price
        item_pattern = r'^(.+?)\s+((?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2}))$'
        
        skip_keywords = ["total", "tax", "vat", "gst", "subtotal", "amount", "due", "change", "cash", "card", "visa", "mastercard", "date", "time", "receipt", "invoice", "thank"]
        
        for line in lines:
            cleaned = line.strip()
            lower_line = cleaned.lower()
            
            # Skip empty or short lines
            if len(cleaned) < 3:
                continue
                
            # Skip lines with keywords usually found in footer/header
            if any(k in lower_line for k in skip_keywords):
                continue
            
            match = re.search(item_pattern, cleaned)
            if match:
                description = match.group(1).strip()
                price_str = match.group(2).replace(',', '')
                
                # Further filter: Description shouldn't be too short or just symbols
                if len(description) < 2:
                    continue
                    
                # Description shouldn't contain a date
                if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', description):
                    continue

                try:
                    price = float(price_str)
                    items.append({
                        "description": description,
                        "amount": price,
                        "qty": 1 # Default to 1 as qty is hard to reliability extract without columns
                    })
                except:
                    continue
        return items

    @staticmethod
    def process_receipt(image_bytes: bytes) -> dict:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # OCR
            # Use --psm 6 or 4. 
            text = pytesseract.image_to_string(image, lang='eng', config='--psm 4')
            
            lines = [line for line in text.split('\n') if line.strip()]
            
            vendor = ReceiptScanner._extract_vendor(lines)
            date = ReceiptScanner._extract_date(text)
            amounts = ReceiptScanner._extract_amounts(text)
            line_items = ReceiptScanner._extract_line_items(lines)
            
            return {
                "vendor": vendor,
                "date": date,
                "total": amounts["total"],
                "tax": amounts["tax"],
                "items": line_items,
                "raw_text": text
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Receipt scanning failed: {str(e)}")

@router.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/') and not file.filename.lower().endswith('.pdf'):
         raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Image or PDF.")
    
    content = await file.read()
    
    # If PDF, convert first page to image (simple handling for now)
    if file.filename.lower().endswith('.pdf'):
        try:
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            page = doc[0]
            pix = page.get_pixmap()
            content = pix.tobytes("png")
        except ImportError:
             raise HTTPException(status_code=500, detail="PDF support requires PyMuPDF (fitz).")

    result = ReceiptScanner.process_receipt(content)
    return JSONResponse(content=result)
