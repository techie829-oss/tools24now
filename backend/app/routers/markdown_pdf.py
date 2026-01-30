from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.lib.colors import HexColor
import markdown
from io import BytesIO
import re

router = APIRouter()

class MarkdownRequest(BaseModel):
    content: str

@router.post("/markdown-to-pdf")
async def convert_markdown_to_pdf(request: MarkdownRequest):
    """
    Convert markdown content to a clean PDF with proper text rendering
    """
    try:
        # Convert markdown to HTML
        html_content = markdown.markdown(
            request.content,
            extensions=['extra', 'codehilite', 'tables', 'fenced_code']
        )
        
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=60,
            bottomMargin=40
        )
        
        # Define custom styles
        styles = getSampleStyleSheet()
        
        # Heading styles with borders
        h1_style = ParagraphStyle(
            'CustomH1',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=HexColor('#111827'),
            spaceAfter=20,
            spaceBefore=30,
            borderWidth=0,
            borderPadding=10,
            borderColor=HexColor('#e5e7eb'),
            underlineWidth=2,
            underlineColor=HexColor('#e5e7eb'),
            leading=28
        )
        
        h2_style = ParagraphStyle(
            'CustomH2',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=HexColor('#111827'),
            spaceAfter=15,
            spaceBefore=25,
            borderPadding=8,
            underlineWidth=1,
            underlineColor=HexColor('#e5e7eb'),
            leading=22
        )
        
        h3_style = ParagraphStyle(
            'CustomH3',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=HexColor('#111827'),
            spaceAfter=10,
            spaceBefore=20,
            underline=True
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['BodyText'],
            fontSize=11,
            leading=19,
            alignment=TA_LEFT,
            textColor=HexColor('#374151'),
            spaceAfter=15
        )
        
        # Parse HTML and build story
        story = []
        
        # Simple HTML to ReportLab conversion
        # Strip HTML tags and create paragraphs
        clean_text = re.sub(r'<[^>]+>', '\n', html_content)
        paragraphs = clean_text.split('\n\n')
        
        for para in paragraphs:
            para = para.strip()
            if para:
                if para.startswith('# '):
                    story.append(Paragraph(para[2:], h1_style))
                elif para.startswith('## '):
                    story.append(Paragraph(para[3:], h2_style))
                elif para.startswith('### '):
                    story.append(Paragraph(para[4:], h3_style))
                else:
                    story.append(Paragraph(para, body_style))
                story.append(Spacer(1, 0.1*inch))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()
        
        # Return PDF as download
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=document-{int(__import__('time').time())}.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
