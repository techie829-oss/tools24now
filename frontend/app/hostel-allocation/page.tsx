'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Home, Users, CheckCircle, XCircle, Plus, Search, BedDouble, Trash2, Download, FileSpreadsheet, ImageIcon } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    course: string;
}

interface Room {
    id: string;
    number: string;
    floor: number;
    capacity: number;
    occupants: Student[];
    type: 'AC' | 'Non-AC';
}

export default function HostelAllocationPage() {
    const gridRef = useRef<HTMLDivElement>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentCourse, setNewStudentCourse] = useState('');

    // Mock Data for 2 Floors, 6 rooms each
    const [rooms, setRooms] = useState<Room[]>([
        { id: '101', number: '101', floor: 1, capacity: 2, type: 'AC', occupants: [{ id: 's1', name: 'John Doe', course: 'B.Tech' }] },
        { id: '102', number: '102', floor: 1, capacity: 2, type: 'AC', occupants: [] },
        { id: '103', number: '103', floor: 1, capacity: 3, type: 'Non-AC', occupants: [{ id: 's2', name: 'Mike Ross', course: 'Law' }, { id: 's3', name: 'Harvey', course: 'Law' }] },
        { id: '104', number: '104', floor: 1, capacity: 3, type: 'Non-AC', occupants: [] },
        { id: '201', number: '201', floor: 2, capacity: 2, type: 'AC', occupants: [] },
        { id: '202', number: '202', floor: 2, capacity: 2, type: 'AC', occupants: [] },
        { id: '203', number: '203', floor: 2, capacity: 1, type: 'AC', occupants: [{ id: 's4', name: 'Elon M', course: 'Physics' }] }, // Single room
        { id: '204', number: '204', floor: 2, capacity: 4, type: 'Non-AC', occupants: [] },
    ]);

    const stats = {
        totalBeds: rooms.reduce((acc, r) => acc + r.capacity, 0),
        occupiedBeds: rooms.reduce((acc, r) => acc + r.occupants.length, 0),
        availableBeds: rooms.reduce((acc, r) => acc + (r.capacity - r.occupants.length), 0),
    };

    const handleAllocate = () => {
        if (!selectedRoom || !newStudentName) return;
        if (selectedRoom.occupants.length >= selectedRoom.capacity) return;

        const updatedRooms = rooms.map(r => {
            if (r.id === selectedRoom.id) {
                return {
                    ...r,
                    occupants: [...r.occupants, { id: Math.random().toString(36).substr(2, 9), name: newStudentName, course: newStudentCourse || 'N/A' }]
                };
            }
            return r;
        });

        setRooms(updatedRooms);
        setNewStudentName('');
        setNewStudentCourse('');

        // Update selected room view as well
        const updatedSelected = updatedRooms.find(r => r.id === selectedRoom.id);
        if (updatedSelected) setSelectedRoom(updatedSelected);
    };

    const handleVacate = (roomId: string, studentId: string) => {
        const updatedRooms = rooms.map(r => {
            if (r.id === roomId) {
                return {
                    ...r,
                    occupants: r.occupants.filter(s => s.id !== studentId)
                };
            }
            return r;
        });
        setRooms(updatedRooms);

        const updatedSelected = updatedRooms.find(r => r.id === roomId);
        if (updatedSelected) setSelectedRoom(updatedSelected);
    };

    const downloadImage = async () => {
        if (!gridRef.current) return;
        try {
            const canvas = await html2canvas(gridRef.current, { scale: 2, useCORS: true });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `hostel-allocation-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
        }
    };

    const downloadCSV = () => {
        const headers = ['Room No', 'Floor', 'Type', 'Capacity', 'Occupants Count', 'Student Names'];
        const rows = rooms.map(r => [
            r.number,
            r.floor,
            r.type,
            r.capacity,
            r.occupants.length,
            r.occupants.map(s => `${s.name} (${s.course})`).join('; ')
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "hostel_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Home className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Hostel Allocation</h1>
                            </div>
                            <p className="text-gray-600 text-sm">Manage rooms, view occupancy, and allocate students visually.</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={downloadCSV} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                                Export CSV
                            </button>
                            <button onClick={downloadImage} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Save Grid Image
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Beds</p>
                            <p className="text-xl font-bold text-gray-900">{stats.totalBeds}</p>
                        </div>
                        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 shadow-sm flex-1">
                            <p className="text-xs text-green-600 uppercase font-bold">Available</p>
                            <p className="text-xl font-bold text-green-700">{stats.availableBeds}</p>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm flex-1">
                            <p className="text-xs text-blue-600 uppercase font-bold">Occupied</p>
                            <p className="text-xl font-bold text-blue-700">{stats.occupiedBeds}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Visual Grid */}
                <div className="lg:w-2/3">
                    <div ref={gridRef} className="space-y-8 bg-gray-50 p-4 -m-4 rounded-xl">
                        {[1, 2].map(floor => (
                            <div key={floor} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-2 h-6 bg-indigo-500 rounded mr-2"></div>
                                    Floor {floor}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {rooms.filter(r => r.floor === floor).map(room => {
                                        const isFull = room.occupants.length >= room.capacity;
                                        const isSelected = selectedRoom?.id === room.id;

                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                                            ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-indigo-300'}
                                            ${isFull ? 'bg-red-50/50' : 'bg-white'}
                                        `}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-gray-900 text-lg">{room.number}</span>
                                                    {isFull ? (
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">{room.type}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <BedDouble className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs font-bold text-gray-700">{room.occupants.length}/{room.capacity}</span>
                                                        </div>
                                                    </div>

                                                    {/* Capacity Bar */}
                                                    <div className="w-full max-w-[40px] h-1 bg-gray-200 rounded-full overflow-hidden ml-2">
                                                        <div
                                                            className={`h-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Panel */}
                <div className="lg:w-1/3">
                    <div className="sticky top-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-auto">
                        {selectedRoom ? (
                            <div className="animate-in slide-in-from-right duration-300">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Room {selectedRoom.number}</h2>
                                        <p className="text-sm text-gray-500">{selectedRoom.type} • Floor {selectedRoom.floor}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${selectedRoom.occupants.length >= selectedRoom.capacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                            `}>
                                        {selectedRoom.occupants.length >= selectedRoom.capacity ? 'Full' : 'Available'}
                                    </div>
                                </div>

                                {/* Occupants List */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Current Occupants</h3>
                                    {selectedRoom.occupants.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedRoom.occupants.map(student => (
                                                <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.course}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleVacate(selectedRoom.id, student.id)}
                                                        className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                        title="Vacate Bed"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">This room is currently empty.</p>
                                    )}
                                </div>

                                {/* Allocation Form */}
                                {selectedRoom.occupants.length < selectedRoom.capacity && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                            <Plus className="w-4 h-4 mr-2 text-indigo-600" /> Allocate New Student
                                        </h3>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Student Name"
                                                value={newStudentName}
                                                onChange={e => setNewStudentName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Course / Dept"
                                                value={newStudentCourse}
                                                onChange={e => setNewStudentCourse(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                            />
                                            <button
                                                onClick={handleAllocate}
                                                disabled={!newStudentName}
                                                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-sm transition-all"
                                            >
                                                Allocate Bed
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Select a room from the grid to manage allocation.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
