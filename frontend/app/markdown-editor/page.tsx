'use client';

import React, { useState } from 'react';
import { Copy, Download, Eye, Code, FileText, Check, Bold, Italic, Link as LinkIcon, List, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState(`# Welcome to Markdown Editor

## Features
- **Live Preview** with GitHub Flavored Markdown
- Syntax highlighting
- Export to HTML
- Quick formatting toolbar

### Example Code
\`\`\`javascript
const greeting = "Hello, Markdown!";
console.log(greeting);
\`\`\`

### Example Table
| Feature | Status |
|---------|--------|
| Bold | ✓ |
| Italic | ✓ |
| Links | ✓ |

> **Tip:** Try editing the content on the left!
`);
    const [copied, setCopied] = useState(false);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdown.substring(start, end);
        const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);

        setMarkdown(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadMarkdown = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `document-${Date.now()}.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadHTML = () => {
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f4f4f4; font-weight: 600; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
${document.querySelector('.markdown-preview')?.innerHTML || ''}
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `document-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/markdown-to-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: markdown }),
            });

            if (!response.ok) {
                throw new Error('PDF generation failed');
            }

            // Get the PDF blob
            const blob = await response.blob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `document-${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF download failed:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
                        Markdown Editor
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Write and preview markdown with live rendering.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-t-2xl shadow-md p-4 border border-gray-200 border-b-0">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bold">
                                <Bold className="w-5 h-5 text-gray-700" />
                            </button>
                            <button onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Italic">
                                <Italic className="w-5 h-5 text-gray-700" />
                            </button>
                            <button onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Link">
                                <LinkIcon className="w-5 h-5 text-gray-700" />
                            </button>
                            <button onClick={() => insertMarkdown('`', '`')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Code">
                                <Code className="w-5 h-5 text-gray-700" />
                            </button>
                            <button onClick={() => insertMarkdown('- ')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="List">
                                <List className="w-5 h-5 text-gray-700" />
                            </button>
                            <button onClick={() => insertMarkdown('![alt](', ')')} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Image">
                                <ImageIcon className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button onClick={handleDownloadMarkdown} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <Download className="w-4 h-4" />
                                .md
                            </button>
                            <button onClick={handleDownloadHTML} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <Download className="w-4 h-4" />
                                .html
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <Download className="w-4 h-4" />
                                .pdf
                            </button>
                        </div>
                    </div>
                </div>

                {/* Split Pane */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-b-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Editor */}
                    <div className="border-r border-gray-200">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Editor</span>
                        </div>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            className="w-full h-[600px] p-6 font-mono text-sm border-none resize-none focus:ring-0 focus:outline-none"
                            placeholder="Start writing markdown..."
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Preview</span>
                        </div>
                        <style jsx global>{`
                            .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 { margin-top: 2em !important; margin-bottom: 1em !important; font-weight: 700; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5em; }
                            .markdown-preview h1 { font-size: 2.25em; border-bottom: 2px solid #e5e7eb; }
                            .markdown-preview h2 { font-size: 1.8em; }
                            .markdown-preview h3 { font-size: 1.4em; border-bottom: none; text-decoration: underline; text-decoration-color: #d1d5db; }
                            .markdown-preview p { margin-bottom: 1.25em !important; line-height: 1.75; text-align: left; }
                            .markdown-preview ul, .markdown-preview ol { margin-bottom: 1.25em; padding-left: 1.5em; }
                            .markdown-preview ul { list-style-type: disc; }
                            .markdown-preview ol { list-style-type: decimal; }
                            .markdown-preview li { margin-bottom: 0.5em; text-align: left; }
                            .markdown-preview code { color: #be185d; background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-size: 0.875em; font-family: monospace; }
                            .markdown-preview pre { margin-top: 1em; margin-bottom: 1em; background-color: #1f2937; color: f9fafb; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
                            .markdown-preview pre code { color: inherit; background-color: transparent; padding: 0; }
                            .markdown-preview blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; color: #4b5563; font-style: italic; margin-bottom: 1.25em; background: #f9fafb; padding: 1em; }
                            .markdown-preview strong { font-weight: 700; color: #111827; margin-right: 0.25em; }

                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                .markdown-preview, .markdown-preview * {
                                    visibility: visible;
                                }
                                .markdown-preview {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                    height: auto !important;
                                    overflow: visible !important;
                                    padding: 20px !important;
                                    margin: 0 !important;
                                }
                                /* Hide toolbars and other UI explicitly if needed */
                                nav, button, .toolbar, header {
                                    display: none !important;
                                }
                            }
                        `}</style>
                        <div className="markdown-preview h-[600px] overflow-y-auto p-6 text-gray-900 print:text-black">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const { ref, ...rest } = props as any;
                                        return match ? (
                                            <SyntaxHighlighter
                                                {...rest}
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code {...props} className={className}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
