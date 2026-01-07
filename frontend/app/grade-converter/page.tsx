'use client';

import { useState, useEffect } from 'react';
import { Calculator, Award, ArrowRight, BookOpen, Info } from 'lucide-react';

type GradeScale = 'US_4_0' | 'INDIA_10_0';

interface GradeResult {
    letter: string;
    gpa: string;
    description: string;
    color: string;
}

export default function GradeConverterPage() {
    const [inputScore, setInputScore] = useState<string>('');
    const [scale, setScale] = useState<GradeScale>('US_4_0');
    const [result, setResult] = useState<GradeResult | null>(null);

    useEffect(() => {
        calculateGrade();
    }, [inputScore, scale]);

    const calculateGrade = () => {
        const score = parseFloat(inputScore);
        if (isNaN(score) || inputScore === '') {
            setResult(null);
            return;
        }

        if (scale === 'US_4_0') {
            // Standard US College 4.0 Scale (based on Percentage input)
            if (score >= 93) setResult({ letter: 'A', gpa: '4.0', description: 'Excellent', color: 'text-green-600 bg-green-50' });
            else if (score >= 90) setResult({ letter: 'A-', gpa: '3.7', description: 'Very Good', color: 'text-green-600 bg-green-50' });
            else if (score >= 87) setResult({ letter: 'B+', gpa: '3.3', description: 'Good', color: 'text-blue-600 bg-blue-50' });
            else if (score >= 83) setResult({ letter: 'B', gpa: '3.0', description: 'Above Average', color: 'text-blue-600 bg-blue-50' });
            else if (score >= 80) setResult({ letter: 'B-', gpa: '2.7', description: 'Average', color: 'text-blue-600 bg-blue-50' });
            else if (score >= 77) setResult({ letter: 'C+', gpa: '2.3', description: 'Below Average', color: 'text-yellow-600 bg-yellow-50' });
            else if (score >= 73) setResult({ letter: 'C', gpa: '2.0', description: 'Satisfactory', color: 'text-yellow-600 bg-yellow-50' });
            else if (score >= 70) setResult({ letter: 'C-', gpa: '1.7', description: 'Passing', color: 'text-orange-600 bg-orange-50' });
            else if (score >= 67) setResult({ letter: 'D+', gpa: '1.3', description: 'Poor', color: 'text-red-600 bg-red-50' });
            else if (score >= 60) setResult({ letter: 'D', gpa: '1.0', description: 'Very Poor', color: 'text-red-600 bg-red-50' });
            else setResult({ letter: 'F', gpa: '0.0', description: 'Failed', color: 'text-red-800 bg-red-100' });
        } else if (scale === 'INDIA_10_0') {
            // Standard Indian University 10-point Scale (UGC Recommended)
            if (score >= 90) setResult({ letter: 'O', gpa: '10.0', description: 'Outstanding', color: 'text-green-700 bg-green-100' });
            else if (score >= 80) setResult({ letter: 'A+', gpa: '9.0', description: 'Excellent', color: 'text-green-600 bg-green-50' });
            else if (score >= 70) setResult({ letter: 'A', gpa: '8.0', description: 'Very Good', color: 'text-blue-600 bg-blue-50' });
            else if (score >= 60) setResult({ letter: 'B+', gpa: '7.0', description: 'Good', color: 'text-yellow-600 bg-yellow-50' });
            else if (score >= 55) setResult({ letter: 'B', gpa: '6.0', description: 'Above Average', color: 'text-orange-600 bg-orange-50' });
            else if (score >= 50) setResult({ letter: 'C', gpa: '5.5', description: 'Average', color: 'text-orange-600 bg-orange-50' });
            else if (score >= 45) setResult({ letter: 'P', gpa: '5.0', description: 'Pass', color: 'text-orange-700 bg-orange-100' });
            else setResult({ letter: 'F', gpa: '0.0', description: 'Fail', color: 'text-red-800 bg-red-100' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4 text-indigo-600">
                        <Award className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Grade Converter</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Convert percentages to Letter Grades and GPA instantly. Supports standard 4.0 scale.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="grid md:grid-cols-2">

                        {/* Input Section */}
                        <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Grading Scale</label>
                                    <select
                                        value={scale}
                                        onChange={(e) => setScale(e.target.value as GradeScale)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                    >
                                        <option value="US_4_0">US College (4.0 Scale)</option>
                                        <option value="INDIA_10_0">Indian University (10.0 Scale)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                                        <Info className="w-3 h-3 mr-1" />
                                        {scale === 'US_4_0' ? 'Standard 4.0 scale used by US universities' : 'Standard 10-point CGPA used by Indian universities'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Score / Percentage</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={inputScore}
                                            onChange={(e) => setInputScore(e.target.value)}
                                            placeholder="e.g. 85"
                                            className="w-full pl-4 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Output Section */}
                        <div className="p-8 flex flex-col justify-center items-center text-center min-h-[300px]">
                            {result ? (
                                <div className="w-full animate-in fade-in zoom-in duration-300">
                                    <h3 className="text-gray-500 font-medium uppercase tracking-wider mb-6">Calculated Grade</h3>

                                    <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ring-8 ring-opacity-20 ${result.color.replace('text-', 'ring-')}`}>
                                        <span className={`text-6xl font-black ${result.color.split(' ')[0]}`}>{result.letter}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">{scale === 'INDIA_10_0' ? 'CGPA Points' : 'GPA'}</p>
                                            <p className="text-2xl font-bold text-gray-900">{result.gpa}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Status</p>
                                            <p className="text-xl font-bold text-gray-900">{result.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="font-medium">Enter your score to see the result</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reference Table */}
                <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                        Grade Reference Table (4.0 Scale)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Letter Grade</th>
                                    <th className="px-6 py-3">Percentage Range</th>
                                    <th className="px-6 py-3">{scale === 'INDIA_10_0' ? 'CGPA Points' : 'GPA Point'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {scale === 'US_4_0' ? (
                                    <>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">A</td><td className="px-6 py-3">93% - 100%</td><td className="px-6 py-3">4.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">A-</td><td className="px-6 py-3">90% - 92%</td><td className="px-6 py-3">3.7</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">B+</td><td className="px-6 py-3">87% - 89%</td><td className="px-6 py-3">3.3</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">B</td><td className="px-6 py-3">83% - 86%</td><td className="px-6 py-3">3.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">B-</td><td className="px-6 py-3">80% - 82%</td><td className="px-6 py-3">2.7</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">C+</td><td className="px-6 py-3">77% - 79%</td><td className="px-6 py-3">2.3</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">C</td><td className="px-6 py-3">73% - 76%</td><td className="px-6 py-3">2.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">C-</td><td className="px-6 py-3">70% - 72%</td><td className="px-6 py-3">1.7</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">D+</td><td className="px-6 py-3">67% - 69%</td><td className="px-6 py-3">1.3</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">D</td><td className="px-6 py-3">60% - 66%</td><td className="px-6 py-3">1.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-red-600">F</td><td className="px-6 py-3">0% - 59%</td><td className="px-6 py-3">0.0</td></tr>
                                    </>
                                ) : (
                                    <>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">O (Outstanding)</td><td className="px-6 py-3">90% - 100%</td><td className="px-6 py-3">10.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">A+ (Excellent)</td><td className="px-6 py-3">80% - 89%</td><td className="px-6 py-3">9.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">A (Very Good)</td><td className="px-6 py-3">70% - 79%</td><td className="px-6 py-3">8.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">B+ (Good)</td><td className="px-6 py-3">60% - 69%</td><td className="px-6 py-3">7.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">B (Above Avg)</td><td className="px-6 py-3">55% - 59%</td><td className="px-6 py-3">6.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">C (Average)</td><td className="px-6 py-3">50% - 54%</td><td className="px-6 py-3">5.5</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-gray-900">P (Pass)</td><td className="px-6 py-3">45% - 49%</td><td className="px-6 py-3">5.0</td></tr>
                                        <tr className="bg-white hover:bg-gray-50"><td className="px-6 py-3 font-bold text-red-600">F (Fail)</td><td className="px-6 py-3">0% - 44%</td><td className="px-6 py-3">0.0</td></tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
