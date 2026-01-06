'use client';

import { useState, useEffect } from 'react';
import { Calculator, PieChart, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export default function EMICalculator() {
    const [principal, setPrincipal] = useState<number>(1000000); // 10 Lakhs Default
    const [rate, setRate] = useState<number>(8.5); // 8.5% Default
    const [tenure, setTenure] = useState<number>(5); // 5 Years Default
    const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

    const [result, setResult] = useState({
        emi: 0,
        totalInterest: 0,
        totalPayment: 0,
        principalPercent: 0,
        interestPercent: 0
    });

    useEffect(() => {
        calculateEMI();
    }, [principal, rate, tenure, tenureType]);

    const calculateEMI = () => {
        const P = Number(principal);
        const R = Number(rate) / 12 / 100; // Monthly Interest Rate
        const N = tenureType === 'years' ? Number(tenure) * 12 : Number(tenure); // Tenure in Months

        if (P === 0 || N === 0) {
            setResult({
                emi: 0,
                totalInterest: 0,
                totalPayment: 0,
                principalPercent: 0,
                interestPercent: 0
            });
            return;
        }

        // EMI Formula: P * R * (1+R)^N / ((1+R)^N - 1)
        let emi = 0;
        if (R === 0) {
            emi = P / N;
        } else {
            emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        }

        const totalPayment = emi * N;
        const totalInterest = totalPayment - P;

        const principalPercent = (P / totalPayment) * 100;
        const interestPercent = (totalInterest / totalPayment) * 100;

        setResult({
            emi,
            totalInterest,
            totalPayment,
            principalPercent,
            interestPercent
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
                        <PieChart className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">EMI Calculator</h1>
                    <p className="mt-2 text-gray-600">Plan your loans with accurate monthly installment calculations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Input Panel */}
                    <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>
                            Loan Details
                        </h2>

                        {/* Principal Input */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₹</span>
                                    <input
                                        type="number"
                                        value={principal}
                                        onChange={(e) => setPrincipal(Number(e.target.value))}
                                        className="w-32 bg-indigo-50 border border-indigo-100 rounded-lg py-1 pl-6 pr-2 text-right text-sm font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min="10000"
                                max="100000000"
                                step="10000"
                                value={principal}
                                onChange={(e) => setPrincipal(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Rate Input */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Interest Rate (% p.a)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setRate(Number(e.target.value))}
                                        className="w-20 bg-indigo-50 border border-indigo-100 rounded-lg py-1 pl-2 pr-6 text-right text-sm font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">%</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="0.1"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Tenure Input */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Loan Tenure</label>
                                <div className="flex items-center space-x-2">
                                    <div className="bg-gray-100 p-0.5 rounded-lg flex">
                                        <button
                                            onClick={() => setTenureType('years')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${tenureType === 'years' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        >Yr</button>
                                        <button
                                            onClick={() => setTenureType('months')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${tenureType === 'months' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        >Mo</button>
                                    </div>
                                    <input
                                        type="number"
                                        value={tenure}
                                        onChange={(e) => setTenure(Number(e.target.value))}
                                        className="w-20 bg-indigo-50 border border-indigo-100 rounded-lg py-1 px-2 text-right text-sm font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max={tenureType === 'years' ? 30 : 360}
                                step="1"
                                value={tenure}
                                onChange={(e) => setTenure(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
                            Breakdown
                        </h2>

                        {/* Chart */}
                        <div className="flex justify-center mb-8 relative">
                            <div
                                className="w-48 h-48 rounded-full shadow-inner"
                                style={{
                                    background: `conic-gradient(#4f46e5 ${result.principalPercent}%, #10b981 ${result.principalPercent}% 100%)`
                                }}
                            >
                                <div className="absolute inset-0 m-auto w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Monthly EMI</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(result.emi)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
                                    <span className="text-gray-600">Principal Amount</span>
                                </div>
                                <span className="font-bold text-gray-900">{formatCurrency(principal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                    <span className="text-gray-600">Total Interest</span>
                                </div>
                                <span className="font-bold text-gray-900">{formatCurrency(result.totalInterest)}</span>
                            </div>
                            <div className="border-t border-gray-100 my-4 pt-4 flex justify-between items-center">
                                <span className="text-gray-900 font-semibold">Total Payable</span>
                                <span className="text-xl text-indigo-700 font-bold">{formatCurrency(result.totalPayment)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
