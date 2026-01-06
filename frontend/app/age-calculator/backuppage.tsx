'use client';

import React, { useState, useEffect, useRef } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, differenceInWeeks, differenceInSeconds } from 'date-fns';
import { Cake, Calendar, Clock, Smile, Star, Download, Upload, Palette, User, Briefcase, FileText, Globe } from 'lucide-react';

export default function AgeCalculator() {
    const [dob, setDob] = useState<string>('');
    const [stats, setStats] = useState<any>(null);

    // Customization State
    const [photo, setPhoto] = useState<string | null>(null);
    const [accentColor, setAccentColor] = useState<string>('#ec4899'); // Default pink-500
    const [cardMode, setCardMode] = useState<'normal' | 'surprise' | 'professional'>('normal');
    const [badgeText, setBadgeText] = useState<string>("It's Me!");

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

        setStats({
            years, months, days,
            nextBirthday: nextBdayCalc.toDateString(),
            daysToNextBirthday,
            monthsToNextBirthday,
            totalMonths, totalWeeks, totalDays, totalHours, totalMinutes
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Please select an image under 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, // High quality
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `BirthdayCard_${stats.years}Years.png`;
            link.click();
        } catch (error) {
            console.error("Failed to generate card", error);
            alert("Could not generate card. Please try again.");
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
                        Discover your exact age and create a personalized birthday card!
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <div className={`grid grid-cols-1 ${stats ? 'md:grid-cols-2' : ''} gap-8 transition-all duration-500`}>
                        <div className={stats ? '' : 'max-w-md mx-auto w-full'}>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">My Birth Date</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 transition-all text-lg font-medium"
                            />
                        </div>

                        {/* Customization Controls - Only show after birthdate selected */}
                        {stats && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <Upload className="w-4 h-4" /> Add Photo (Optional)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                                            <span className="text-sm font-medium">Choose Image</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                        </label>
                                        {photo && (
                                            <button onClick={() => setPhoto(null)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded">Remove</button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <Palette className="w-4 h-4" /> Card Color
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#111827'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setAccentColor(color)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${accentColor === color ? 'border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-200' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors">
                                            <input
                                                type="color"
                                                value={accentColor}
                                                onChange={(e) => setAccentColor(e.target.value)}
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Badge Text</label>
                                    <input
                                        type="text"
                                        value={badgeText}
                                        onChange={(e) => setBadgeText(e.target.value)}
                                        maxLength={20}
                                        placeholder="e.g. It's Me!"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {stats && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Download Controls */}
                        <div className="flex flex-col xl:flex-row justify-center gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex overflow-x-auto max-w-full bg-gray-100 p-1 rounded-full scrollbar-hide">
                                <button
                                    onClick={() => setCardMode('normal')}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${cardMode === 'normal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <FileText className="w-4 h-4" /> Normal
                                </button>
                                <button
                                    onClick={() => setCardMode('surprise')}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${cardMode === 'surprise' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Cake className="w-4 h-4" /> Surprise
                                </button>
                                <button
                                    onClick={() => setCardMode('professional')}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${cardMode === 'professional' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Briefcase className="w-4 h-4" /> Professional
                                </button>
                            </div>

                            <div className="h-px xl:h-8 w-full xl:w-px bg-gray-200"></div>

                            <button
                                onClick={downloadCard}
                                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-md whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" /> Download Card
                            </button>
                        </div>

                        {/* Card Preview Area */}
                        <div className="flex justify-center p-4">
                            <div
                                ref={cardRef}
                                className={`w-full max-w-lg aspect-[4/5] sm:aspect-[1.414/1] relative overflow-hidden shadow-2xl rounded-xl transition-all duration-500 ${cardMode === 'normal' ? 'bg-white' : cardMode === 'surprise' ? 'bg-white' : 'bg-slate-50'}`}
                                style={{ borderTop: `8px solid ${accentColor}` }}
                            >
                                {cardMode === 'normal' && (
                                    // Normal Theme - Clean Minimal
                                    <div className="h-full w-full flex flex-col items-center justify-between">
                                        <div className="w-full p-8 flex flex-col items-center">
                                            <div className="w-full flex justify-end mb-4">
                                                <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">AGE CARD</span>
                                            </div>

                                            {/* Photo Circle */}
                                            <div className="mb-6 relative">
                                                <div className="w-36 h-36 rounded-full overflow-hidden border-4 bg-gray-50" style={{ borderColor: accentColor }}>
                                                    {photo ? (
                                                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            <User className="w-16 h-16 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                {badgeText && (
                                                    <div className="absolute -bottom-3 w-full text-center">
                                                        <span className="bg-white border border-gray-100 text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm" style={{ color: accentColor }}>
                                                            {badgeText}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <h2 className="text-4xl font-bold text-gray-900 mb-2">{stats.years} <span className="text-lg font-medium text-gray-400">Years Old</span></h2>
                                            <div className="flex gap-2 text-sm text-gray-500 font-medium mb-8">
                                                <span>{stats.months} Months</span>
                                                <span>•</span>
                                                <span>{stats.days} Days</span>
                                            </div>

                                            <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-bold text-gray-700">Next Birthday</span>
                                                    </div>
                                                    <span className="text-sm font-mono text-gray-500">{stats.nextBirthday}</span>
                                                </div>
                                                <div className="relative pt-1">
                                                    <div className="flex mb-2 items-center justify-between">
                                                        <div className="text-right w-full">
                                                            <span className="text-xs font-semibold inline-block" style={{ color: accentColor }}>
                                                                {stats.daysToNextBirthday} Days Left
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                                        <div style={{ width: `${((365 - stats.daysToNextBirthday) / 365) * 100}%`, backgroundColor: accentColor }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Branding Footer */}
                                        <div className="w-full bg-gray-900 p-4 flex justify-between items-center text-white mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs font-bold tracking-widest uppercase">Tools24Now</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-mono">Create Yours Free</span>
                                        </div>
                                    </div>
                                )}

                                {cardMode === 'surprise' && (
                                    // Surprise Theme
                                    <div className="h-full w-full flex flex-col items-center justify-between bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-white to-gray-50">
                                        <div className="h-full w-full p-8 flex flex-col items-center justify-center relative">
                                            {/* Decor */}
                                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                                                <Cake className="absolute top-[-20px] left-[-20px] w-32 h-32 rotate-12" style={{ color: accentColor }} />
                                                <Star className="absolute bottom-10 right-10 w-24 h-24 rotate-45" style={{ color: accentColor }} />
                                                <Smile className="absolute top-1/2 left-10 w-16 h-16 -rotate-12" style={{ color: accentColor }} />
                                            </div>

                                            <div className="relative z-10 flex flex-col items-center text-center w-full">
                                                {/* Photo */}
                                                <div className="mb-6 relative group">
                                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 bg-gray-100 shadow-md flex items-center justify-center" style={{ borderColor: accentColor }}>
                                                        {photo ? (
                                                            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-16 h-16 text-gray-300" />
                                                        )}
                                                    </div>
                                                    {/* Badge */}
                                                    {badgeText && (
                                                        <div className="absolute -bottom-3 w-full text-center">
                                                            <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                                {badgeText}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight leading-none">Happy Birthday!</h2>
                                                <p className="text-gray-500 font-medium mb-6 text-sm">Celebrating another amazing year of YOU.</p>

                                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-xl flex gap-x-4 md:gap-x-8 items-end justify-center w-full max-w-sm">
                                                    <div className="text-center flex-1">
                                                        <span className="block text-4xl md:text-5xl font-extrabold mb-1 leading-none" style={{ color: accentColor }}>{stats.years}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Years</span>
                                                    </div>
                                                    <div className="w-px h-10 bg-gray-200"></div>
                                                    <div className="text-center flex-1">
                                                        <span className="block text-2xl md:text-3xl font-bold text-gray-700 mb-1 leading-none">{stats.months}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Months</span>
                                                    </div>
                                                    <div className="w-px h-10 bg-gray-200"></div>
                                                    <div className="text-center flex-1">
                                                        <span className="block text-2xl md:text-3xl font-bold text-gray-700 mb-1 leading-none">{stats.days}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days</span>
                                                    </div>
                                                </div>

                                                <div className="mt-8 text-sm font-semibold text-gray-400 p-2 bg-gray-50 rounded-lg inline-block border border-gray-100">
                                                    Next Party in <span className="text-lg font-bold" style={{ color: accentColor }}>{stats.daysToNextBirthday}</span> Days!
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Branding Footer (Surprise Theme) */}
                                        <div className="w-full p-3 flex justify-center items-center text-white font-bold tracking-widest uppercase text-xs" style={{ backgroundColor: accentColor }}>
                                            Tools24Now.com
                                        </div>
                                    </div>
                                )}

                                {cardMode === 'professional' && (
                                    // Professional Theme
                                    <div className="h-full w-full flex flex-col justify-between">
                                        <div className="p-8 md:p-10 flex flex-col sm:flex-row items-center gap-8 md:gap-10">
                                            {/* Left Side: Photo & Key Stat */}
                                            <div className="flex-shrink-0 flex flex-col items-center">
                                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg mb-4 bg-white" style={{ border: `2px solid ${accentColor}` }}>
                                                    {photo ? (
                                                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                            <User className="w-16 h-16 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>

                                                {badgeText && (
                                                    <div className="mb-4 text-center">
                                                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase tracking-widest">{badgeText}</span>
                                                    </div>
                                                )}

                                                <div className="text-center bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm w-full">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Days</div>
                                                    <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalDays.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {/* Right Side: Details */}
                                            <div className="flex-1 w-full">
                                                <div className="border-b border-gray-200 pb-4 mb-4">
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Age Milestone Report</h2>
                                                    <p className="text-xs text-gray-500 font-mono">GENERATED: {new Date().toLocaleDateString().toUpperCase()}</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3 mb-6">
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                                        <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>{stats.years}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase">Years</div>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                                        <div className="text-xl font-bold text-gray-800 mb-1">{stats.months}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase">Months</div>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                                        <div className="text-xl font-bold text-gray-800 mb-1">{stats.days}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase">Days</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200/50">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600 font-medium">Total Hours Lived</span>
                                                        <span className="font-bold text-gray-900 font-mono">{stats.totalHours.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full h-px bg-gray-200"></div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600 font-medium">Total Weeks Lived</span>
                                                        <span className="font-bold text-gray-900 font-mono">{stats.totalWeeks.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Branding Footer (Professional Theme) */}
                                        <div className="w-full bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center px-8">
                                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Verified Calculation</span>
                                            <span className="text-[10px] text-gray-900 font-bold tracking-widest uppercase">TOOLS24NOW.COM</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Standard Stats (Existing) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            <StatBox label="Total Hours" value={stats.totalHours.toLocaleString()} />
                            <StatBox label="Total Weeks" value={stats.totalWeeks.toLocaleString()} />
                            <StatBox label="Years" value={stats.years.toString()} />
                            <StatBox label="Next B-Day" value={stats.daysToNextBirthday + ' days'} />
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
            <div className="text-xl font-bold text-gray-900">{value}</div>
        </div>
    );
}
