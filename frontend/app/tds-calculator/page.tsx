'use client';

import { useState, useEffect } from 'react';
import { Landmark, Info } from 'lucide-react';

const TDS_SECTIONS = [
    { code: '194C', name: 'Payments to Contractors (Ind/HUF)', rate: 1, limit: 30000 },
    { code: '194C_OTHER', name: 'Payments to Contractors (Other)', rate: 2, limit: 30000 },
    { code: '194J', name: 'Professional Fees / Technical Services', rate: 10, limit: 30000 },
    { code: '194J_TECH', name: 'Fees for Technical Services / Royalty', rate: 2, limit: 30000 },
    { code: '194H', name: 'Commission & Brokerage', rate: 5, limit: 15000 },
    { code: '194I_LAND', name: 'Rent (Land & Building)', rate: 10, limit: 240000 },
    { code: '194I_PLANT', name: 'Rent (Plant & Machinery)', rate: 2, limit: 240000 },
    { code: '192', name: 'Salary (Average Rate)', rate: 0, manualRate: true, limit: 250000 },
];

export default function TDSCalculator() {
    const [amount, setAmount] = useState<number>(0);
    const [section, setSection] = useState(TDS_SECTIONS[2].code); // Default 194J
    const [panAvailable, setPanAvailable] = useState(true);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        calculate();
    }, [amount, section, panAvailable]);

    const calculate = () => {
        if (!amount) {
            setResult(null);
            return;
        }

        const selectedSection = TDS_SECTIONS.find(s => s.code === section);
        if (!selectedSection) return;

        let effectiveRate = selectedSection.rate;
        if (!panAvailable) {
            effectiveRate = 20; // NO PAN = 20%
        }

        const tdsAmount = (amount * effectiveRate) / 100;
        const netPayable = amount - tdsAmount;

        setResult({
            section: selectedSection,
            effectiveRate,
            tdsAmount,
            netPayable,
            isBelowLimit: amount < selectedSection.limit
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <Landmark className="w-8 h-8 text-teal-600" />
                        TDS Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Calculate Tax Deducted at Source for various payment sections.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nature of Payment (Section)</label>
                            <select
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm text-gray-900"
                            >
                                {TDS_SECTIONS.map((s) => (
                                    <option key={s.code} value={s.code}>
                                        Section {s.code.replace('_OTHER', '').replace('_TECH', '').replace('_LAND', '').replace('_PLANT', '')} - {s.name} ({s.rate || 'Slab'}%)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-lg">₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="block w-full rounded-lg border-gray-300 pl-8 py-3 text-lg focus:border-teal-500 focus:ring-teal-500 font-bold text-gray-900"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            <input
                                type="checkbox"
                                id="pan"
                                checked={panAvailable}
                                onChange={(e) => setPanAvailable(e.target.checked)}
                                className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label htmlFor="pan" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                                Deductee has provided valid PAN?
                            </label>
                        </div>
                        {!panAvailable && (
                            <div className="text-xs text-red-600 flex items-center gap-1">
                                <Info className="w-3 h-3" /> TDS rate is 20% if PAN is not available.
                            </div>
                        )}

                        {result && (
                            <div className={`mt-8 rounded-xl p-6 space-y-4 border ${result.isBelowLimit ? 'bg-yellow-50 border-yellow-200' : 'bg-teal-50 border-teal-200'}`}>
                                {result.isBelowLimit ? (
                                    <div className="text-yellow-800 flex gap-2">
                                        <Info className="w-5 h-5 shrink-0" />
                                        <div>
                                            <p className="font-bold">No TDS Required</p>
                                            <p className="text-sm mt-1">Amount is below the threshold limit of ₹{result.section.limit.toLocaleString()}.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>TDS Rate Applied</span>
                                            <span className="text-lg font-semibold text-gray-900">{result.effectiveRate}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>TDS Amount to Deduct</span>
                                            <span className="text-xl font-bold text-red-600">- ₹{result.tdsAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-teal-200/50"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-gray-900">Net Payable to Party</span>
                                            <span className="text-2xl font-bold text-teal-700">₹{result.netPayable.toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-xs text-gray-500 text-center max-w-lg mx-auto leading-relaxed">
                    Disclaimer: This calculator is updated as per FY 2024-25 rules. However, improved limits or specific exemptions might apply. Always consult a tax professional.
                </div>
            </div>
        </div>
    );
}
