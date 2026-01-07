'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function CompanyValuationCalculator() {
    const [revenue, setRevenue] = useState(5000000); // 50L
    const [profit, setProfit] = useState(1000000); // 10L
    const [growthRate, setGrowthRate] = useState(15); // 15%
    const [industry, setIndustry] = useState('tech'); // Default Multiplier

    // Industry Multipliers (Revenue and Profit based)
    const MULTIPLIERS: any = {
        tech: { name: 'SaaS / Technology', revMult: 5, profitMult: 15 },
        ecom: { name: 'E-commerce', revMult: 1.5, profitMult: 4 },
        agency: { name: 'Service Agency', revMult: 1, profitMult: 3 },
        retail: { name: 'Retail / Manufacturing', revMult: 0.8, profitMult: 3 },
    };

    const calculateValuation = () => {
        const mult = MULTIPLIERS[industry];
        const revVal = revenue * mult.revMult;
        const profitVal = profit * mult.profitMult;

        // Simple weighted average or range
        return {
            revBased: revVal,
            profitBased: profitVal,
            average: (revVal + profitVal) / 2
        };
    };

    const val = calculateValuation();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        Company Valuation Calculator (Basic)
                    </h1>
                    <p className="mt-2 text-gray-600">Estimate your startup or small business value using standard industry multipliers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue (₹)</label>
                            <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Net Profit (EBITDA) (₹)</label>
                            <input type="number" value={profit} onChange={e => setProfit(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
                            <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900">
                                {Object.keys(MULTIPLIERS).map(k => (
                                    <option key={k} value={k}>{MULTIPLIERS[k].name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">YoY Growth Rate (%)</label>
                            <input type="number" value={growthRate} onChange={e => setGrowthRate(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                        </div>
                    </div>

                    {/* VALUATION CARD */}
                    <div className="space-y-6">
                        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                            <h2 className="text-indigo-200 uppercase tracking-widest text-sm font-semibold mb-2">Estimated Valuation</h2>
                            <div className="text-4xl md:text-5xl font-black mb-1">₹{val.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            <div className="text-sm text-indigo-300 mt-2">Average of Revenue & Profit methods</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="text-gray-500 text-xs uppercase mb-1">Revenue Method ({MULTIPLIERS[industry].revMult}x)</div>
                                <div className="font-bold text-gray-900 text-lg">₹{val.revBased.toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="text-gray-500 text-xs uppercase mb-1">Profit Method ({MULTIPLIERS[industry].profitMult}x)</div>
                                <div className="font-bold text-gray-900 text-lg">₹{val.profitBased.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h4 className="font-bold text-yellow-800 text-sm mb-2">Disclaimer</h4>
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                This is a simplified "Rule of Thumb" valuation. Actual valuation depends on IP, team, market size, debt, and cash flow.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
