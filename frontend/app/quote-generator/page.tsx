'use client';

import { useState } from 'react';
import {
    Download,
    Plus,
    Trash2,
    Settings,
    FileText,
    Calculator,
    Calendar
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToWords } from 'to-words';

// Types
interface LineItem {
    id: string;
    description: string;
    hsn?: string;
    sku?: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface QuoteData {
    quoteNumber: string;
    date: string;
    validUntil: string;
    from: string;
    to: string;
    currency: string;

    taxType: 'simple' | 'gst_intra' | 'gst_inter';
    taxRate: number;
    taxInclusive: boolean;
    discount: number;
    notes: string;

    // Bank Details (Optional for Quotes, but sometimes useful for advance payment info)
    showBankDetails: boolean;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    accountHolder: string;

    // Display Options
    showHSN: boolean;
    showSKU: boolean;
    showDiscount: boolean;
    type: 'Quote' | 'Estimate'; // Allow user to choose Label
}

export default function QuoteGenerator() {
    // State
    const [items, setItems] = useState<LineItem[]>([
        { id: '1', description: 'Web Application Development (Phase 1)', hsn: '998314', sku: 'DEV-001', quantity: 1, rate: 45000, amount: 45000 },
        { id: '2', description: 'Server Setup & Deployment', hsn: '998315', sku: 'OPS-001', quantity: 5, rate: 2000, amount: 10000 },
    ]);

    const [data, setData] = useState<QuoteData>({
        quoteNumber: 'Q-2024-001',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        from: 'TechSolutions India Pvt Ltd.\nUnit 402, Cyber Park\nGurugram, Haryana 122002',
        to: 'Prospective Client\nBusiness District\nNew Delhi 110001',
        currency: '₹',
        taxType: 'gst_intra',
        taxRate: 18,
        taxInclusive: false,
        discount: 0,
        notes: 'This quote is valid for 30 days.\n50% advance payment required to commence work.',

        showBankDetails: false,
        bankName: '',
        accountNumber: '',
        ifsc: '',
        accountHolder: '',

        showHSN: false,
        showSKU: false,
        showDiscount: true,
        type: 'Quote'
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Helpers
    const toWords = new ToWords({
        localeCode: data.currency === '₹' ? 'en-IN' : 'en-US',
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
            doNotAddOnly: false,
            currencyOptions: {
                name: data.currency === '₹' ? 'Rupee' : 'Dollar',
                plural: data.currency === '₹' ? 'Rupees' : 'Dollars',
                symbol: data.currency,
                fractionalUnit: {
                    name: data.currency === '₹' ? 'Paise' : 'Cent',
                    plural: data.currency === '₹' ? 'Paise' : 'Cents',
                    symbol: '',
                },
            }
        }
    });

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = Number(data.discount) || 0;

    // Tax Logic
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalTaxAmount = 0;
    let total = 0;
    let taxableValue = 0;

    if (data.taxInclusive) {
        const taxFactor = data.taxRate / 100;
        const totalAmount = subtotal - discountAmount;
        const validTotal = totalAmount > 0 ? totalAmount : 0;
        total = validTotal;
        const preTaxAmount = validTotal / (1 + taxFactor);
        totalTaxAmount = validTotal - preTaxAmount;
        taxableValue = preTaxAmount;

        if (data.taxType === 'gst_intra') {
            cgstAmount = totalTaxAmount / 2;
            sgstAmount = totalTaxAmount / 2;
        } else if (data.taxType === 'gst_inter') {
            igstAmount = totalTaxAmount;
        }
    } else {
        const taxable = subtotal - discountAmount;
        taxableValue = taxable > 0 ? taxable : 0;

        if (data.taxType === 'gst_intra') {
            const halfRate = data.taxRate / 2;
            cgstAmount = (taxableValue * halfRate) / 100;
            sgstAmount = (taxableValue * halfRate) / 100;
            totalTaxAmount = cgstAmount + sgstAmount;
        } else if (data.taxType === 'gst_inter') {
            igstAmount = (taxableValue * data.taxRate) / 100;
            totalTaxAmount = igstAmount;
        } else {
            totalTaxAmount = (taxableValue * data.taxRate) / 100;
        }
        total = taxableValue + totalTaxAmount;
    }

    const amountInWords = total > 0 ? toWords.convert(total) : '';

    // Handlers
    const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updates: Partial<LineItem> = { [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    const qty = field === 'quantity' ? Number(value) : item.quantity;
                    const rate = field === 'rate' ? Number(value) : item.rate;
                    updates.amount = qty * rate;
                }
                return { ...item, ...updates };
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                id: Math.random().toString(36).substr(2, 9),
                description: '',
                hsn: '',
                sku: '',
                quantity: 1,
                rate: 0,
                amount: 0
            }
        ]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const downloadPDF = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById('quote-preview');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${data.type}-${data.quoteNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            Quote & Estimate Generator
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Create professional quotes in seconds</p>
                    </div>
                    <button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                    >
                        {isGenerating ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* LEFT COLUMN: EDITOR */}
                    <div className="w-full xl:w-1/2 space-y-5">

                        {/* CONFIGURATION PANEL */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-100">
                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" checked={data.type === 'Quote'} onChange={() => setData({ ...data, type: 'Quote' })} className="text-indigo-600 focus:ring-indigo-500" />
                                    <span>Quote</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" checked={data.type === 'Estimate'} onChange={() => setData({ ...data, type: 'Estimate' })} className="text-indigo-600 focus:ring-indigo-500" />
                                    <span>Estimate</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
                                    <select
                                        value={data.currency}
                                        onChange={(e) => setData({ ...data, currency: e.target.value })}
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 text-gray-900"
                                    >
                                        <option value="₹">INR (₹)</option>
                                        <option value="$">USD ($)</option>
                                        <option value="€">EUR (€)</option>
                                        <option value="£">GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax System</label>
                                    <select
                                        value={data.taxType}
                                        onChange={(e) => setData({ ...data, taxType: e.target.value as any })}
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 text-gray-900"
                                    >
                                        <option value="gst_intra">GST (Intra: CGST + SGST)</option>
                                        <option value="gst_inter">GST (Inter: IGST)</option>
                                        <option value="simple">Simple Tax</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate %</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={data.taxRate} onChange={e => setData({ ...data, taxRate: Number(e.target.value) })} className="w-full rounded border-gray-300 shadow-sm text-sm py-1.5 text-gray-900" />
                                    </div>
                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                        <input type="checkbox" checked={data.taxInclusive} onChange={e => setData({ ...data, taxInclusive: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-xs text-gray-600">Tax Inclusive</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Discount</label>
                                    <input
                                        type="number"
                                        value={data.discount}
                                        onChange={e => setData({ ...data, discount: Number(e.target.value) })}
                                        className="w-full rounded border-gray-300 shadow-sm text-sm py-1.5 text-gray-900"
                                        placeholder="Amount"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BASIC DETAILS */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{data.type} #</label>
                                <input type="text" value={data.quoteNumber} onChange={e => setData({ ...data, quoteNumber: e.target.value })} className="w-full rounded border-gray-300 font-mono text-sm py-1.5 text-gray-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                                    <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Valid Until</label>
                                    <input type="date" value={data.validUntil} onChange={e => setData({ ...data, validUntil: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From (You)</label>
                                <textarea rows={3} value={data.from} onChange={e => setData({ ...data, from: e.target.value })} className="w-full rounded border-gray-300 text-sm p-2 text-gray-900" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To (Client)</label>
                                <textarea rows={3} value={data.to} onChange={e => setData({ ...data, to: e.target.value })} className="w-full rounded border-gray-300 text-sm p-2 text-gray-900" />
                            </div>
                        </div>

                        {/* LINE ITEMS */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Items / Services</h3>
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded border border-gray-100">
                                        <div className="col-span-5">
                                            <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full rounded border-gray-300 text-sm py-1 text-gray-900" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full rounded border-gray-300 text-sm py-1 text-right text-gray-900" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} className="w-full rounded border-gray-300 text-sm py-1 text-right text-gray-900" />
                                        </div>
                                        <div className="col-span-2 text-right text-sm font-medium pt-1.5 truncate">
                                            {data.currency}{item.amount}
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addItem} className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-600 font-medium">Add Item</button>
                        </div>

                        {/* TERMS */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Terms & Conditions</label>
                            <textarea rows={3} value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} className="w-full rounded border-gray-300 text-sm p-2 text-gray-900" />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className="w-full xl:w-1/2 min-h-[calc(100vh-100px)] flex justify-center items-start bg-gray-500/10 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden shadow-inner p-4">
                        <div
                            id="quote-preview"
                            className="bg-white shadow-2xl mx-auto px-8 py-10 text-sm text-[#1f2937] flex flex-col relative transition-transform duration-200"
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                            }}
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-start mb-10 border-b-4 border-indigo-600 pb-6">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-[#111827] uppercase tracking-wide">{data.type}</h1>
                                    <p className="text-indigo-600 font-bold mt-1 text-lg">#{data.quoteNumber}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">Date</div>
                                    <div className="text-lg font-bold text-[#111827]">{data.date}</div>
                                </div>
                            </div>

                            {/* ADDRESSES */}
                            <div className="flex justify-between mb-10">
                                <div className="w-5/12">
                                    <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">From</h3>
                                    <div className="whitespace-pre-line text-sm leading-relaxed font-medium">{data.from}</div>
                                </div>
                                <div className="w-5/12 text-right">
                                    <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">To</h3>
                                    <div className="whitespace-pre-line text-sm leading-relaxed font-medium">{data.to}</div>
                                </div>
                            </div>

                            {/* TABLE */}
                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="bg-gray-50 text-xs">
                                        <th className="text-left font-bold text-[#111827] py-3 px-4 uppercase tracking-wider rounded-l">Description</th>
                                        <th className="text-right font-bold text-[#111827] py-3 px-4 w-20 uppercase tracking-wider">Qty</th>
                                        <th className="text-right font-bold text-[#111827] py-3 px-4 w-32 uppercase tracking-wider">Rate</th>
                                        <th className="text-right font-bold text-[#111827] py-3 px-4 w-32 uppercase tracking-wider rounded-r">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="text-sm">
                                            <td className="py-4 px-4 font-medium text-[#111827]">{item.description}</td>
                                            <td className="py-4 px-4 text-right text-[#4b5563]">{item.quantity}</td>
                                            <td className="py-4 px-4 text-right text-[#4b5563]">{data.currency}{item.rate.toLocaleString('en-IN')}</td>
                                            <td className="py-4 px-4 text-right font-bold text-[#111827]">{data.currency}{item.amount.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* TOTALS */}
                            <div className="flex justify-end mb-10">
                                <div className="w-72 space-y-3">
                                    <div className="flex justify-between text-sm text-[#4b5563]">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{data.currency}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-{data.currency}{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}

                                    {data.taxInclusive ? (
                                        <div className="text-xs text-[#6b7280] italic text-right border-b border-gray-100 pb-2">
                                            Includes Tax ({data.taxRate}%): {data.currency}{totalTaxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-sm text-[#4b5563]">
                                            <span>Tax ({data.taxRate}%)</span>
                                            <span>+{data.currency}{totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xl font-bold text-white bg-indigo-600 p-3 rounded shadow-sm">
                                        <span>Total</span>
                                        <span>{data.currency}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* NOTES & FOOTER */}
                            <div className="mt-auto">
                                <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Terms & Conditions</h4>
                                        <p className="whitespace-pre-line text-xs text-[#4b5563] leading-relaxed">{data.notes}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block bg-orange-50 border border-orange-100 rounded-lg p-3 text-center min-w-[150px]">
                                            <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Valid Until</div>
                                            <div className="text-lg font-bold text-orange-800">{data.validUntil}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mt-10 text-[10px] text-gray-400 uppercase tracking-widest">
                                    Generated with Tools24Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
