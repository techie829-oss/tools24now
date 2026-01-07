'use client';

import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

export default function BreakEvenCalculator() {
    const [fixedCosts, setFixedCosts] = useState(50000);
    const [pricePerUnit, setPricePerUnit] = useState(100);
    const [variableCostPerUnit, setVariableCostPerUnit] = useState(40);

    const [breakEven, setBreakEven] = useState<any>(null);

    useEffect(() => {
        calculate();
    }, [fixedCosts, pricePerUnit, variableCostPerUnit]);

    const calculate = () => {
        const contributionMargin = pricePerUnit - variableCostPerUnit;
        if (contributionMargin <= 0) {
            setBreakEven(null); // Loss per unit, never breaks even
            return;
        }

        const units = fixedCosts / contributionMargin;
        const revenue = units * pricePerUnit;

        setBreakEven({
            units: Math.ceil(units),
            revenue,
            contributionMargin,
            marginRatio: (contributionMargin / pricePerUnit) * 100
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <Target className="w-8 h-8 text-rose-600" />
                        Break-Even Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Find out how many units you need to sell to cover your costs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* INPUTS */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Fixed Costs (Monthly)</label>
                            <input type="number" value={fixedCosts} onChange={e => setFixedCosts(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" placeholder="Rent, Salaries, Insurance..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price per Unit</label>
                            <input type="number" value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variable Cost per Unit</label>
                            <input type="number" value={variableCostPerUnit} onChange={e => setVariableCostPerUnit(Number(e.target.value))} className="w-full rounded-lg border-gray-300 py-2.5 text-gray-900" placeholder="Materials, Packaging..." />
                        </div>

                        {pricePerUnit <= variableCostPerUnit && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                                Warning: You are selling at a loss per unit. You will never break even!
                            </div>
                        )}
                    </div>

                    {/* RESULTS */}
                    <div className="space-y-6">
                        {breakEven ? (
                            <>
                                <div className="bg-rose-600 text-white p-8 rounded-2xl shadow-xl text-center">
                                    <h2 className="text-rose-100 uppercase tracking-widest text-sm font-semibold mb-2">Break-Even Point (Units)</h2>
                                    <div className="text-6xl font-black">{breakEven.units.toLocaleString()}</div>
                                    <div className="mt-2 text-rose-200">Units to sell</div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Financial Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Break-Even Revenue</span>
                                            <span className="font-bold">₹{breakEven.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Contribution Margin / Unit</span>
                                            <span className="font-bold text-green-600">+₹{breakEven.contributionMargin}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Margin Ratio</span>
                                            <span className="font-bold">{breakEven.marginRatio.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-2xl p-8 text-center italic">
                                Enter valid costs and prices to see the break-even point.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
