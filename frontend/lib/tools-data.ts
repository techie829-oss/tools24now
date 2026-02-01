import {
    Images, Link2, Minimize2, FolderSync, ScanEye, Ruler, Scissors, FileType,
    RefreshCw, Maximize2, Crop, Wand2, RotateCw, Stamp,
    FileText, Calculator, PieChart, TrendingUp, FileUser, UtensilsCrossed, Barcode, Table as TableIcon,
    QrCode, Lock, Type, Fingerprint, Binary, Code, Hash, FileCode, Palette, ArrowRightLeft,
    Clock, Timer, Cake, Network, Search, Server, Receipt, SearchCode, Shield, CheckCircle, Zap, Lock as LockIcon,
    Calendar, Award, Users, Home as HomeIcon, BookOpen, GraduationCap,
    ScrollText, Briefcase, Landmark, Coins, Target, Percent, BarChart3, Building2, X
} from 'lucide-react';

export interface Tool {
    title: string;
    description: string;
    href: string;
    icon: any;
    available: boolean;
}

export const pdfTools: Tool[] = [
    { title: 'PDF to Images', description: 'Instantly convert PDF pages into high-quality JPG or PNG images. Perfect for sharing on social media or using in presentations.', href: '/pdf-to-images', icon: Images, available: true },
    { title: 'Image to PDF', description: 'Turn your photos and images into a single, professional PDF document in seconds. Great for portfolios and receipts.', href: '/image-to-pdf', icon: Images, available: true },
    { title: 'Merge PDF', description: 'Combine multiple PDF files into one organized document. Drag and drop to rearrange pages exactly how you want them.', href: '/merge-pdf', icon: Link2, available: true },
    { title: 'Compress PDF', description: 'Shrink your PDF file size without losing quality. Make your documents email-friendly and faster to upload.', href: '/compress-pdf', icon: Minimize2, available: true },
    { title: 'Organize PDF', description: 'Rearrange, rotate, or delete pages from your PDF. Get your document structure perfect in just a few clicks.', href: '/organize-pdf', icon: FolderSync, available: true },
    { title: 'OCR PDF', description: 'Extract text from scanned PDFs and images. Make your documents searchable and editable with our advanced OCR.', href: '/ocr-pdf', icon: ScanEye, available: true },
    { title: 'Deskew PDF', description: 'Fix crooked scanned documents automatically. Straighten your pages for a professional, polished look.', href: '/deskew-pdf', icon: Ruler, available: true },
    { title: 'Split PDF', description: 'Separate one big PDF into smaller files, or extract just the specific pages you need.', href: '/split-pdf', icon: Scissors, available: true },
    { title: 'PDF to Word', description: 'Convert PDFs into editable Word documents. Keep your formatting intact and stop retyping everything.', href: '/pdf-to-word', icon: FileType, available: true },
    { title: 'Table Extractor', description: 'Pull data tables straight out of PDFs and into Excel or CSV. No more manual data entry errors.', href: '/table-extractor', icon: TableIcon, available: true },
];

export const imageTools: Tool[] = [
    { title: 'Image Converter', description: 'Switch between image formats like JPG, PNG, and WebP effortlessly. Keep compatibility high and file sizes low.', href: '/image-converter', icon: RefreshCw, available: true },
    { title: 'Image Compressor', description: 'Reduce image file sizes dramatically without visible quality loss. Speed up your website and save storage space.', href: '/image-compressor', icon: Minimize2, available: true },
    { title: 'Image Resizer', description: 'Resize images to the exact dimensions you need. Perfect for social media posts, banners, and profile pictures.', href: '/image-resizer', icon: Maximize2, available: true },
    { title: 'Image Cropper', description: 'Trim the edges or focus on the best part of your photo. straightforward cropping with custom aspect ratios.', href: '/image-cropper', icon: Crop, available: true },
    { title: 'Image Filters', description: 'Enhance your photos with beautiful preset filters. Give your images a professional touch in one click.', href: '/image-filters', icon: Wand2, available: true },
    { title: 'Image Rotate & Flip', description: 'Fix upside-down or sideways photos instantly. Rotate and flip images to get the right orientation.', href: '/image-rotate', icon: RotateCw, available: true },
    { title: 'Image Watermark', description: 'Protect your creative work. Add your logo or custom text watermark to images before sharing them online.', href: '/image-watermark', icon: Stamp, available: true },
];

