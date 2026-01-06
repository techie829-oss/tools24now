'use client';

import { useState, useEffect } from 'react';
import { Calculator, Users, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function AttendanceCalculatorPage() {
    const [totalClasses, setTotalClasses] = useState<string>('');
    const [attendedClasses, setAttendedClasses] = useState<string>('');
    const [targetPercentage, setTargetPercentage] = useState<string>('75');

    const [currentPercentage, setCurrentPercentage] = useState(0);
    const [status, setStatus] = useState<'safe' | 'danger' | 'warning'>('safe');

    // Predictions
    const [classesToAttend, setClassesToAttend] = useState<number | null>(null);
    const [classesCanSkip, setClassesCanSkip] = useState<number | null>(null);

    useEffect(() => {
        calculateResults();
    }, [totalClasses, attendedClasses, targetPercentage]);

    const calculateResults = () => {
        const total = parseInt(totalClasses);
        const attended = parseInt(attendedClasses);
        const target = parseFloat(targetPercentage);

        if (isNaN(total) || isNaN(attended) || total <= 0) {
            setCurrentPercentage(0);
            setClassesToAttend(null);
            setClassesCanSkip(null);
            return;
        }

        // 1. Current Percentage
        const current = (attended / total) * 100;
        setCurrentPercentage(current);

        // Status
        if (current >= target) setStatus('safe');
        else if (current >= target - 10) setStatus('warning');
        else setStatus('danger');

        // 2. Catch up (Classes needed to reach target)
        if (current < target) {
            // Formula: (attended + x) / (total + x) = target / 100
            // 100(attended + x) = target(total + x)
            // 100attended + 100x = targetTotal + targetX
            // 100x - targetX = targetTotal - 100attended
            // x(100 - target) = targetTotal - 100attended
            // x = (targetTotal - 100attended) / (100 - target)

            const numerator = (target * total) - (100 * attended);
            const denominator = 100 - target;

            if (denominator > 0) {
                const needed = Math.ceil(numerator / denominator);
                setClassesToAttend(needed > 0 ? needed : 0);
                setClassesCanSkip(0);
            }
        }
        // 3. Safe to Bunk (Classes can miss)
        else {
            // Formula: attended / (total + x) = target / 100
            // 100attended = target(total + x)
            // 100attended = targetTotal + targetX
            // targetX = 100attended - targetTotal
            // x = (100attended - targetTotal) / target

            const numerator = (100 * attended) - (target * total);
            const denominator = target;

            if (denominator > 0) {
                const skip = Math.floor(numerator / denominator);
                setClassesCanSkip(skip > 0 ? skip : 0);
                setClassesToAttend(0);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4 text-teal-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Attendance Calculator</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Track your attendance percentage and find out how many classes you can skip or need to attend.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Input Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Calculator className="w-5 h-5 mr-2 text-teal-600" />
                            Enter Details
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Classes Held</label>
                                <input
                                    type="number"
                                    value={totalClasses}
                                    onChange={(e) => setTotalClasses(e.target.value)}
                                    placeholder="e.g. 50"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Classes Attended</label>
                                <input
                                    type="number"
                                    value={attendedClasses}
                                    onChange={(e) => setAttendedClasses(e.target.value)}
                                    placeholder="e.g. 40"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Percentage</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetPercentage}
                                        onChange={(e) => setTargetPercentage(e.target.value)}
                                        placeholder="e.g. 75"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-12"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className={`rounded-2xl shadow-sm border p-8 flex flex-col items-center justify-center text-center transition-all duration-300
                ${status === 'safe' ? 'bg-green-50 border-green-200' :
                            status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'}`
                    }>
                        {totalClasses && attendedClasses ? (
                            <div className="w-full animate-in fade-in zoom-in duration-300">
                                <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">
                                    Current Attendance
                                </p>
                                <div className="text-6xl font-black mb-6 flex items-start justify-center">
                                    {currentPercentage.toFixed(2)}
                                    <span className="text-3xl mt-4 opacity-50">%</span>
                                </div>

                                {status === 'safe' && (
                                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-green-200 text-green-800">
                                        <h3 className="font-bold flex items-center justify-center gap-2 mb-1">
                                            <CheckCircle className="w-5 h-5" /> On Track!
                                        </h3>
                                        <p className="text-sm">
                                            You can safely skip <strong>{classesCanSkip}</strong> classes and still maintain {targetPercentage}%.
                                        </p>
                                    </div>
                                )}

                                {status === 'warning' && (
                                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200 text-yellow-800">
                                        <h3 className="font-bold flex items-center justify-center gap-2 mb-1">
                                            <AlertCircle className="w-5 h-5" /> Slight Risk
                                        </h3>
                                        <p className="text-sm">
                                            You need to attend <strong>{classesToAttend}</strong> more classes to reach {targetPercentage}%.
                                        </p>
                                    </div>
                                )}

                                {status === 'danger' && (
                                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-red-200 text-red-800">
                                        <h3 className="font-bold flex items-center justify-center gap-2 mb-1">
                                            <XCircle className="w-5 h-5" /> Critical!
                                        </h3>
                                        <p className="text-sm">
                                            You need to attend <strong>{classesToAttend}</strong> classes consecutively to get back to {targetPercentage}%.
                                        </p>
                                    </div>
                                )}

                                {/* Visual Progress Bar */}
                                <div className="mt-8 w-full bg-white/50 h-3 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${status === 'safe' ? 'bg-green-500' :
                                                status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Enter your attendance details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
