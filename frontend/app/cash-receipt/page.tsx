'use client';

import { useState } from 'react';
import {
    Download,
    FileCheck,
    Calendar,
    User,
    CreditCard
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToWords } from 'to-words';

// Types
interface ReceiptData {
    number: string;
    date: string;
    receivedFrom: string;
    amount: number;
    paymentMode: 'Cash' | 'Cheque' | 'UPI' | 'Bank Transfer';
    referenceNumber: string; // Cheque No / UPI ID
    for: string; // Description
    currency: string;
}

export default function CashReceiptGenerator() {
    const [data, setData] = useState<ReceiptData>({
        number: 'RCPT-101',
        date: new Date().toISOString().split('T')[0],
        receivedFrom: 'Mr. Rajesh Kumar',
        amount: 25000,
        paymentMode: 'Cash',
        referenceNumber: '',
        for: 'Advance payment for Web Development Services',
        currency: '₹'
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

    const amountInWords = data.amount > 0 ? toWords.convert(data.amount) : '';

    const downloadPDF = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById('receipt-preview');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 3, // Higher scale for receipts since they are smaller
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a5' // Receipts fit better on A5 Landscape or just A4 half
            });

            // Fit to A5 width (210mm)
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Receipt-${data.number}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <FileCheck className="w-6 h-6 text-slate-600" />
                            Cash Receipt Generator
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Generate professional payment receipts</p>
                    </div>
                    <button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-all"
                    >
                        {isGenerating ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download Receipt</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT: FORM */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Receipt Details</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receipt No</label>
                                        <input type="text" value={data.number} onChange={e => setData({ ...data, number: e.target.value })} className="w-full rounded-lg border-gray-300 text-sm py-2 text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                                        <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="w-full rounded-lg border-gray-300 text-sm py-2 text-gray-900" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Received From</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                        <input type="text" value={data.receivedFrom} onChange={e => setData({ ...data, receivedFrom: e.target.value })} className="w-full rounded-lg border-gray-300 text-sm py-2 pl-9 text-gray-900" placeholder="Payer Name" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount</label>
                                    <div className="flex gap-2">
                                        <select value={data.currency} onChange={e => setData({ ...data, currency: e.target.value })} className="w-20 rounded-lg border-gray-300 text-sm py-2 text-gray-900">
                                            <option value="₹">₹</option>
                                            <option value="$">$</option>
                                            <option value="€">€</option>
                                        </select>
                                        <input type="number" value={data.amount} onChange={e => setData({ ...data, amount: Number(e.target.value) })} className="w-full rounded-lg border-gray-300 text-sm py-2 font-bold text-gray-900" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Mode</label>
                                        <select value={data.paymentMode} onChange={e => setData({ ...data, paymentMode: e.target.value as any })} className="w-full rounded-lg border-gray-300 text-sm py-2 text-gray-900">
                                            <option>Cash</option>
                                            <option>Cheque</option>
                                            <option>UPI</option>
                                            <option>Bank Transfer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Reference No</label>
                                        <input type="text" value={data.referenceNumber} onChange={e => setData({ ...data, referenceNumber: e.target.value })} className="w-full rounded-lg border-gray-300 text-sm py-2 text-gray-900" placeholder="Optional" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">For / Description</label>
                                    <textarea rows={3} value={data.for} onChange={e => setData({ ...data, for: e.target.value })} className="w-full rounded-lg border-gray-300 text-sm py-2 text-gray-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PREVIEW */}
                    <div className="lg:col-span-7 flex justify-center items-center">
                        <div id="receipt-preview" className="bg-white border-4 border-double border-slate-200 p-8 shadow-2xl w-full max-w-[800px] aspect-[2/1] relative flex flex-col justify-between">

                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                <span className="text-9xl font-black text-slate-900 rotate-12">RECEIPT</span>
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 border-b-2 border-slate-800 pb-4">
                                <div>
                                    <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-wider">PAYMENT RECEIPT</h1>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-600">#{data.number}</div>
                                    <div className="text-sm text-slate-500 font-mono">{data.date}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-6 flex-1 px-4">
                                <div className="flex items-baseline gap-4 text-lg">
                                    <span className="text-slate-500 font-serif italic whitespace-nowrap">Received with thanks from</span>
                                    <span className="border-b-2 border-dotted border-slate-300 flex-1 font-bold text-slate-800 px-2">{data.receivedFrom}</span>
                                </div>

                                <div className="flex items-baseline gap-4 text-lg">
                                    <span className="text-slate-500 font-serif italic whitespace-nowrap">The sum of</span>
                                    <span className="border-b-2 border-dotted border-slate-300 flex-1 font-medium text-slate-800 px-2">{amountInWords} Only</span>
                                </div>

                                <div className="flex items-baseline gap-4 text-lg">
                                    <span className="text-slate-500 font-serif italic whitespace-nowrap">By {data.paymentMode}</span>
                                    <span className="border-b-2 border-dotted border-slate-300 flex-1 font-medium text-slate-800 px-2">{data.referenceNumber || '_________________'}</span>
                                </div>

                                <div className="flex items-baseline gap-4 text-lg">
                                    <span className="text-slate-500 font-serif italic whitespace-nowrap">On account of</span>
                                    <span className="border-b-2 border-dotted border-slate-300 flex-1 font-medium text-slate-800 px-2">{data.for}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex justify-between items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="text-3xl font-bold text-slate-800 font-mono tracking-tight">
                                    {data.currency} {data.amount.toLocaleString('en-IN')}
                                </div>
                                <div className="text-center">
                                    <div className="h-10 w-40 border-b border-slate-800 mb-2"></div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Authorized Signatory</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