export const businessTools: Tool[] = [
    { title: 'Invoice Generator', description: 'Create clean, professional invoices in minutes. Add your logo, calculate taxes, and download as PDF.', href: '/invoice-generator', icon: FileText, available: true },
    { title: 'Quote / Estimate', description: 'Send impressive quotes to clients quickly. Win more business with professional-looking estimates.', href: '/quote-generator', icon: ScrollText, available: true },
    { title: 'Proforma Invoice', description: 'Generate preliminary invoices for shipments and customs. conform to international trade standards.', href: '/proforma-invoice', icon: FileText, available: true },
    { title: 'Purchase Order', description: 'Create official purchase orders for your suppliers. Track your spending and streamline your procurement.', href: '/purchase-order', icon: Briefcase, available: true },
    { title: 'Cash Receipt', description: 'Issue instant receipts for cash payments. Keep your financial records accurate and professional.', href: '/cash-receipt', icon: Receipt, available: true },
    { title: 'Quick Resume Builder', description: 'Build a standout resume that gets you hired. Choose a template, fill in your details, and download.', href: '/resume-builder', icon: FileUser, available: true },
    { title: 'Business Name Gen', description: 'Stuck on a name? unique, catchy business name ideas to jumpstart your new venture.', href: '/business-name-generator', icon: Building2, available: true },
    { title: 'QR Menu Generator', description: 'Contactless menus for your restaurant or cafe. Create a QR code that customers can scan to view your menu.', href: '/qr-menu-generator', icon: UtensilsCrossed, available: true },
    { title: 'Barcode Generator', description: 'Create custom barcodes for your inventory and products. Supports UPC, EAN, Code128, and more.', href: '/barcode-generator', icon: Barcode, available: true },
    { title: 'Receipt Scanner', description: 'Digitize your paper receipts. Extract date, amount, and merchant info automatically for expense tracking.', href: '/receipt-scanner', icon: Receipt, available: true },
];

export const financeTools: Tool[] = [
    { title: 'GST Calculator', description: 'Calculate GST amounts accurately. Add or remove tax from your prices with this simple Indian GST calculator.', href: '/gst-calculator', icon: Calculator, available: true },
    { title: 'GST Returns', description: 'Get a quick summary for your GSTR-1 and GSTR-3B filings. Simplify your monthly tax compliance.', href: '/gst-return-summary', icon: FileText, available: true },
    { title: 'GST Split Calc', description: 'Figure out the base price and tax amount from a total inclusive figure. Essential for billing.', href: '/gst-split-calculator', icon: Percent, available: true },
    { title: 'TDS Calculator', description: 'Compute Tax Deducted at Source (TDS) correctly for salaries, rent, and professional fees.', href: '/tds-calculator', icon: Landmark, available: true },
    { title: 'Salary Calculator', description: 'Know your actual take-home pay. Estimate your in-hand salary from your CTC breakdown.', href: '/salary-calculator', icon: Coins, available: true },
    { title: 'Freelance Rate', description: 'Not sure what to charge? Calculate your ideal hourly rate based on your income goals and expenses.', href: '/freelance-rate-calculator', icon: Clock, available: true },
    { title: 'Break-Even Calc', description: 'Find out exactly how much you need to sell to cover your costs and start making a profit.', href: '/break-even-calculator', icon: Target, available: true },
    { title: 'Profit Margin', description: 'Calculate your gross and net profit margins. Set the right prices to ensure your business grows.', href: '/profit-margin', icon: TrendingUp, available: true },
    { title: 'ROI Calculator', description: 'Evaluate your investment returns. See if a project or marketing campaign is worth your money.', href: '/roi-calculator', icon: TrendingUp, available: true },
    { title: 'Valuation Calc', description: 'Get a rough estimate of what your startup or small business might be worth today.', href: '/company-valuation', icon: BarChart3, available: true },
    { title: 'EMI Calculator', description: 'Plan your loans better. Calculate your monthly EMI and total interest for home, car, or personal loans.', href: '/emi-calculator', icon: PieChart, available: true },
];

export const utilityTools: Tool[] = [
    { title: 'QR Code Generator', description: 'Create custom QR codes for websites, WiFi access, text, and more. Download in high resolution.', href: '/qr-generator', icon: QrCode, available: true },
    { title: 'File Metadata', description: 'Peek inside your files. View and edit hidden metadata for PDFs and images (EXIF data).', href: '/file-metadata', icon: FileText, available: true },
    { title: 'Password Generator', description: 'Create unbreakable passwords instantly. Customize length and complexity to stay secure online.', href: '/password-generator', icon: Lock, available: true },
    { title: 'Text Case Converter', description: 'Fix capitalization issues in a click. Convert text to lowercase, UPPERCASE, Title Case, and more.', href: '/text-case-converter', icon: Type, available: true },
    { title: 'Word Counter', description: 'Count words, characters, and reading time. perfect for writers, students, and SEO optimization.', href: '/word-counter', icon: FileText, available: true },
    { title: 'UUID Generator', description: 'Generate unique identifiers (UUID v1 & v4) for your development projects and databases.', href: '/uuid-generator', icon: Fingerprint, available: true },
];

