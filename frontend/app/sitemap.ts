import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools24now.com';
  const currentDate = new Date();

  // Core Pages
  const coreRoutes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Tool Categories & Routes
  // Verified against file system
  const tools = [
    // PDF Tools
    'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-images',
    'image-to-pdf', 'organize-pdf', 'ocr-pdf', 'deskew-pdf', 'file-metadata',

    // Image Tools
    'image-compressor', 'image-resizer', 'image-converter', 'image-cropper',
    'image-filters', 'image-rotate', 'image-watermark', 'color-tools',

    // Business & Finance
    'invoice-generator', 'gst-calculator', 'emi-calculator', 'profit-margin',
    'quote-generator', 'proforma-invoice', 'purchase-order', 'cash-receipt',
    'gst-breakdown-calculator', 'gst-return-summary', 'tds-calculator',
    'salary-calculator', 'freelance-rate-calculator', 'break-even-calculator',
    'roi-calculator', 'company-valuation', 'business-name-generator',
    'gst-split-calculator',

    // Developer & Web Tools
    'json-formatter', 'base64-converter', 'hash-generator', 'markdown-editor',
    'json-xml-converter',
    'qr-generator', 'barcode-generator', 'qr-menu-generator',
    'password-generator', 'uuid-generator', 'regex-tester',
    'my-ip', 'dns-lookup', 'subnet-calculator', 'ssl-checker', 'header-inspector',

    // Education
    'timetable-generator', 'student-id-generator', 'fee-receipt-generator',
    'exam-marks-calculator', 'grade-converter', 'attendance-calculator',
    'library-fine-calculator', 'hostel-allocation',

    // Text & Utility
    'word-counter', 'text-case-converter', 'age-calculator',
    'timestamp-converter', 'time-difference', 'unit-converter',
    'receipt-scanner', 'table-extractor'
  ];

  const toolRoutes = tools.map((tool) => ({
    url: `${baseUrl}/${tool}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority for tools
  }));

  return [...coreRoutes, ...toolRoutes];
}
