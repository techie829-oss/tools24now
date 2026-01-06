'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Calculator, Trophy, Percent, RefreshCw, Printer, Download, ChartPie } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Subject {
    id: string;
    name: string;
    obtained: number;
    max: number;
}

export default function ExamMarksCalculatorPage() {
    const resultRef = useRef<HTMLDivElement>(null);

    const [subjects, setSubjects] = useState<Subject[]>([
        { id: '1', name: 'Mathematics', obtained: 85, max: 100 },
        { id: '2', name: 'Science', obtained: 78, max: 100 },
        { id: '3', name: 'English', obtained: 92, max: 100 },
        { id: '4', name: 'History', obtained: 88, max: 100 },
        { id: '5', name: 'Computer Science', obtained: 95, max: 100 },
    ]);

    const [studentName, setStudentName] = useState('');
    const [examName, setExamName] = useState('Final Semester Exam');

    // Stats
    const [totalObtained, setTotalObtained] = useState(0);
    const [totalMax, setTotalMax] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [grade, setGrade] = useState('');
    const [gpa, setGpa] = useState(0);

    useEffect(() => {
        const ob = subjects.reduce((acc, sub) => acc + (Number(sub.obtained) || 0), 0);
        const mx = subjects.reduce((acc, sub) => acc + (Number(sub.max) || 0), 0);

        setTotalObtained(ob);
        setTotalMax(mx);

        const per = mx > 0 ? (ob / mx) * 100 : 0;
        setPercentage(per);

        // Calculate Grade
        if (per >= 90) setGrade('A+');
        else if (per >= 80) setGrade('A');
        else if (per >= 70) setGrade('B');
        else if (per >= 60) setGrade('C');
        else if (per >= 50) setGrade('D');
        else setGrade('F');

        // Simple GPA (4.0 scale approximation)
        setGpa((per / 25)); // Rough estimate
    }, [subjects]);

    const addSubject = () => {
        setSubjects([...subjects, { id: Math.random().toString(36).substr(2, 9), name: '', obtained: 0, max: 100 }]);
    };

    const removeSubject = (index: number) => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
        const newSubjects = [...subjects];
        // @ts-ignore
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const resetForm = () => {
        if (confirm('Are you sure you want to clear all data?')) {
            setSubjects([{ id: '1', name: '', obtained: 0, max: 100 }]);
            setStudentName('');
        }
    };

    const downloadReport = async () => {
        if (!resultRef.current) return;
        try {
            const canvas = await html2canvas(resultRef.current, { scale: 2 });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `report-card-${studentName || 'student'}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to download", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Calculator className="text-indigo-600" />
                                Exam Marks Calculator
                            </h1>
                            <p className="text-gray-500 mt-1">Calculate percentages, GPA, and generate report cards</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={resetForm} className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </button>
                            <button onClick={downloadReport} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Input Area */}
                <div className="lg:w-1/2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Exam Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Student Name</label>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="e.g. Alex Johnson"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Exam Name</label>
                                <input
                                    type="text"
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Marks Entry</h3>
                            <button onClick={addSubject} className="text-xs flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
                                <Plus className="w-3 h-3 mr-1" /> Add Subject
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-1">
                                <div className="col-span-5">Subject</div>
                                <div className="col-span-3 text-center">Marks Obtained</div>
                                <div className="col-span-3 text-center">Max Marks</div>
                                <div className="col-span-1"></div>
                            </div>

                            {subjects.map((sub, index) => (
                                <div key={sub.id} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            value={sub.name}
                                            placeholder={`Subject ${index + 1}`}
                                            onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={sub.obtained}
                                            onChange={(e) => updateSubject(index, 'obtained', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={sub.max}
                                            onChange={(e) => updateSubject(index, 'max', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center bg-gray-50"
                                        />
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <button onClick={() => removeSubject(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="lg:w-1/2">
                    <div ref={resultRef} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
                        {/* Decorative Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-80" />
                            <h2 className="text-2xl font-bold">{examName}</h2>
                            <p className="opacity-90 mt-1">Performance Report</p>
                        </div>

                        <div className="p-8">
                            {/* Key Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Percentage</p>
                                    <p className="text-3xl font-bold text-blue-700">{percentage.toFixed(2)}%</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Grade</p>
                                    <p className="text-3xl font-bold text-green-700">{grade}</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <p className="text-xs text-purple-600 font-bold uppercase mb-1">Total</p>
                                    <p className="text-xl font-bold text-purple-700 mt-1">{totalObtained} <span className="text-sm text-purple-400 font-medium">/ {totalMax}</span></p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-gray-900 font-bold mb-4 border-b pb-2">Subject Performance</h3>
                                <div className="space-y-4">
                                    {subjects.map((sub) => {
                                        const subPercent = sub.max > 0 ? (sub.obtained / sub.max) * 100 : 0;
                                        let colorClass = 'bg-blue-500';
                                        if (subPercent >= 90) colorClass = 'bg-green-500';
                                        else if (subPercent < 40) colorClass = 'bg-red-500';
                                        else if (subPercent < 60) colorClass = 'bg-yellow-500';

                                        return (
                                            <div key={sub.id}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-700">{sub.name || 'Unknown Subject'}</span>
                                                    <span className="text-gray-500">{sub.obtained}/{sub.max} ({subPercent.toFixed(0)}%)</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${subPercent}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {studentName && (
                                <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                                    <p className="text-sm text-gray-500">Result generated for <span className="font-bold text-gray-900">{studentName}</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
