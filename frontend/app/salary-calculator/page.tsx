'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, PieChart } from 'lucide-react';

export default function SalaryCalculator() {
    const [ctc, setCtc] = useState<number>(1200000); // 12 LPA default
    const [breakdown, setBreakdown] = useState<any>(null);

    useEffect(() => {
        calculate(ctc);
    }, [ctc]);

    const calculate = (annualCtc: number) => {
        if (!annualCtc) return;

        // Standard Indian Salary Structure Estimation
        // Basic: ~40-50% of CTC
        // HRA: ~40-50% of Basic
        // Special Allowance: Balancing figure
        // PF: 12% of Basic (Employee Contribution)
        // Professional Tax: ~200/month (varies)

        const monthlyCtc = annualCtc / 12;
        const basic = monthlyCtc * 0.40;
        const hra = basic * 0.40; // Metro assumption
        const pf = Math.min(basic * 0.12, 1800); // Capped usually at 1800 for higher salaries or 12%
        // Let's assume standard 12% of Basic for simplicity
        const pfActual = basic * 0.12;

        const profTax = 200;

        const standardDeduction = 50000; // Annual Flat

        // Tax Calculation (New Regime 2024-25 Estimates)
        // 0-3L: Nil
        // 3-7L: 5% (Rebate u/s 87A up to 7L, effectively nil)
        // 7-10L: 10%
        // 10-12L: 15%
        // 12-15L: 20%
        // >15L: 30%

        // Let's do a simplified tax estimation
        let taxableIncome = annualCtc - standardDeduction;
        let tax = 0;

        if (taxableIncome > 300000) {
            // Simplified Slab Logic for New Regime
            if (taxableIncome <= 700000) {
                tax = 0; // Rebate
            } else {
                if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 300000) * 0.05; // 3-6L
                if (taxableIncome > 600000) tax += Math.min(taxableIncome - 600000, 300000) * 0.10; // 6-9L
                if (taxableIncome > 900000) tax += Math.min(taxableIncome - 900000, 300000) * 0.15; // 9-12L
                if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20; // 12-15L
                if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30; // >15L
            }
        }

        const cess = tax * 0.04;
        const annualTax = tax + cess;
        const monthlyTax = annualTax / 12;

        const specialAllowance = monthlyCtc - basic - hra - pfActual; // Employer contribution also usually part of CTC, but for in-hand calc let's simulate Gross.

        // Gross Salary (Monthly)
        const gross = basic + hra + specialAllowance;

        // Deductions
        const totalDeductions = pfActual + profTax + monthlyTax;

        // In Hand
        const inHand = gross - totalDeductions;

        setBreakdown({
            basic,
            hra,
            specialAllowance,
            pf: pfActual,
            profTax,
            tax: monthlyTax,
            gross,
            inHand,
            annualInHand: inHand * 12
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <IndianRupee className="w-8 h-8 text-green-600" />
                        In-Hand Salary Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Estimate your monthly take-home salary from Annual CTC (India).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* INPUT */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Annual CTC (₹)</label>
                            <input
                                type="number"
                                value={ctc || ''}
                                onChange={(e) => setCtc(Number(e.target.value))}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-lg font-bold text-gray-900"
                                placeholder="e.g. 1200000"
                            />
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => setCtc(500000)} className="px-3 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200">5 LPA</button>
                                <button onClick={() => setCtc(1000000)} className="px-3 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200">10 LPA</button>
                                <button onClick={() => setCtc(2000000)} className="px-3 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200">20 LPA</button>
                            </div>
                        </div>

                        {breakdown && (
                            <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg text-center">
                                <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">Monthly In-Hand</h3>
                                <div className="text-4xl font-bold">₹{Math.round(breakdown.inHand).toLocaleString()}</div>
                                <div className="mt-4 pt-4 border-t border-green-500/50 flex justify-between text-xs opacity-90">
                                    <span>Annual In-Hand</span>
                                    <span className="font-bold">₹{Math.round(breakdown.annualInHand).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BREAKDOWN */}
                    <div className="md:col-span-7">
                        {breakdown && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900">Monthly Breakdown (Estimated)</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {/* Earnings */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Basic Salary</span>
                                            <span className="font-medium">₹{Math.round(breakdown.basic).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">HRA</span>
                                            <span className="font-medium">₹{Math.round(breakdown.hra).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Special / Other Allowances</span>
                                            <span className="font-medium">₹{Math.round(breakdown.specialAllowance).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold text-gray-800 pt-2">
                                            <span>Gross Salary</span>
                                            <span>₹{Math.round(breakdown.gross).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div className="p-4 space-y-3 bg-red-50/30">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">PF Contribution (12%)</span>
                                            <span className="font-medium text-red-600">- ₹{Math.round(breakdown.pf).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Professional Tax</span>
                                            <span className="font-medium text-red-600">- ₹{breakdown.profTax}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Income Tax (TDS Est.)</span>
                                            <span className="font-medium text-red-600">- ₹{Math.round(breakdown.tax).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-4 text-center">
                            Note: This tool uses the New Tax Regime slabs (FY 24-25). Actual in-hand can vary based on deductions, declarations, and regime selection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
