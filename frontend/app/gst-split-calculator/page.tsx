'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function GSTSplitCalculator() {
    const [amount, setAmount] = useState<number>(0);
    const [rate, setRate] = useState<number>(18);
    const [result, setResult] = useState<any>(null);

    const calculate = (totalAmount: number, taxRate: number) => {
        if (!totalAmount) {
            setResult(null);
            return;
        }

        // Formula: Base = Total / (1 + Rate/100)
        const baseAmount = totalAmount / (1 + taxRate / 100);
        const gstAmount = totalAmount - baseAmount;

        setResult({
            total: totalAmount,
            base: baseAmount,
            gstTotal: gstAmount,
            cgst: gstAmount / 2,
            sgst: gstAmount / 2
        });
    };

    const handleAmountChange = (val: string) => {
        const num = parseFloat(val);
        setAmount(num);
        calculate(num, rate);
    };

    const handleRateChange = (r: number) => {
        setRate(r);
        calculate(amount, r);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <Calculator className="w-8 h-8 text-indigo-600" />
                        GST Split Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Reverse calculate Base Amount and GST from Total Bill Value.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (Inclusive of GST)</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-lg">₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 pl-8 py-3 text-lg focus:border-indigo-500 focus:ring-indigo-500 font-bold text-gray-900"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Select GST Rate</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[5, 12, 18, 28].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => handleRateChange(r)}
                                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${rate === r
                                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {r}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {result && (
                            <div className="mt-8 bg-indigo-50 rounded-xl p-6 space-y-4 border border-indigo-100">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Base Value</span>
                                    <span className="text-lg font-semibold text-gray-900">₹{result.base.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Total GST ({rate}%)</span>
                                    <span className="text-lg font-semibold text-indigo-600">₹{result.gstTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="h-px bg-indigo-200"></div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 pt-2">
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                                        <div className="text-xs uppercase font-bold tracking-wider mb-1">CGST ({rate / 2}%)</div>
                                        <div className="font-bold text-gray-900">₹{result.cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                                        <div className="text-xs uppercase font-bold tracking-wider mb-1">SGST ({rate / 2}%)</div>
                                        <div className="font-bold text-gray-900">₹{result.sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
