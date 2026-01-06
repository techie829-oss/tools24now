'use client';

import { useState, useRef } from 'react';
import { Download, Plus, Trash2, Calendar, Clock, Save, FileDown, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TimeSlot {
    id: string;
    time: string;
}

interface ClassSession {
    subject: string;
    teacher?: string;
    room?: string;
    color: string;
}

const COLORS = [
    'bg-blue-100 border-blue-200 text-blue-800',
    'bg-green-100 border-green-200 text-green-800',
    'bg-purple-100 border-purple-200 text-purple-800',
    'bg-orange-100 border-orange-200 text-orange-800',
    'bg-pink-100 border-pink-200 text-pink-800',
    'bg-yellow-100 border-yellow-200 text-yellow-800',
    'bg-red-100 border-red-200 text-red-800',
    'bg-indigo-100 border-indigo-200 text-indigo-800',
];

export default function TimetableGeneratorPage() {
    const tableRef = useRef<HTMLDivElement>(null);

    // Default State
    const [title, setTitle] = useState('Class Timetable');
    const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
        { id: '1', time: '09:00 - 10:00' },
        { id: '2', time: '10:00 - 11:00' },
        { id: '3', time: '11:00 - 11:15' }, // Break
        { id: '4', time: '11:15 - 12:15' },
        { id: '5', time: '12:15 - 13:15' },
        { id: '6', time: '13:15 - 14:00' }, // Lunch
        { id: '7', time: '14:00 - 15:00' },
    ]);

    // Grid Data: Map<dayIndex-slotIndex, ClassSession>
    const [gridData, setGridData] = useState<Record<string, ClassSession>>({
        '0-2': { subject: 'Morning Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '1-2': { subject: 'Morning Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '2-2': { subject: 'Morning Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '3-2': { subject: 'Morning Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '4-2': { subject: 'Morning Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },

        '0-5': { subject: 'Lunch Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '1-5': { subject: 'Lunch Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '2-5': { subject: 'Lunch Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '3-5': { subject: 'Lunch Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
        '4-5': { subject: 'Lunch Break', color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' },
    });

    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const [editSession, setEditSession] = useState<ClassSession>({ subject: '', teacher: '', room: '', color: COLORS[0] });

    // Add Time Slot
    const addTimeSlot = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setTimeSlots([...timeSlots, { id: newId, time: '00:00 - 00:00' }]);
    };

    // Remove Time Slot
    const removeTimeSlot = (index: number) => {
        const newSlots = [...timeSlots];
        newSlots.splice(index, 1);
        setTimeSlots(newSlots);
        // Cleanup grid data would be good here but optional for MVP
    };

    const handleCellClick = (dayIndex: number, slotIndex: number) => {
        const key = `${dayIndex}-${slotIndex}`;
        setSelectedCell(key);
        if (gridData[key]) {
            setEditSession(gridData[key]);
        } else {
            setEditSession({ subject: '', teacher: '', room: '', color: COLORS[0] });
        }
    };

    const saveCell = () => {
        if (selectedCell) {
            if (!editSession.subject.trim()) {
                const newGrid = { ...gridData };
                delete newGrid[selectedCell];
                setGridData(newGrid);
            } else {
                setGridData({ ...gridData, [selectedCell]: editSession });
            }
            setSelectedCell(null);
        }
    };

    const downloadImage = async () => {
        if (!tableRef.current) return;
        const canvas = await html2canvas(tableRef.current, { scale: 2 });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'timetable.png';
        link.click();
    };

    const downloadPDF = async () => {
        if (!tableRef.current) return;
        const canvas = await html2canvas(tableRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        // A4 Landscape
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth - 20; // 10mm margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('timetable.pdf');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="text-indigo-600" />
                                Timetable Generator
                            </h1>
                            <p className="text-gray-500 mt-1">Design and export your weekly schedule</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={downloadImage} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                PNG
                            </button>
                            <button onClick={downloadPDF} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                <FileDown className="w-4 h-4 mr-2" />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Editor Sidebar */}
                <div className="lg:w-80 flex-shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                                        className={`px-3 py-1.5 text-xs rounded border ${days.length === 5 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200'}`}
                                    >
                                        Mon-Fri
                                    </button>
                                    <button
                                        onClick={() => setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])}
                                        className={`px-3 py-1.5 text-xs rounded border ${days.length === 6 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200'}`}
                                    >
                                        +Sat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedCell && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200 ring-2 ring-indigo-50 transition-all">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                                Edit Slot
                                <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-gray-600"><Trash2 className="w-4 h-4" /></button>
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subject / Activity</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editSession.subject}
                                        onChange={(e) => setEditSession({ ...editSession, subject: e.target.value })}
                                        placeholder="e.g. Mathematics"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Teacher / Details</label>
                                    <input
                                        type="text"
                                        value={editSession.teacher || ''}
                                        onChange={(e) => setEditSession({ ...editSession, teacher: e.target.value })}
                                        placeholder="e.g. Mr. Smith"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Room</label>
                                    <input
                                        type="text"
                                        value={editSession.room || ''}
                                        onChange={(e) => setEditSession({ ...editSession, room: e.target.value })}
                                        placeholder="e.g. Room 101"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Color Code</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLORS.map((color, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setEditSession({ ...editSession, color })}
                                                className={`w-8 h-8 rounded-full border-2 ${color.split(' ')[0]} ${editSession.color === color ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                                            />
                                        ))}
                                        <button
                                            onClick={() => setEditSession({ ...editSession, color: 'bg-gray-100 border-gray-200 text-gray-600 font-bold tracking-widest text-center' })}
                                            className="col-span-4 text-xs text-gray-500 hover:bg-gray-100 p-1 rounded border border-dashed border-gray-300 mt-1"
                                        >
                                            Make Break/Lunch
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button onClick={saveCell} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center justify-center">
                                        <Save className="w-4 h-4 mr-2" /> Update Cell
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Timetable Preview */}
                <div className="flex-1 overflow-auto">
                    <div ref={tableRef} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-w-[800px]">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">{title}</h2>
                        </div>

                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-32 bg-gray-50 border border-gray-300 p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Time</th>
                                    {days.map((day, index) => (
                                        <th key={index} className="bg-indigo-50 border border-gray-300 p-4 text-sm font-bold text-indigo-900 uppercase tracking-wider w-[1%] whitespace-nowrap min-w-[140px]">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot, slotIndex) => (
                                    <tr key={slot.id}>
                                        <td className="bg-white border border-gray-300 p-3 text-xs font-medium text-gray-500 text-center relative group">
                                            <input
                                                type="text"
                                                value={slot.time}
                                                onChange={(e) => {
                                                    const newSlots = [...timeSlots];
                                                    newSlots[slotIndex].time = e.target.value;
                                                    setTimeSlots(newSlots);
                                                }}
                                                className="w-full text-center focus:outline-none focus:text-indigo-600 bg-transparent"
                                            />
                                            <button
                                                onClick={() => removeTimeSlot(slotIndex)}
                                                className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </td>
                                        {days.map((_, dayIndex) => {
                                            const key = `${dayIndex}-${slotIndex}`;
                                            const session = gridData[key];

                                            return (
                                                <td
                                                    key={key}
                                                    onClick={() => handleCellClick(dayIndex, slotIndex)}
                                                    className={`border border-gray-300 relative cursor-pointer hover:brightness-95 transition-all
                                                ${session ? session.color : 'bg-white hover:bg-gray-50'}
                                                ${selectedCell === key ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}
                                            `}
                                                >
                                                    {session ? (
                                                        <div className="p-2 h-full min-h-[80px] flex flex-col justify-center items-center gap-1">
                                                            <span className="font-bold text-sm leading-tight text-center">{session.subject}</span>
                                                            {(session.teacher || session.room) && (
                                                                <div className="flex flex-col items-center text-[10px] opacity-80 font-medium">
                                                                    {session.teacher && <span>{session.teacher}</span>}
                                                                    {session.room && <span>({session.room})</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full min-h-[80px] flex items-center justify-center opacity-0 hover:opacity-100">
                                                            <Plus className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-center">
                            <button onClick={addTimeSlot} className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 py-2 px-4 rounded hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
                                <Plus className="w-3 h-3" /> Add Time Slot
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
