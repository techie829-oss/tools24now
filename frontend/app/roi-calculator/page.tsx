'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function ROICalculator() {
    const [investment, setInvestment] = useState(100000);
    const [returned, setReturned] = useState(150000);
    const [period, setPeriod] = useState(1); // Years

    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const gain = returned - investment;
        const roi = (gain / investment) * 100;
        const annualizedRoi = (Math.pow((returned / investment), (1 / period)) - 1) * 100;

        setResult({
            gain,
            roi,
            annualizedRoi
        });
    }, [investment, returned, period]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        ROI Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Calculate Return on Investment and Annualized Returns.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Investment (₹)</label>
                                <input type="number" value={investment} onChange={e => setInvestment(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-3 text-lg text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Returned / Current Value (₹)</label>
                                <input type="number" value={returned} onChange={e => setReturned(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-3 text-lg text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Years)</label>
                                <input type="number" value={period} onChange={e => setPeriod(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-3 text-lg text-gray-900" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-4">
                            <div className="bg-blue-600 text-white p-6 rounded-xl text-center">
                                <div className="text-blue-100 uppercase text-xs font-bold tracking-wider mb-1">Total ROI</div>
                                <div className="text-5xl font-black">{result?.roi.toFixed(2)}%</div>
                                <div className="mt-2 text-lg font-medium">₹{result?.gain.toLocaleString()} gain</div>
                            </div>

                            <div className="bg-gray-100 p-6 rounded-xl text-center">
                                <div className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Annualized Return (CAGR)</div>
                                <div className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-1">
                                    {result?.annualizedRoi.toFixed(2)}%
                                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
