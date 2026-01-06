# Tools24Now

**Modern, AI-Powered File Tools Platform**

A comprehensive suite of professional PDF, Image, Business, and Utility tools built with Next.js and FastAPI.

## ✨ Features

### 📄 PDF Tools
- **OCR PDF** - AI-enhanced text extraction with layout preservation
- **PDF to Word** - Convert PDFs to editable Word documents
- **PDF to Images** - Export PDF pages as images
- **Merge PDF** - Combine multiple PDFs into one
- **Compress PDF** - Reduce PDF file sizes
- **Split PDF** - Extract pages from PDFs
- **Organize PDF** - Reorder and manage PDF pages
- **Deskew PDF** - Straighten scanned documents

### 🖼️ Image Tools
- **Image Converter** - Convert between formats (PNG, JPG, WEBP)
- **Image Resizer** - Resize images with aspect ratio control
- **Image Cropper** - Crop images interactively
- **Image Filters** - Apply effects (Grayscale, Sepia, Blur, etc.)
- **Image Rotate** - Rotate images by any angle
- **Image Watermark** - Add text or logo watermarks
- **Image Compressor** - Optimize image sizes

### 💼 Business Tools
- **Invoice Generator** - Create professional invoices with GST support
- **GST Calculator** - Calculate inclusive/exclusive GST
- **EMI Calculator** - Loan EMI calculations
- **Profit Margin Calculator** - Business analytics

### 🛠️ Utility Tools
- **QR Code Generator** - Customizable QR codes
- **Password Generator** - Secure password creation
- **Text Case Converter** - Transform text cases (Camel, Snake, Title, etc.)
- **Word Counter** - Real-time text statistics
- **UUID Generator** - Bulk UUID v4 generation

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Icon library

### Backend
- **FastAPI** - High-performance Python API
- **SQLAlchemy** - Database ORM
- **PyMuPDF (fitz)** - PDF processing
- **PaddlePaddle + LayoutParser** - AI-powered OCR
- **Tesseract** - Text recognition
- **Pillow** - Image manipulation

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Tesseract OCR

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 🏗️ Project Structure
```
pdf_tools_platform/
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   ├── components/   # Reusable components
│   └── lib/          # Utilities and API client
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── controllers/  # API endpoints
│   │   ├── models/       # Database models
│   │   └── tools/        # Processing utilities
│   └── storage/      # File storage (gitignored)
└── .gitignore
```

## 🌟 Key Highlights

- **100% Client-Side Utilities** - Privacy-focused tools (QR, Password, UUID, etc.)
- **AI-Powered OCR** - Enhanced mode with PaddlePaddle layout detection
- **Responsive Design** - Mobile-first, modern UI
- **Job-Based Processing** - Async file processing with progress tracking
- **Modular Architecture** - Easy to extend with new tools

## 🔒 Privacy & Security

- No data sent to external servers
- Client-side processing for sensitive operations
- Temporary file cleanup after processing
- Secure password generation using Web Crypto API

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ for the Tools24Now community
