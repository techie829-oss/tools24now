'use client';

import React, { useState, useEffect } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ArrowRight, Clock, CalendarDays, Timer } from 'lucide-react';

export default function TimeDifference() {
    // Default to start of today and current time
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Format for datetime-local: YYYY-MM-DDThh:mm
        const formatForInput = (d: Date) => {
            return d.toISOString().slice(0, 16);
        };

        setEndDate(formatForInput(now));
        setStartDate(formatForInput(oneHourAgo));
    }, []);

    const calculateDifference = () => {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        // Ensure proper order for positive diffs
        const validStart = start <= end ? start : end;
        const validEnd = start <= end ? end : start;

        const years = differenceInYears(validEnd, validStart);
        const months = differenceInMonths(validEnd, validStart) % 12;

        // Complex logic to get remaining days after counting months
        // date-fns doesn't have a "difference in days excluding months" direct helper easily
        // So we just approximate for UI or do strict calculation
        // Strict:
        const tempDate = new Date(validStart);
        tempDate.setFullYear(tempDate.getFullYear() + years);
        tempDate.setMonth(tempDate.getMonth() + months);
        const days = differenceInDays(validEnd, tempDate);

        const tempDate2 = new Date(tempDate);
        tempDate2.setDate(tempDate2.getDate() + days);
        const hours = differenceInHours(validEnd, tempDate2);

        const tempDate3 = new Date(tempDate2);
        tempDate3.setHours(tempDate3.getHours() + hours);
        const minutes = differenceInMinutes(validEnd, tempDate3);

        // Totals
        const totalSeconds = differenceInSeconds(validEnd, validStart);
        const totalMinutes = differenceInMinutes(validEnd, validStart);
        const totalHours = differenceInHours(validEnd, validStart);
        const totalDays = differenceInDays(validEnd, validStart);

        return {
            years, months, days, hours, minutes,
            totalSeconds, totalMinutes, totalHours, totalDays,
            isNegative: start > end
        };
    };

    const diff = calculateDifference();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        Time Difference
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Calculate the exact duration between two dates or times.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-10">

                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all font-medium"
                            />
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
                                <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">End Date & Time</label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    {diff && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {diff.isNegative && (
                                <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-xl flex items-center gap-3 border border-amber-200">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">End date is before Start date. Showing difference in reverse.</span>
                                </div>
                            )}

                            {/* Main Precise Diff */}
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center shadow-lg mb-8">
                                <h3 className="text-blue-100 font-semibold uppercase tracking-wider text-sm mb-4">Precise Duration</h3>
                                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                                    {diff.years > 0 && (
                                        <div className="flex flex-col">
                                            <span className="text-4xl md:text-5xl font-bold">{diff.years}</span>
                                            <span className="text-blue-200 text-sm">Years</span>
                                        </div>
                                    )}
                                    {(diff.months > 0 || diff.years > 0) && (
                                        <div className="flex flex-col">
                                            <span className="text-4xl md:text-5xl font-bold">{diff.months}</span>
                                            <span className="text-blue-200 text-sm">Months</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-4xl md:text-5xl font-bold">{diff.days}</span>
                                        <span className="text-blue-200 text-sm">Days</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-4xl md:text-5xl font-bold">{diff.hours}</span>
                                        <span className="text-blue-200 text-sm">Hours</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-4xl md:text-5xl font-bold">{diff.minutes}</span>
                                        <span className="text-blue-200 text-sm">Minutes</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Stats Grid */}
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <Timer className="w-5 h-5 text-gray-400" />
                                Total Duration (Alternative Units)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Days</div>
                                    <div className="text-xl font-bold text-gray-900">{diff.totalDays.toLocaleString()}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Hours</div>
                                    <div className="text-xl font-bold text-gray-900">{diff.totalHours.toLocaleString()}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Minutes</div>
                                    <div className="text-xl font-bold text-gray-900">{diff.totalMinutes.toLocaleString()}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Seconds</div>
                                    <div className="text-xl font-bold text-gray-900">{diff.totalSeconds.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
