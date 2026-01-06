'use client';

import { useState, useEffect } from 'react';
import { Calculator, Copy, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GSTCalculator() {
    const [amount, setAmount] = useState<number | ''>('');
    const [rate, setRate] = useState<number>(18);
    const [taxMode, setTaxMode] = useState<'exclusive' | 'inclusive'>('exclusive');

    const [result, setResult] = useState({
        netAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
        cgst: 0,
        sgst: 0
    });

    useEffect(() => {
        calculateGST();
    }, [amount, rate, taxMode]);

    const calculateGST = () => {
        const numAmount = Number(amount);
        if (!amount || isNaN(numAmount)) {
            setResult({ netAmount: 0, gstAmount: 0, totalAmount: 0, cgst: 0, sgst: 0 });
            return;
        }

        let net = 0;
        let gst = 0;
        let total = 0;

        if (taxMode === 'exclusive') {
            // GST is added ON TOP of the amount
            net = numAmount;
            gst = (numAmount * rate) / 100;
            total = net + gst;
        } else {
            // GST is INCLUDED in the amount
            total = numAmount;
            gst = numAmount - (numAmount / (1 + rate / 100));
            net = total - gst;
        }

        setResult({
            netAmount: net,
            gstAmount: gst,
            totalAmount: total,
            cgst: gst / 2,
            sgst: gst / 2
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(val);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const predefinedRates = [5, 12, 18, 28];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
                        <Calculator className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">GST Calculator</h1>
                    <p className="mt-2 text-gray-600">
                        Calculate inclusive & exclusive GST accurately. Need full reports? <span className="font-bold text-indigo-600 cursor-pointer">Try CoolBook</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Input Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>
                            Input Details
                        </h2>

                        {/* Tax Mode Toggle */}
                        <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                            <button
                                onClick={() => setTaxMode('exclusive')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${taxMode === 'exclusive'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                GST Exclusive (Add Tax)
                            </button>
                            <button
                                onClick={() => setTaxMode('inclusive')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${taxMode === 'inclusive'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                GST Inclusive (Remove Tax)
                            </button>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Initial Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium pl-8"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        {/* GST Rate */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {predefinedRates.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRate(r)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${rate === r
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {r}%
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                            </div>
                        </div>

                        <button
                            onClick={() => { setAmount(''); setRate(18); }}
                            className="w-full flex items-center justify-center py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset
                        </button>
                    </div>

                    {/* Result Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
                            Calculation Result
                        </h2>

                        <div className="flex-1 space-y-6">
                            {/* Total Amount */}
                            <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm font-medium mb-1">Total Amount</p>
                                    <h3 className="text-3xl font-bold">{formatCurrency(result.totalAmount)}</h3>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(result.totalAmount.toString())}
                                    className="absolute top-6 right-6 p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                >
                                    <Copy className="w-4 h-4 text-white" />
                                </button>
                                {/* Decorative BG */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 font-medium">Net Amount</span>
                                    <span className="text-gray-900 font-bold">{formatCurrency(result.netAmount)}</span>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <span className="text-indigo-700 font-medium">Total GST ({rate}%)</span>
                                    <span className="text-indigo-700 font-bold">{formatCurrency(result.gstAmount)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">CGST ({rate / 2}%)</p>
                                        <p className="text-gray-900 font-bold">{formatCurrency(result.cgst)}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">SGST ({rate / 2}%)</p>
                                        <p className="text-gray-900 font-bold">{formatCurrency(result.sgst)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Link href="/invoice-generator" className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white group hover:shadow-lg transition-all">
                                <div>
                                    <p className="font-bold">Need an Invoice?</p>
                                    <p className="text-indigo-100 text-sm">Create professional GST invoices for free</p>
                                </div>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
