'use client';

import React, { useState, useEffect, useRef } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, differenceInWeeks, differenceInSeconds } from 'date-fns';
import { Cake, Calendar, Clock, Smile, Star, Download, Gift, Award, X, Palette, Check, ChevronRight, Zap, Hourglass } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function AgeCalculator() {
    const [dob, setDob] = useState<string>('');
    const [stats, setStats] = useState<any>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<'surprise' | 'professional' | 'standard'>('standard');

    // We use a single ref for the active card in the editor to capture it
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dob) {
            calculateAge();
        }
    }, [dob]);

    const calculateAge = () => {
        const birthDate = new Date(dob);
        const now = new Date();

        if (isNaN(birthDate.getTime()) || birthDate > now) {
            setStats(null);
            return;
        }

        // Exact Age
        const years = differenceInYears(now, birthDate);
        const months = differenceInMonths(now, birthDate) % 12;

        let tempDate = new Date(birthDate);
        tempDate.setFullYear(tempDate.getFullYear() + years);
        tempDate.setMonth(tempDate.getMonth() + months);
        const days = differenceInDays(now, tempDate);

        // Next Birthday
        let nextBdayCalc = new Date(birthDate);
        nextBdayCalc.setFullYear(now.getFullYear());
        if (nextBdayCalc < now) {
            nextBdayCalc.setFullYear(now.getFullYear() + 1);
        }

        const daysToNextBirthday = differenceInDays(nextBdayCalc, now);
        const monthsToNextBirthday = differenceInMonths(nextBdayCalc, now);

        // Fun Stats
        const totalMonths = differenceInMonths(now, birthDate);
        const totalWeeks = differenceInWeeks(now, birthDate);
        const totalDays = differenceInDays(now, birthDate);
        const totalHours = totalDays * 24;
        const totalMinutes = totalHours * 60;
        const totalSeconds = differenceInSeconds(now, birthDate);

        setStats({
            years, months, days,
            nextBirthday: nextBdayCalc.toDateString(),
            daysToNextBirthday,
            monthsToNextBirthday,
            totalMonths, totalWeeks, totalDays, totalHours, totalMinutes, totalSeconds,
            dobFormatted: birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        });
    };

    const handleDownload = async () => {
        if (!cardRef.current) {
            console.error("Card ref is null");
            return;
        }

        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2, // Higher resolution
                backgroundColor: '#ffffff', // Ensure white background if transparent
                fontEmbedCSS: '' // Skip font embedding to fix "font is undefined" error
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `age-card-${selectedTheme}-${new Date().getTime()}.png`;
            link.click();
        } catch (err) {
            console.error("Card generation failed", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            alert(`Failed to generate card: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
                        Age Calculator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Discover your exact age and fun facts about your time on Earth.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <div className="max-w-md mx-auto">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 text-center">Date of Birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 transition-all text-center text-lg font-medium"
                        />
                    </div>
                </div>

                {stats && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Main Age Card */}
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Cake className="w-40 h-40 transform rotate-12" />
                            </div>

                            <div className="relative z-10 text-center">
                                <h3 className="text-pink-100 font-semibold uppercase tracking-wider text-sm mb-6">Your Exact Age</h3>
                                <div className="flex flex-wrap justify-center items-end gap-x-2 md:gap-x-6 gap-y-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-6xl md:text-7xl font-extrabold leading-none">{stats.years}</span>
                                        <span className="text-pink-200 font-medium">Years</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl md:text-5xl font-bold opacity-90">{stats.months}</span>
                                        <span className="text-pink-200 font-medium">Months</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl md:text-5xl font-bold opacity-90">{stats.days}</span>
                                        <span className="text-pink-200 font-medium">Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Design Card CTA */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setIsEditorOpen(true)}
                                className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-3">
                                    <Palette className="w-5 h-5" />
                                    <span>Design Birthday Card</span>
                                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>

                        {/* Stats Grid & Other Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-pink-100 text-pink-500 rounded-lg"><Cake className="w-6 h-6" /></div>
                                    <h3 className="font-bold text-gray-900">Next Birthday</h3>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">{stats.nextBirthday}</div>
                                        <div className="text-2xl font-bold text-gray-900">{stats.daysToNextBirthday} Days</div>
                                    </div>
                                </div>
                                <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.max(5, ((365 - stats.daysToNextBirthday) / 365) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 text-purple-500 rounded-lg"><Star className="w-6 h-6" /></div>
                                    <h3 className="font-bold text-gray-900">Summary</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    You are <span className="font-bold text-gray-900">{stats.years} years old</span>.
                                    Your next birthday is in <span className="font-bold text-gray-900">{stats.monthsToNextBirthday} months</span>.
                                </p>
                            </div>
                        </div>

                        {/* Fun Stats Grid - UPDATED */}
                        <div>
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <Smile className="w-5 h-5 text-gray-400" />
                                Life Stats
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatBox label="Total Months" value={stats.totalMonths.toLocaleString()} />
                                <StatBox label="Total Weeks" value={stats.totalWeeks.toLocaleString()} />
                                <StatBox label="Total Days" value={stats.totalDays.toLocaleString()} />
                                <StatBox label="Total Hours" value={stats.totalHours?.toLocaleString() ?? '-'} />
                                <StatBox label="Total Minutes" value={stats.totalMinutes?.toLocaleString() ?? '-'} />
                                <StatBox label="Total Seconds" value={stats.totalSeconds?.toLocaleString() ?? '-'} />
                            </div>
                        </div>

                    </div>
                )}

                {/* Card Editor Modal */}
                {isEditorOpen && stats && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                            {/* Controls Sidebar */}
                            <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-xl text-gray-900">Card Editor</h3>
                                    <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors md:hidden">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Select Theme</label>
                                        <div className="grid grid-cols-1 gap-3">

                                            {/* Standard Theme */}
                                            <button
                                                onClick={() => setSelectedTheme('standard')}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selectedTheme === 'standard'
                                                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                                                    : 'border-white bg-white hover:border-gray-200 text-gray-700 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${selectedTheme === 'standard' ? 'bg-pink-200' : 'bg-gray-100'}`}>
                                                    <Star className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Standard</div>
                                                    <div className="text-xs opacity-70">Clean Gradient</div>
                                                </div>
                                                {selectedTheme === 'standard' && <Check className="w-5 h-5 ml-auto" />}
                                            </button>

                                            {/* Surprise Theme */}
                                            <button
                                                onClick={() => setSelectedTheme('surprise')}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selectedTheme === 'surprise'
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-white bg-white hover:border-gray-200 text-gray-700 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${selectedTheme === 'surprise' ? 'bg-purple-200' : 'bg-gray-100'}`}>
                                                    <Gift className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Surprise</div>
                                                    <div className="text-xs opacity-70">Birthday Fun</div>
                                                </div>
                                                {selectedTheme === 'surprise' && <Check className="w-5 h-5 ml-auto" />}
                                            </button>

                                            {/* Professional Theme */}
                                            <button
                                                onClick={() => setSelectedTheme('professional')}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selectedTheme === 'professional'
                                                    ? 'border-slate-800 bg-slate-50 text-slate-800'
                                                    : 'border-white bg-white hover:border-gray-200 text-gray-700 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${selectedTheme === 'professional' ? 'bg-slate-200' : 'bg-gray-100'}`}>
                                                    <Award className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Professional</div>
                                                    <div className="text-xs opacity-70">Milestone Report</div>
                                                </div>
                                                {selectedTheme === 'professional' && <Check className="w-5 h-5 ml-auto" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleDownload}
                                        className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Image
                                    </button>
                                </div>
                            </div>

                            {/* Preview Area */}
                            <div className="flex-1 bg-gray-200/50 p-4 md:p-10 flex flex-col relative overflow-hidden">
                                <button onClick={() => setIsEditorOpen(false)} className="absolute top-6 right-6 p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm transition-colors hidden md:block z-10">
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex-1 flex items-center justify-center overflow-auto min-h-[400px]">
                                    {/* The Capture Wrapper */}
                                    <div
                                        className="shadow-2xl transition-all duration-300 hover:shadow-3xl"
                                        style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}
                                    >
                                        <div ref={cardRef}>
                                            {selectedTheme === 'standard' && (
                                                /* STANDARD THEME */
                                                <div className="w-[800px] h-[500px] bg-gradient-to-br from-pink-500 to-rose-500 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden text-white">
                                                    <div className="absolute top-0 right-0 p-12 opacity-10">
                                                        <Cake className="w-64 h-64 transform rotate-12" />
                                                    </div>

                                                    <div className="relative z-10">
                                                        <h3 className="text-pink-100 font-semibold uppercase tracking-wider text-2xl mb-12">Your Exact Age</h3>
                                                        <div className="flex flex-wrap justify-center items-end gap-12">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-9xl font-extrabold leading-none">{stats.years}</span>
                                                                <span className="text-pink-200 text-2xl font-medium mt-2">Years</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-7xl font-bold opacity-90">{stats.months}</span>
                                                                <span className="text-pink-200 text-2xl font-medium mt-2">Months</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-7xl font-bold opacity-90">{stats.days}</span>
                                                                <span className="text-pink-200 text-2xl font-medium mt-2">Days</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="absolute bottom-8 left-0 w-full text-center">
                                                        <div className="text-pink-200 opacity-60 text-sm">Generated by Tools24Now</div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedTheme === 'surprise' && (
                                                /* SURPRISE THEME */
                                                <div className="w-[800px] h-[500px] bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-[12px] border-white">
                                                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"></div>
                                                    <div className="absolute top-6 right-6 text-pink-300 opacity-50"><Cake size={120} /></div>
                                                    <div className="absolute bottom-6 left-6 text-yellow-300 opacity-50"><Star size={100} /></div>

                                                    <h2 className="text-5xl font-extrabold text-pink-600 mb-4 drop-shadow-sm">Happy Birthday!</h2>
                                                    <p className="text-xl text-gray-500 italic mb-8">Sending you smiles for every moment of your special day.</p>

                                                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-pink-100 mb-8 w-full max-w-lg transform rotate-[-2deg]">
                                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">You are exactly</div>
                                                        <div className="text-6xl font-black text-gray-800 mb-2 leading-none">
                                                            {stats.years} <span className="text-3xl text-pink-500 font-bold">Years</span>
                                                        </div>
                                                        <div className="flex justify-center gap-4 text-gray-600 font-medium text-lg">
                                                            <span>{stats.months} Months</span>
                                                            <span className="text-pink-300">•</span>
                                                            <span>{stats.days} Days</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-lg font-medium text-gray-500">
                                                        Born on <span className="text-pink-600 font-bold">{stats.dobFormatted}</span>
                                                    </div>

                                                    <div className="absolute bottom-4 right-4 text-sm font-medium text-gray-300">Generated by Tools24Now</div>
                                                </div>
                                            )}

                                            {selectedTheme === 'professional' && (
                                                /* PROFESSIONAL THEME */
                                                <div className="w-[800px] h-[500px] bg-white p-12 flex flex-col justify-between relative overflow-hidden border-[1px] border-slate-200">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-bl-[100%] opacity-50"></div>
                                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-tr-[100%] opacity-50"></div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
                                                            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                                <Calendar size={28} />
                                                            </div>
                                                            <div>
                                                                <div className="text-2xl font-bold text-slate-900">Age Milestone Report</div>
                                                                <div className="text-slate-500 text-sm">Personal Chronological Analysis</div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-12">
                                                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Age</div>
                                                                <div className="text-7xl font-bold text-slate-900 mb-2">{stats.years}</div>
                                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                                    <span className="bg-slate-200 px-2 py-1 rounded text-sm">{stats.months}m</span>
                                                                    <span className="bg-slate-200 px-2 py-1 rounded text-sm">{stats.days}d</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col justify-center">
                                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Life Statistics</div>
                                                                <ul className="space-y-3 text-sm text-slate-700">
                                                                    <li className="flex justify-between items-center border-b border-slate-100 pb-1">
                                                                        <span>Total Days</span>
                                                                        <span className="font-bold font-mono">{stats.totalDays.toLocaleString()}</span>
                                                                    </li>
                                                                    <li className="flex justify-between items-center border-b border-slate-100 pb-1">
                                                                        <span>Total Hours</span>
                                                                        <span className="font-bold font-mono">{stats.totalHours?.toLocaleString() ?? '-'}</span>
                                                                    </li>
                                                                    <li className="flex justify-between items-center border-b border-slate-100 pb-1">
                                                                        <span>Total Minutes</span>
                                                                        <span className="font-bold font-mono">{stats.totalMinutes?.toLocaleString() ?? '-'}</span>
                                                                    </li>
                                                                    <li className="flex justify-between items-center pb-1">
                                                                        <span>Total Seconds</span>
                                                                        <span className="font-bold font-mono">{stats.totalSeconds?.toLocaleString() ?? '-'}</span>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-slate-200 pt-8 flex justify-between items-end relative z-10">
                                                        <div>
                                                            <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Date of Birth</div>
                                                            <div className="text-xl font-bold text-slate-800">{stats.dobFormatted}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-slate-400 mb-1">Generated on {new Date().toLocaleDateString()}</div>
                                                            <div className="text-md font-bold text-slate-900 flex items-center gap-1 justify-end">
                                                                <Award size={16} /> Tools24Now
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center text-xs text-gray-400 mt-4">
                                    Preview is scaled to fit. Downloaded image will be high resolution (800x500px).
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</div>
            <div className="text-xl font-bold text-gray-900 tabular-nums break-words">{value}</div>
        </div>
    );
}
