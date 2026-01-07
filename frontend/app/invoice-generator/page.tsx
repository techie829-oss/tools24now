'use client';

import { useState } from 'react';
import {
    Download,
    Plus,
    Trash2,
    Settings,
    Share2,
    Palette,
    FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
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

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    from: string;
    to: string;
    logo?: string;
    currency: string;

    taxType: 'simple' | 'gst_intra' | 'gst_inter';
    taxRate: number;
    taxInclusive: boolean;
    discount: number;
    notes: string;

    // Bank Details
    showBankDetails: boolean;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    accountHolder: string;
    upiId: string;

    // Display Options
    showHSN: boolean;
    showSKU: boolean;
    showDiscount: boolean;
}

export default function InvoiceGenerator() {
    // State
    const [items, setItems] = useState<LineItem[]>([
        { id: '1', description: 'Enterprise UI/UX Design System', hsn: '998311', sku: 'DES-001', quantity: 1, rate: 25000, amount: 25000 },
        { id: '2', description: 'React Frontend Development (Senior)', hsn: '998314', sku: 'DEV-react', quantity: 80, rate: 2500, amount: 200000 },
    ]);

    const [data, setData] = useState<InvoiceData>({
        invoiceNumber: 'INV-2024-001',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        from: 'TechSolutions India Pvt Ltd.\nUnit 402, Cyber Park\nGurugram, Haryana 122002\nGSTIN: 06AAAAA0000A1Z5',
        to: 'Global Corp Enterprises\n45th Floor, Trade Tower\nLower Parel, Mumbai 400013',
        currency: '₹',
        taxType: 'gst_intra',
        taxRate: 18,
        taxInclusive: false,
        discount: 0,
        notes: 'Payment terms: Net 14. \nPlease include invoice number in transaction description.',

        // Bank Defaults
        showBankDetails: false,
        bankName: '',
        accountNumber: '',
        ifsc: '',
        accountHolder: '',
        upiId: '',

        // Default Toggles
        showHSN: true,
        showSKU: false,
        showDiscount: true
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
        // Inclusive Logic: The subtotal ALREADY includes tax.
        const taxFactor = data.taxRate / 100;
        const totalAmount = subtotal - discountAmount;

        // Ensure strictly positive
        const validTotal = totalAmount > 0 ? totalAmount : 0;
        total = validTotal;

        // Extract tax component: (Total / (1 + Rate)) gives Pre-Tax
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
        // Exclusive Logic
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
            const invoiceElement = document.getElementById('invoice-preview');
            if (!invoiceElement) return;

            // Ensure High Quality Scale
            // We temporarily reset scale to 1 for capture if needed, but scaling up gives better res
            const canvas = await html2canvas(invoiceElement, {
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
            pdf.save(`Invoice-${data.invoiceNumber}.pdf`);
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
                            <FileText className="w-6 h-6 text-blue-600" />
                            Professional Invoice Generator
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Need full invoicing & GST reports? <span className="font-bold text-indigo-600 cursor-pointer">Try CoolBook</span>
                        </p>
                    </div>
                    <button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        {isGenerating ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download Invoice</>}
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* LEFT COLUMN: EDITOR (Scrollable) */}
                    <div className="w-full xl:w-1/2 space-y-5">


                        {/* CONFIGURATION PANEL */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-100">
                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={data.showHSN} onChange={e => setData({ ...data, showHSN: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span>Show HSN/SAC</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={data.showSKU} onChange={e => setData({ ...data, showSKU: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span>Show SKU</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={data.showDiscount} onChange={e => setData({ ...data, showDiscount: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span>Show Discount</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
                                    <select
                                        value={data.currency}
                                        onChange={(e) => setData({ ...data, currency: e.target.value })}
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 text-gray-900"
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
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 text-gray-900"
                                    >
                                        <option value="gst_intra">GST (Intra-state: CGST + SGST)</option>
                                        <option value="gst_inter">IGST (Inter-state)</option>
                                        <option value="simple">Simple Tax</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate %</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={data.taxRate} onChange={e => setData({ ...data, taxRate: Number(e.target.value) })} className="w-full rounded border-gray-300 shadow-sm text-sm py-1.5 text-gray-900" />
                                    </div>
                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                        <input type="checkbox" checked={data.taxInclusive} onChange={e => setData({ ...data, taxInclusive: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                                        <span className="text-xs text-gray-600">Tax Inclusive</span>
                                    </label>
                                </div>
                                {data.showDiscount && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Discount ({data.currency})</label>
                                        <input
                                            type="number"
                                            value={data.discount}
                                            onChange={e => setData({ ...data, discount: Number(e.target.value) })}
                                            className="w-full rounded border-gray-300 shadow-sm text-sm py-1.5 text-gray-900"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BASIC DETAILS */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice #</label>
                                <input type="text" value={data.invoiceNumber} onChange={e => setData({ ...data, invoiceNumber: e.target.value })} className="w-full rounded border-gray-300 font-mono text-sm py-1.5 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                                <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Billed By (You)</label>
                                <textarea rows={3} value={data.from} onChange={e => setData({ ...data, from: e.target.value })} className="w-full rounded border-gray-300 text-sm p-2 text-gray-900" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Billed To (Client)</label>
                                <textarea rows={3} value={data.to} onChange={e => setData({ ...data, to: e.target.value })} className="w-full rounded border-gray-300 text-sm p-2 text-gray-900" />
                            </div>
                        </div>

                        {/* LINE ITEMS */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded border border-gray-100">
                                        <div className="col-span-5">
                                            <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full rounded border-gray-300 text-sm py-1 text-gray-900" />
                                            <div className="flex gap-2 mt-2">
                                                {data.showHSN && (
                                                    <input type="text" placeholder="HSN/SAC" value={item.hsn || ''} onChange={e => handleItemChange(item.id, 'hsn', e.target.value)} className="w-20 rounded border-gray-300 text-xs py-1 text-gray-900" />
                                                )}
                                                {data.showSKU && (
                                                    <input type="text" placeholder="SKU" value={item.sku || ''} onChange={e => handleItemChange(item.id, 'sku', e.target.value)} className="w-20 rounded border-gray-300 text-xs py-1 text-gray-900" />
                                                )}
                                            </div>
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
                            <button onClick={addItem} className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium">Add Item</button>
                        </div>

                        {/* BANK & UPI */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">Payment Details</h3>
                                <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={data.showBankDetails} onChange={e => setData({ ...data, showBankDetails: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span>Show Bank Details</span>
                                </label>
                            </div>
                            {data.showBankDetails && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <input type="text" placeholder="Bank Name" value={data.bankName} onChange={e => setData({ ...data, bankName: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Holder Name" value={data.accountHolder} onChange={e => setData({ ...data, accountHolder: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Account No" value={data.accountNumber} onChange={e => setData({ ...data, accountNumber: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="IFSC / SWIFT" value={data.ifsc} onChange={e => setData({ ...data, ifsc: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                    </div>
                                </div>
                            )}

                            {data.currency === '₹' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">UPI ID (For QR Code)</label>
                                    <input type="text" placeholder="e.g. yourname@upi" value={data.upiId} onChange={e => setData({ ...data, upiId: e.target.value })} className="w-full rounded border-gray-300 text-sm py-1.5 text-gray-900" />
                                </div>
                            )}
                        </div>

                        {/* FOOTER NOTES */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes / Terms</label>
                            <textarea rows={3} value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} className="w-full rounded border-gray-300 text-sm p-2 text-gray-900" />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: PREVIEW (Sticky & Scaled) */}
                    <div className="w-full xl:w-1/2 h-[calc(100vh-100px)] sticky top-4 flex justify-center items-start bg-gray-500/10 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden shadow-inner p-2">
                        {/* PREVIEW CONTAINER */}
                        <div className="relative w-full h-full flex items-start justify-center overflow-auto custom-scrollbar">
                            <div
                                id="invoice-preview"
                                className="bg-white shadow-2xl mx-auto px-6 py-8 text-sm text-[#1f2937] flex flex-col relative transition-transform duration-200 ease-out"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    // Removed hardcoded scaling and margin hacks.
                                    // The parent container is now flexible enough to show it reasonably well,
                                    // or we rely on the user's screen size.
                                    // For now, let's auto-scale only if screen is small via CSS or just leave natural size and let it scroll naturally is better than a forced tiny view.
                                    // BUT user complained about "half size". So maybe they WANT it to be fit?
                                    // I'll add a subtle scale for XL screens to make it fit "fully".
                                    transform: 'scale(0.9)',
                                    transformOrigin: 'top center'
                                }}
                            >
                                {/* INVOICE HEADER */}
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h1 className="text-4xl font-extrabold text-[#111827] uppercase tracking-wide">Invoice</h1>
                                        <p className="text-[#2563eb] font-medium mt-1">#{data.invoiceNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">Amount Due</div>
                                        <div className="text-3xl font-bold text-[#111827]">{data.currency}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>

                                {/* ADDRESS GRID */}
                                <div className="grid grid-cols-2 gap-12 mb-8 border-t border-b border-[#f3f4f6] py-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Billed By</h3>
                                        <div className="whitespace-pre-line text-sm leading-relaxed">{data.from}</div>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Billed To</h3>
                                        <div className="whitespace-pre-line text-sm leading-relaxed">{data.to}</div>
                                    </div>
                                </div>

                                {/* DATES */}
                                <div className="flex justify-between mb-8">
                                    <div>
                                        <span className="text-[#6b7280] text-xs uppercase">Date:</span>
                                        <span className="font-medium ml-2">{data.date}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6b7280] text-xs uppercase">Due Date:</span>
                                        <span className="font-medium ml-2">{data.dueDate}</span>
                                    </div>
                                </div>

                                {/* TABLE */}
                                <table className="w-full mb-6">
                                    <thead>
                                        <tr className="border-b-2 border-[#111827] text-xs">
                                            <th className="text-left font-bold text-[#111827] py-2 uppercase tracking-wider">Item</th>
                                            {data.showHSN && <th className="text-left font-bold text-[#111827] py-2 w-20 uppercase tracking-wider">HSN</th>}
                                            {data.showSKU && <th className="text-left font-bold text-[#111827] py-2 w-20 uppercase tracking-wider">SKU</th>}
                                            <th className="text-right font-bold text-[#111827] py-2 w-16 uppercase tracking-wider">Qty</th>
                                            <th className="text-right font-bold text-[#111827] py-2 w-24 uppercase tracking-wider">Rate</th>
                                            <th className="text-right font-bold text-[#111827] py-2 w-28 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f3f4f6]">
                                        {items.map((item) => (
                                            <tr key={item.id} className="text-sm">
                                                <td className="py-3 font-medium text-[#111827]">{item.description}</td>
                                                {data.showHSN && <td className="py-3 text-[#6b7280] text-xs">{item.hsn}</td>}
                                                {data.showSKU && <td className="py-3 text-[#6b7280] text-xs">{item.sku}</td>}
                                                <td className="py-3 text-right text-[#4b5563]">{item.quantity}</td>
                                                <td className="py-3 text-right text-[#4b5563]">{data.currency}{item.rate.toLocaleString('en-IN')}</td>
                                                <td className="py-3 text-right font-bold text-[#111827]">{data.currency}{item.amount.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* TOTALS */}
                                <div className="flex justify-end mb-8">
                                    <div className="w-64 space-y-2 border-t border-[#f3f4f6] pt-4">
                                        <div className="flex justify-between text-sm text-[#4b5563]">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{data.currency}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        {data.taxInclusive ? (
                                            // FOR INCLUSIVE
                                            <div className="text-xs text-[#6b7280] italic text-right mb-2 border-b border-[#f3f4f6] pb-2">
                                                <div>Includes Tax ({data.taxRate}%): {data.currency}{totalTaxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                                {data.taxType === 'gst_intra' && (
                                                    <div>(CGST: {data.currency}{cgstAmount.toFixed(2)} + SGST: {data.currency}{sgstAmount.toFixed(2)})</div>
                                                )}
                                            </div>
                                        ) : (
                                            // FOR EXCLUSIVE
                                            <>
                                                {data.taxType === 'gst_intra' ? (
                                                    <>
                                                        <div className="flex justify-between text-sm text-[#4b5563]">
                                                            <span>CGST ({data.taxRate / 2}%)</span>
                                                            <span>+{data.currency}{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-[#4b5563]">
                                                            <span>SGST ({data.taxRate / 2}%)</span>
                                                            <span>+{data.currency}{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </>
                                                ) : data.taxType === 'gst_inter' ? (
                                                    <div className="flex justify-between text-sm text-[#4b5563]">
                                                        <span>IGST ({data.taxRate}%)</span>
                                                        <span>+{data.currency}{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between text-sm text-[#4b5563]">
                                                        <span>Tax ({data.taxRate}%)</span>
                                                        <span>+{data.currency}{totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {data.showDiscount && discountAmount > 0 && (
                                            <div className="flex justify-between text-sm text-[#16a34a]">
                                                <span>Discount</span>
                                                <span>-{data.currency}{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-lg font-bold text-[#111827] border-t-2 border-[#111827] pt-3 mt-2">
                                            <span>Total</span>
                                            <span>{data.currency}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        {/* Amount in Words */}
                                        <div className="text-right text-xs text-[#6b7280] font-medium italic mt-1 pt-1 border-t border-[#f3f4f6]">
                                            {amountInWords}
                                        </div>
                                    </div>
                                </div>

                                {/* BANK & UPI & NOTES */}
                                <div className="mt-auto pt-6 border-t border-[#f3f4f6] grid grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Terms & Notes</h4>
                                        <p className="whitespace-pre-line text-xs text-[#4b5563] mb-4">{data.notes}</p>

                                        {data.showBankDetails && (
                                            <div className="text-xs text-[#374151] space-y-1 bg-[#f9fafb] p-3 rounded">
                                                <div className="font-bold mb-1">Bank Details</div>
                                                {data.bankName && <div>Bank: {data.bankName}</div>}
                                                {data.accountNumber && <div>A/c No: {data.accountNumber}</div>}
                                                {data.ifsc && <div>IFSC: {data.ifsc}</div>}
                                                {data.accountHolder && <div>Holder: {data.accountHolder}</div>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end">
                                        {data.upiId && data.currency === '₹' && (
                                            <div className="text-center">
                                                <div className="mb-2 bg-white p-2 text-center inline-block border border-[#e5e7eb] rounded-lg">
                                                    <QRCodeSVG
                                                        value={`upi://pay?pa=${data.upiId}&pn=${encodeURIComponent(data.from.split('\n')[0])}&am=${total.toFixed(2)}&cu=INR`}
                                                        size={80}
                                                        level="M"
                                                    />
                                                </div>
                                                <div className="text-xs font-medium text-[#111827]">Scan to Pay</div>
                                                <div className="text-[10px] text-[#6b7280]">{data.upiId}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
