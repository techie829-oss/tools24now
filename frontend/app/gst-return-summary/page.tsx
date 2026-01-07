'use client';

import { useState, useEffect } from 'react';
import { Calculator, FileText, Info } from 'lucide-react';

export default function GSTReturnSummary() {
    const [sales, setSales] = useState({
        b2b: 0,
        b2cLarge: 0,
        b2cSmall: 0,
        exports: 0,
        nilRated: 0
    });

    const [purchases, setPurchases] = useState({
        itcAvailable: 0,
        itcReversed: 0,
        ineligibleItc: 0
    });

    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        const totalTaxable = sales.b2b + sales.b2cLarge + sales.b2cSmall + sales.exports;
        // Assuming average 18% tax for estimation if details not granular
        // In a real tool, we'd ask for tax breakdown per category. 
        // For this summary tool, we'll keep it simple or user enters Taxable Value and we estimate Liability? 
        // Better: User enters Taxable Value, we estimate Output Tax (let's say 18% default for simplicity or ask for tax).
        // Let's refine: User enters "Taxable Value" and "Tax Amount" for each if possible, or just simplistic 18%.
        // Let's go with simplistic 18% assumption for the "Quick Summary" nature of this tool, or allow rate selection globally.

        const taxRate = 0.18;
        const outputTax = totalTaxable * taxRate;

        const itc = purchases.itcAvailable - purchases.itcReversed;
        const taxPayable = Math.max(0, outputTax - itc);

        setSummary({
            gstr1: {
                totalTaxable,
                projectedTax: outputTax
            },
            gstr3b: {
                outwardTaxable: totalTaxable,
                outputTax,
                itcAvailable: purchases.itcAvailable,
                itcReversed: purchases.itcReversed,
                netITC: itc,
                taxPayableCash: taxPayable
            }
        });
    }, [sales, purchases]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        GST Return Summary Calculator
                    </h1>
                    <p className="mt-2 text-gray-600">Quickly estimate your GSTR-1 and GSTR-3B figures based on monthly sales and purchases.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                                Outward Supplies (Sales)
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">B2B Taxable Value</label>
                                    <input type="number" value={sales.b2b || ''} onChange={(e) => setSales({ ...sales, b2b: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">B2C Large (&gt; 2.5L)</label>
                                    <input type="number" value={sales.b2cLarge || ''} onChange={(e) => setSales({ ...sales, b2cLarge: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">B2C Small</label>
                                    <input type="number" value={sales.b2cSmall || ''} onChange={(e) => setSales({ ...sales, b2cSmall: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Exports (Zero Rated)</label>
                                    <input type="number" value={sales.exports || ''} onChange={(e) => setSales({ ...sales, exports: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">2</span>
                                Inward Supplies (ITC)
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">All other ITC (Available)</label>
                                    <input type="number" value={purchases.itcAvailable || ''} onChange={(e) => setPurchases({ ...purchases, itcAvailable: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Total Tax Amount" />
                                    <p className="text-xs text-gray-500 mt-1">Enter the total tax amount from your purchase bills.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ITC Reversed</label>
                                    <input type="number" value={purchases.itcReversed || ''} onChange={(e) => setPurchases({ ...purchases, itcReversed: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="0.00" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="space-y-6">
                        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5" /> GSTR-1 Projection
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-blue-500 pb-2">
                                    <span className="text-blue-100">Total Taxable Value</span>
                                    <span className="text-xl font-bold">₹{summary?.gstr1.totalTaxable.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-100">Est. Liability (18%)</span>
                                    <span className="text-xl font-bold">₹{summary?.gstr1.projectedTax.toLocaleString()}</span>
                                </div>
                            </div>
                            <p className="text-xs text-blue-200 mt-4 italic">* Assumption: 18% standard rate applied on Sales.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">GSTR-3B Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Output Tax Liability</span>
                                    <span className="font-medium text-gray-900">₹{summary?.gstr3b.outputTax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Less: Eligible ITC</span>
                                    <span className="font-medium">- ₹{summary?.gstr3b.netITC.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900 py-2">Net Tax Payable (Cash)</span>
                                    <span className="text-2xl font-bold text-indigo-600">₹{summary?.gstr3b.taxPayableCash.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-orange-800 text-sm mb-2">Important Note</h4>
                            <p className="text-xs text-orange-700">
                                This is a simplified estimator. Actual GST returns require precise HSN-wise and rate-wise breakdown.
                                Always consult a Chartered Accountant for filing returns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
