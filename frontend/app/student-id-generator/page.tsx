'use client';

import { useState, useRef } from 'react';
import { Download, Upload, User, FileText, Image as ImageIcon, Printer, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

interface StudentData {
    name: string;
    id: string;
    grade: string;
    dob: string;
    bloodGroup: string;
    contact: string;
    address: string;
    schoolName: string;
    schoolAddress: string;
    photo: string | null;
}

export default function StudentIdGeneratorPage() {
    const cardRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<StudentData>({
        name: '',
        id: '',
        grade: '',
        dob: '',
        bloodGroup: '',
        contact: '',
        address: '',
        schoolName: 'Springfield High School',
        schoolAddress: '123 Education Lane, Knowledge City',
        photo: null
    });

    const [themeColor, setThemeColor] = useState('blue');

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `student-id-${data.id || 'card'}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
            alert("Failed to download ID card. Please try again.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getThemeColors = () => {
        switch (themeColor) {
            case 'red': return { bg: 'bg-red-600', text: 'text-red-800', border: 'border-red-200', light: 'bg-red-50' };
            case 'green': return { bg: 'bg-green-600', text: 'text-green-800', border: 'border-green-200', light: 'bg-green-50' };
            case 'purple': return { bg: 'bg-purple-600', text: 'text-purple-800', border: 'border-purple-200', light: 'bg-purple-50' };
            case 'orange': return { bg: 'bg-orange-500', text: 'text-orange-800', border: 'border-orange-200', light: 'bg-orange-50' };
            default: return { bg: 'bg-blue-600', text: 'text-blue-800', border: 'border-blue-200', light: 'bg-blue-50' };
        }
    };

    const theme = getThemeColors();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
            {/* Header - Hidden in Print */}
            <div className="bg-white border-b border-gray-200 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <User className="text-indigo-600" />
                                Student ID Generator
                            </h1>
                            <p className="text-gray-500 mt-1">Create professional student ID cards instantly</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </button>
                            <button onClick={downloadCard} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                <Download className="w-4 h-4 mr-2" />
                                Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Editor Form - Hidden in Print */}
                <div className="lg:w-1/2 space-y-6 print:hidden">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-indigo-500" /> School Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                <input type="text" value={data.schoolName} onChange={e => setData({ ...data, schoolName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Address</label>
                                <input type="text" value={data.schoolAddress} onChange={e => setData({ ...data, schoolAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" />
                            </div>
                        </div>

                        <div className="mt-8 mb-4 border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="w-4 h-4 mr-2 text-indigo-500" /> Student Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">Click to upload photo</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll / ID No</label>
                                <input type="text" value={data.id} onChange={e => setData({ ...data, id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" placeholder="2024001" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class / Grade</label>
                                <input type="text" value={data.grade} onChange={e => setData({ ...data, grade: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" placeholder="10th - A" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input type="date" value={data.dob} onChange={e => setData({ ...data, dob: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select value={data.bloodGroup} onChange={e => setData({ ...data, bloodGroup: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900">
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                <input type="tel" value={data.contact} onChange={e => setData({ ...data, contact: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" placeholder="+1 234 567 890" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input type="text" value={data.address} onChange={e => setData({ ...data, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900" placeholder="Flat No, Street, City" />
                            </div>
                        </div>

                        <div className="mt-8 mb-4 border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <PaletteIcon className="w-4 h-4 mr-2 text-indigo-500" /> Theme Color
                            </h3>
                            <div className="flex gap-4">
                                {['blue', 'red', 'green', 'purple', 'orange'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setThemeColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'} bg-${color === 'blue' ? 'blue-600' : color === 'red' ? 'red-600' : color === 'green' ? 'green-600' : color === 'purple' ? 'purple-600' : 'orange-500'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview Area */}
                <div className="lg:w-1/2 flex items-start justify-center pt-8">
                    <div ref={cardRef} className="w-[320px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden relative border border-gray-200 print:shadow-none print:border-none">
                        {/* ID Header Pattern */}
                        <div className={`h-32 ${theme.bg} relative`}>
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:10px_10px]"></div>
                            <div className="absolute bottom-0 w-full h-16 bg-white rounded-t-[50%] scale-110 translate-y-8"></div>

                            <div className="relative z-10 p-6 text-center">
                                <h2 className="text-white font-bold text-lg leading-tight uppercase tracking-wide">{data.schoolName || 'School Name'}</h2>
                                <p className="text-white/80 text-[10px] mt-1">{data.schoolAddress || 'Address Line 1'}</p>
                            </div>
                        </div>

                        {/* Photo & Main Info */}
                        <div className="relative -mt-12 flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 ${theme.bg}`}>
                                {data.photo ? (
                                    <img src={data.photo} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/50">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <h1 className="mt-3 text-xl font-bold text-gray-800">{data.name || 'Student Name'}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold mt-1 ${theme.light} ${theme.text}`}>
                                {data.grade || 'Grade'}
                            </span>
                        </div>

                        {/* Details List */}
                        <div className="px-8 mt-6 space-y-3">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-xs text-gray-500 font-medium uppercase">ID Number</span>
                                <span className="text-sm font-semibold text-gray-800">{data.id || '---'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-xs text-gray-500 font-medium uppercase">DOB</span>
                                <span className="text-sm font-medium text-gray-800">{data.dob || '---'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-xs text-gray-500 font-medium uppercase">Blood Grp</span>
                                <span className="text-sm font-bold text-red-500">{data.bloodGroup || '--'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-xs text-gray-500 font-medium uppercase">Emergency</span>
                                <span className="text-sm font-medium text-gray-800">{data.contact || '---'}</span>
                            </div>
                        </div>

                        {/* Address & Barcode Area */}
                        <div className="absolute bottom-0 w-full bg-gray-50 p-4 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-500 line-clamp-1">{data.address || 'Student Address Info'}</p>
                            <div className="h-8 mt-2 w-full bg-white border border-gray-200 rounded flex items-center justify-center">
                                {/* We can use a font or simple lines for barcode effect */}
                                <div className="flex items-center justify-center gap-[2px] opacity-60">
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <div key={i} className={`h-4 w-[${Math.random() > 0.5 ? '2px' : '1px'}] bg-black`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function PaletteIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" />
            <circle cx="17.5" cy="10.5" r=".5" />
            <circle cx="8.5" cy="7.5" r=".5" />
            <circle cx="6.5" cy="12.5" r=".5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
    )
}
