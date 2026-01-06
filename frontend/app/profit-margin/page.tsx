'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, RefreshCw, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ProfitMarginCalculator() {
    const [mode, setMode] = useState<'margin' | 'price'>('margin'); // 'margin' = Find Margin, 'price' = Find Sale Price

    const [cost, setCost] = useState<number | ''>('');
    const [revenue, setRevenue] = useState<number | ''>(''); // This acts as "Selling Price" in 'margin' mode
    const [targetMargin, setTargetMargin] = useState<number | ''>(''); // Used in 'price' mode

    const [result, setResult] = useState({
        profit: 0,
        margin: 0,
        markup: 0,
        salePrice: 0
    });

    useEffect(() => {
        calculate();
    }, [cost, revenue, targetMargin, mode]);

    const calculate = () => {
        const cp = Number(cost);

        if (mode === 'margin') {
            const sp = Number(revenue);
            if (!cp || !sp) {
                setResult({ profit: 0, margin: 0, markup: 0, salePrice: 0 });
                return;
            }

            const profit = sp - cp;
            const margin = (profit / sp) * 100;
            const markup = (profit / cp) * 100;

            setResult({
                profit,
                margin,
                markup,
                salePrice: sp
            });

        } else {
            // Find Sale Price based on CP and Target Margin
            const mg = Number(targetMargin);
            if (!cp || !mg) {
                setResult({ profit: 0, margin: 0, markup: 0, salePrice: 0 });
                return;
            }

            // Formula: Sale Price = Cost / (1 - Margin%)
            // Margin needs to be in decimal (e.g., 20% = 0.2)
            const sp = cp / (1 - (mg / 100));
            const profit = sp - cp;
            const markup = (profit / cp) * 100;

            setResult({
                profit,
                margin: mg,
                markup,
                salePrice: sp
            });
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(val);
    };

    const formatPercent = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2
        }).format(val) + '%';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Profit Margin Calculator</h1>
                    <p className="mt-2 text-gray-600">Optimize your pricing strategy with accurate margin & markup calculations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Input Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>
                            Input Details
                        </h2>

                        {/* Mode Toggle */}
                        <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                            <button
                                onClick={() => setMode('margin')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'margin'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Find Margin
                            </button>
                            <button
                                onClick={() => setMode('price')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'price'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Set Sale Price
                            </button>
                        </div>

                        {/* Cost Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price (CP)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
                                    placeholder="Cost to make/buy"
                                />
                            </div>
                        </div>

                        {/* Conditional Input */}
                        {mode === 'margin' ? (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (SP)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input
                                        type="number"
                                        value={revenue}
                                        onChange={(e) => setRevenue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
                                        placeholder="Price you sell at"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Desired Margin (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetMargin}
                                        onChange={(e) => setTargetMargin(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
                                        placeholder="Target profit margin"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => { setCost(''); setRevenue(''); setTargetMargin(''); }}
                            className="w-full flex items-center justify-center py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset
                        </button>
                    </div>

                    {/* Result Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
                            Results
                        </h2>

                        <div className="flex-1 space-y-6">

                            {/* Output Highligts */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                    <p className="text-xs text-indigo-500 uppercase font-bold mb-1">Gross Profit</p>
                                    <p className="text-2xl font-bold text-indigo-700">{formatCurrency(result.profit)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                    <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Selling Price</p>
                                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(result.salePrice)}</p>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <span className="text-gray-900 font-bold block text-lg">{formatPercent(result.margin)}</span>
                                        <span className="text-gray-500 text-xs uppercase font-medium">Gross Margin</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-900 font-bold block text-lg">{formatPercent(result.markup)}</span>
                                        <span className="text-gray-500 text-xs uppercase font-medium">Markup</span>
                                    </div>
                                </div>

                                <div className="text-sm bg-blue-50 text-blue-800 p-4 rounded-xl leading-relaxed">
                                    <p className="font-medium mb-1">💡 Insight</p>
                                    {result.margin > 0 ? (
                                        `By selling at ${formatCurrency(result.salePrice)}, you make a profit of ${formatCurrency(result.profit)} per unit.`
                                    ) : (
                                        "Enter your cost and selling price/target margin to see your profitability metrics."
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