export const developerTools: Tool[] = [
    { title: 'Base64 Converter', description: 'Encode and decode data to Base64 format. Simple, fast, and handled entirely in your browser.', href: '/base64-converter', icon: Binary, available: true },
    { title: 'JSON <-> XML', description: 'Convert data between JSON and XML formats seamlessly. Great for API integration tasks.', href: '/json-xml-converter', icon: ArrowRightLeft, available: true },
    { title: 'JSON Formatter', description: 'Beautify your messy JSON code. Validate syntax and make it readable with proper indentation.', href: '/json-formatter', icon: Code, available: true },
    { title: 'Hash Generator', description: 'Generate secure hash values (MD5, SHA-256) for your text strings. Check data integrity.', href: '/hash-generator', icon: Hash, available: true },
    { title: 'Markdown Editor', description: 'Write Markdown with a live preview. The perfect distraction-free environment for docs and notes.', href: '/markdown-editor', icon: FileCode, available: true },
    { title: 'SSL Checker', description: 'Diagnose SSL certificate issues. Check expiration dates and verify the security chain of any domain.', href: '/ssl-checker', icon: Shield, available: true },
    { title: 'Header Inspector', description: 'View the HTTP headers returned by any website. Debug caching, cookies, and server info.', href: '/header-inspector', icon: Server, available: true },
    { title: 'Regex Tester', description: 'Test and debug your Regular Expressions. Ensure your patterns match exactly what you intend.', href: '/regex-tester', icon: SearchCode, available: true },
];

export const designTools: Tool[] = [
    { title: 'Color Tools', description: 'All the color help you need. Pick colors, convert between HEX/RGB/HSL, and generate palettes.', href: '/color-tools', icon: Palette, available: true },
    { title: 'Unit Converter', description: 'Convert length, weight, volume, and more. A handy universal converter for detailed work.', href: '/unit-converter', icon: ArrowRightLeft, available: true },
];

export const networkTools: Tool[] = [
    { title: 'My IP Address', description: 'Instantly check your public IPv4 and IPv6 address, along with location and ISP details.', href: '/my-ip', icon: Network, available: true },
    { title: 'DNS Lookup', description: 'Query DNS records (A, MX, NS, TXT) for any domain. Troubleshoot website connectivity issues.', href: '/dns-lookup', icon: Search, available: true },
    { title: 'Subnet Calculator', description: 'Calculate IP ranges, masks, and subnets easily. Essential for network planning and setup.', href: '/subnet-calculator', icon: Calculator, available: true },
];

export const educationTools: Tool[] = [
    { title: 'Timetable Generator', description: 'Create clear weekly schedules for schools or personal study. Print and stay organized.', href: '/timetable-generator', icon: Calendar, available: true },
    { title: 'Student ID Generator', description: 'Design and print professional student ID cards in bulk. fast and easy for admin staff.', href: '/student-id-generator', icon: FileUser, available: true },
    { title: 'Fee Receipt Generator', description: 'Generate automated fee receipts for tuition and school payments. Keep accounts transparent.', href: '/fee-receipt-generator', icon: Receipt, available: true },
    { title: 'Exam Marks Calculator', description: 'Sum up marks and calculate percentages quickly. Avoid math errors during grading season.', href: '/exam-marks-calculator', icon: Calculator, available: true },
    { title: 'Grade Converter', description: 'Convert marks or percentages into letter grades or GPA scores based on standard scales.', href: '/grade-converter', icon: Award, available: true },
    { title: 'Attendance Calculator', description: 'Track attendance requirements. See exactly how many classes you can skip or need to attend.', href: '/attendance-calculator', icon: Users, available: true },
    { title: 'Hostel Allocation', description: 'Manage hostel room assignments efficiently. Organize students into rooms without conflict.', href: '/hostel-allocation', icon: HomeIcon, available: true },
    { title: 'Library Fine', description: 'Calculate overdue fines accurately based on days late and daily rates. Fair and fast.', href: '/library-fine-calculator', icon: BookOpen, available: true },
];

export const dateTools: Tool[] = [
    { title: 'Timestamp Converter', description: 'Convert Unix timestamps to human-readable dates and vice-versa. A lifesaver for debugging.', href: '/timestamp-converter', icon: Clock, available: true },
    { title: 'Time Difference', description: 'Calculate the exact duration between two dates or times. Breakdown by years, months, and days.', href: '/time-difference', icon: Timer, available: true },
    { title: 'Age Calculator', description: 'Find out your exact age in years, months, and days. Also calculate days until your next birthday.', href: '/age-calculator', icon: Cake, available: true },
];

// Combined list for search
export const allTools: Tool[] = [
    ...pdfTools, ...imageTools, ...businessTools, ...financeTools,
    ...utilityTools, ...developerTools, ...designTools, ...networkTools,
    ...educationTools, ...dateTools
];
