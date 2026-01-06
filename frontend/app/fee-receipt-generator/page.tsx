'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Printer, Receipt, FileText, Calculator } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ToWords } from 'to-words';

interface FeeItem {
    id: string;
    description: string;
    amount: number;
}

interface ReceiptData {
    receiptNo: string;
    date: string;
    schoolName: string;
    schoolAddress: string;
    schoolContact: string;
    studentName: string;
    class: string;
    rollNo: string;
    academicYear: string;
    paymentMode: string;
    transactionId: string;
    remarks: string;
}

export default function FeeReceiptGeneratorPage() {
    const receiptRef = useRef<HTMLDivElement>(null);
    const toWords = new ToWords();

    const [data, setData] = useState<ReceiptData>({
        receiptNo: `REC-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        schoolName: 'Springfield High School',
        schoolAddress: '123 Education Lane, Knowledge City',
        schoolContact: 'Phone: +1 234 567 890 | Email: accounts@springfield.edu',
        studentName: '',
        class: '',
        rollNo: '',
        academicYear: '2024-2025',
        paymentMode: 'Cash',
        transactionId: '',
        remarks: 'Term 1 Fees'
    });

    const [items, setItems] = useState<FeeItem[]>([
        { id: '1', description: 'Tuition Fee', amount: 5000 },
        { id: '2', description: 'Library Fee', amount: 500 },
        { id: '3', description: 'Transport Fee', amount: 1200 },
    ]);

    const [total, setTotal] = useState(0);

    useEffect(() => {
        const sum = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
        setTotal(sum);
    }, [items]);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', amount: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof FeeItem, value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const downloadImage = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `receipt-${data.receiptNo}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to generate receipt", err);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
            {/* Header - Hidden in Print */}
            <div className="bg-white border-b border-gray-200 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Receipt className="text-indigo-600" />
                                Fee Receipt Generator
                            </h1>
                            <p className="text-gray-500 mt-1">Generate professional fee receipts with auto-calculations</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button onClick={downloadImage} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                <Download className="w-4 h-4 mr-2" />
                                Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Editor Form - Hidden in Print */}
                <div className="lg:w-5/12 space-y-6 print:hidden">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-indigo-500" /> School Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">School Name</label>
                                <input type="text" value={data.schoolName} onChange={e => setData({ ...data, schoolName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                                <input type="text" value={data.schoolAddress} onChange={e => setData({ ...data, schoolAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Contact Info</label>
                                <input type="text" value={data.schoolContact} onChange={e => setData({ ...data, schoolContact: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                            </div>
                        </div>

                        <div className="mt-6 mb-4 border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Receipt className="w-4 h-4 mr-2 text-indigo-500" /> Receipt Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Receipt No</label>
                                <input type="text" value={data.receiptNo} onChange={e => setData({ ...data, receiptNo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                            </div>
                        </div>

                        <div className="mt-6 mb-4 border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Calculator className="w-4 h-4 mr-2 text-indigo-500" /> Fee Breakdown
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={item.amount}
                                        onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm text-right"
                                    />
                                    <button onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                                <Plus className="w-3 h-3 mr-1" /> Add Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:w-7/12">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex items-start justify-center">

                        {/* Visual Receipt */}
                        <div ref={receiptRef} className="w-full bg-white p-8 max-w-[800px] relative">
                            {/* Header */}
                            <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                                <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-widest">{data.schoolName}</h1>
                                <p className="text-gray-600 mt-2 text-sm">{data.schoolAddress}</p>
                                <p className="text-gray-500 text-xs mt-1">{data.schoolContact}</p>
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase">Receipt To:</p>
                                    <input
                                        type="text"
                                        value={data.studentName}
                                        onChange={e => setData({ ...data, studentName: e.target.value })}
                                        placeholder="Student Name"
                                        className="text-xl font-bold text-gray-900 mt-1 border-b border-dashed border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent w-full"
                                    />
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Class:</span>
                                            <input
                                                type="text"
                                                value={data.class}
                                                onChange={e => setData({ ...data, class: e.target.value })}
                                                placeholder="X-A"
                                                className="text-sm font-medium border-b border-dashed border-transparent hover:border-gray-300 focus:outline-none w-16"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Roll No:</span>
                                            <input
                                                type="text"
                                                value={data.rollNo}
                                                onChange={e => setData({ ...data, rollNo: e.target.value })}
                                                placeholder="001"
                                                className="text-sm font-medium border-b border-dashed border-transparent hover:border-gray-300 focus:outline-none w-16"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block bg-gray-100 px-4 py-2 rounded mb-2">
                                        <span className="text-xs text-gray-500 uppercase font-bold mr-2">Receipt No:</span>
                                        <span className="text-sm font-mono font-bold">{data.receiptNo}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Date: <span className="font-semibold">{data.date}</span></p>
                                    <p className="text-sm text-gray-600">Session: <span className="font-semibold">{data.academicYear}</span></p>
                                </div>
                            </div>

                            {/* Table */}
                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="bg-gray-50 border-y-2 border-gray-800">
                                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Sl. No</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Description / Particulars</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="py-3 px-4 text-sm text-gray-500 w-16">{idx + 1}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.description || 'Item Description'}</td>
                                            <td className="py-3 px-4 text-right text-sm text-gray-900 font-mono">
                                                {item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr className="border-t-2 border-gray-800">
                                        <td colSpan={2} className="py-4 px-4 text-right text-sm font-bold text-gray-800 uppercase">Total Amount</td>
                                        <td className="py-4 px-4 text-right text-xl font-bold text-gray-900 font-mono bg-gray-50">
                                            {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="border-b border-dashed border-gray-300 pb-6 mb-6">
                                <p className="text-xs text-gray-500 uppercase mb-1">Amount in Words</p>
                                <p className="text-sm font-bold text-gray-800 italic capitalize">
                                    {total > 0 ? toWords.convert(total, { currency: true }) : 'Zero Rupees Only'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-end">
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p><span className="font-semibold">Payment Mode:</span> {data.paymentMode}</p>
                                    <p><span className="font-semibold">Transaction ID:</span> {data.transactionId || 'N/A'}</p>
                                    <p><span className="font-semibold">Remarks:</span> {data.remarks}</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-16 mb-2"></div> {/* Space for signature */}
                                    <p className="text-xs font-bold text-gray-900 uppercase border-t border-gray-300 pt-2 inline-block px-8">Authorized Signature</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                                <p className="text-[10px] text-gray-400">This is a system generated receipt.</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
