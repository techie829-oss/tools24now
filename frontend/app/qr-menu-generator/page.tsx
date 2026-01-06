'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, QrCode as QrIcon, Upload, Eye, Coins } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    image?: string;
}

interface Category {
    id: string;
    name: string;
    items: MenuItem[];
}

const CURRENCIES: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$'
};

export default function QRMenuGenerator() {
    const [restaurantName, setRestaurantName] = useState('My Restaurant');
    const [currency, setCurrency] = useState('INR');
    const [categories, setCategories] = useState<Category[]>([
        {
            id: '1',
            name: 'Appetizers',
            items: [
                { id: '1', name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: '8.99' }
            ]
        }
    ]);
    const [menuUrl, setMenuUrl] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    const addCategory = () => {
        setCategories([...categories, {
            id: Date.now().toString(),
            name: 'New Category',
            items: []
        }]);
    };

    const removeCategory = (categoryId: string) => {
        setCategories(categories.filter(cat => cat.id !== categoryId));
    };

    const updateCategory = (categoryId: string, name: string) => {
        setCategories(categories.map(cat =>
            cat.id === categoryId ? { ...cat, name } : cat
        ));
    };

    const addItem = (categoryId: string) => {
        setCategories(categories.map(cat =>
            cat.id === categoryId
                ? {
                    ...cat,
                    items: [...cat.items, {
                        id: Date.now().toString(),
                        name: '',
                        description: '',
                        price: ''
                    }]
                }
                : cat
        ));
    };

    const removeItem = (categoryId: string, itemId: string) => {
        setCategories(categories.map(cat =>
            cat.id === categoryId
                ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
                : cat
        ));
    };

    const updateItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: string) => {
        setCategories(categories.map(cat =>
            cat.id === categoryId
                ? {
                    ...cat,
                    items: cat.items.map(item =>
                        item.id === itemId ? { ...item, [field]: value } : item
                    )
                }
                : cat
        ));
    };

    const generateHTML = () => {
        const symbol = CURRENCIES[currency];
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${restaurantName} - Menu</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; margin-bottom: 8px; }
        .category { padding: 24px; border-bottom: 1px solid #e5e7eb; }
        .category:last-child { border-bottom: none; }
        .category h2 { font-size: 24px; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #667eea; }
        .item { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f3f4f6; }
        .item:last-child { border-bottom: none; margin-bottom: 0; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .item-name { font-size: 18px; font-weight: 600; color: #111827; }
        .item-price { font-size: 18px; font-weight: 700; color: #667eea; }
        .item-description { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${restaurantName}</h1>
            <p>Our Menu</p>
        </div>
        ${categories.map(cat => `
        <div class="category">
            <h2>${cat.name}</h2>
            ${cat.items.map(item => `
            <div class="item">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${symbol}${item.price}</span>
                </div>
                <p class="item-description">${item.description}</p>
            </div>`).join('')}
        </div>`).join('')}
        <div class="footer">
            <p>Generated with Tools24Now</p>
        </div>
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${restaurantName.replace(/\s+/g, '_')}_Menu.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${restaurantName}_QR.png`;
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        QR Menu Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Create a digital menu for your restaurant with QR code access.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Restaurant Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                                    <input
                                        type="text"
                                        placeholder="Restaurant Name"
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <div className="relative">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                                        >
                                            {Object.entries(CURRENCIES).map(([code, symbol]) => (
                                                <option key={code} value={code}>
                                                    {code} ({symbol})
                                                </option>
                                            ))}
                                        </select>
                                        <Coins className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        {categories.map((category, catIdx) => (
                            <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <input
                                        type="text"
                                        value={category.name}
                                        onChange={(e) => updateCategory(category.id, e.target.value)}
                                        className="text-xl font-bold text-gray-900 border-b-2 border-transparent hover:border-purple-300 focus:border-purple-500 outline-none px-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addItem(category.id)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => removeCategory(category.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {category.items.map((item, itemIdx) => (
                                        <div key={item.id} className="p-4 border-2 border-gray-200 rounded-xl relative hover:border-purple-300 transition-colors">
                                            <button
                                                onClick={() => removeItem(category.id, item.id)}
                                                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="grid grid-cols-3 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Item Name"
                                                    value={item.name}
                                                    onChange={(e) => updateItem(category.id, item.id, 'name', e.target.value)}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                                                />
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500 font-semibold">{CURRENCIES[currency]}</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Price"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(category.id, item.id, 'price', e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-right font-semibold text-purple-600"
                                                    />
                                                </div>
                                            </div>

                                            <textarea
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateItem(category.id, item.id, 'description', e.target.value)}
                                                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addCategory}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all font-semibold"
                        >
                            + Add Category
                        </button>
                    </div>

                    {/* QR Code & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <QrIcon className="w-5 h-5 text-purple-600" />
                                QR Code
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Menu URL (optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://yoursite.com/menu"
                                    value={menuUrl}
                                    onChange={(e) => setMenuUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to generate offline HTML</p>
                            </div>

                            {menuUrl && (
                                <div ref={qrRef} className="flex justify-center p-6 bg-gray-50 rounded-xl mb-4">
                                    <QRCodeSVG value={menuUrl} size={200} level="H" />
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={generateHTML}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Menu (HTML)
                                </button>

                                {menuUrl && (
                                    <button
                                        onClick={downloadQR}
                                        className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors shadow-md"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download QR Code
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    <Eye className="w-5 h-5" />
                                    {showPreview ? 'Hide' : 'Show'} Preview
                                </button>
                            </div>
                        </div>

                        {showPreview && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h4 className="font-bold text-gray-900 mb-4">Preview</h4>
                                <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto text-sm">
                                    <h2 className="text-2xl font-bold text-center mb-4 text-purple-600">{restaurantName}</h2>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 mb-2 pb-1 border-b border-purple-200">{cat.name}</h3>
                                            {cat.items.map((item) => (
                                                <div key={item.id} className="mb-3">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-semibold text-gray-900">{item.name}</span>
                                                        <span className="text-purple-600 font-bold">{CURRENCIES[currency]}{item.price}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
