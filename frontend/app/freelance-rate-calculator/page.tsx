'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';

export default function FreelanceRateCalculator() {
    const [income, setIncome] = useState(1200000); // Target Annual Income
    const [expenses, setExpenses] = useState(200000); // Annual Overhead
    const [billableHours, setBillableHours] = useState(1000); // ~20 hours/week * 50 weeks
    const [profitMargin, setProfitMargin] = useState(20); // 20% Markup

    const [rate, setRate] = useState<any>(null);

    useEffect(() => {
        const totalTarget = income + expenses;
        const totalWithMargin = totalTarget * (1 + profitMargin / 100);
        const hourlyRate = totalWithMargin / billableHours;

        setRate({
            hourly: hourlyRate,
            daily: hourlyRate * 8, // Assuming 8h day
            weekly: hourlyRate * 40,
            monthly: totalWithMargin / 12
        });
    }, [income, expenses, billableHours, profitMargin]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <Clock className="w-8 h-8 text-purple-600" />
                        Freelance Rate Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Determine your ideal hourly rate based on financial goals and billable time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* INPUTS */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Annual Income (₹)</label>
                            <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                            <p className="text-xs text-gray-400 mt-1">How much do you want to take home?</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Expenses (Overhead) (₹)</label>
                            <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                            <p className="text-xs text-gray-400 mt-1">Software, hardware, internet, insurance, etc.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Billable Hours per Year</label>
                            <input type="number" value={billableHours} onChange={e => setBillableHours(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                            <p className="text-xs text-gray-400 mt-1">Example: 20 hrs/week x 50 weeks = 1000 hrs.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin (%)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={profitMargin}
                                    onChange={e => setProfitMargin(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <span className="font-bold text-gray-900 w-12 text-right">{profitMargin}%</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Buffer for growth and rainy days.</p>
                        </div>
                    </div>

                    {/* RESULTS */}
                    <div className="space-y-6">
                        <div className="bg-purple-600 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center h-48">
                            <h2 className="text-purple-100 uppercase tracking-widest text-sm font-semibold mb-2">Minimum Hourly Rate</h2>
                            <div className="text-5xl font-black">₹{Math.ceil(rate?.hourly || 0).toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="text-gray-500 text-xs uppercase mb-1">Daily Rate (8h)</div>
                                <div className="font-bold text-gray-900 text-lg">₹{Math.ceil(rate?.daily || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="text-gray-500 text-xs uppercase mb-1">Weekly Rate (40h)</div>
                                <div className="font-bold text-gray-900 text-lg">₹{Math.ceil(rate?.weekly || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <h4 className="font-bold text-purple-900 text-sm mb-2">Why this rate?</h4>
                            <p className="text-sm text-purple-800 leading-relaxed">
                                To earn <span className="font-bold">₹{income.toLocaleString()}</span> and cover <span className="font-bold">₹{expenses.toLocaleString()}</span> expenses,
                                your business needs to generate <span className="font-bold">₹{((income + expenses) * (1 + profitMargin / 100)).toLocaleString()}</span> total revenue
                                across {billableHours} hours.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
