'use client';

import React, { useState } from 'react';
import { Copy, Download, Eye, Code, FileText, Check, Bold, Italic, Link as LinkIcon, List, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                        <div className="markdown-preview h-[600px] overflow-y-auto p-6 prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
