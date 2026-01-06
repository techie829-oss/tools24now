'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, AlertCircle, DollarSign, CheckCircle, RefreshCw } from 'lucide-react';
import { differenceInDays, parseISO, isValid, format } from 'date-fns';

export default function LibraryFineCalculatorPage() {
    const [dueDate, setDueDate] = useState('');
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [finePerDay, setFinePerDay] = useState('5'); // Default 5 units
    const [currency, setCurrency] = useState('INR');

    const [daysOverdue, setDaysOverdue] = useState(0);
    const [totalFine, setTotalFine] = useState(0);
    const [status, setStatus] = useState<'ontime' | 'overdue' | 'start'>('start');

    useEffect(() => {
        calculateFine();
    }, [dueDate, returnDate, finePerDay]);

    const calculateFine = () => {
        if (!dueDate || !returnDate) {
            setStatus('start');
            return;
        }

        const due = parseISO(dueDate);
        const returned = parseISO(returnDate);

        if (!isValid(due) || !isValid(returned)) return;

        const diff = differenceInDays(returned, due);

        if (diff <= 0) {
            setDaysOverdue(0);
            setTotalFine(0);
            setStatus('ontime');
        } else {
            setDaysOverdue(diff);
            const rate = parseFloat(finePerDay) || 0;
            setTotalFine(diff * rate);
            setStatus('overdue');
        }
    };

    const resetForm = () => {
        setDueDate('');
        setReturnDate(new Date().toISOString().split('T')[0]);
        setFinePerDay('5');
        setStatus('start');
    };

    const getStatusColor = () => {
        switch (status) {
            case 'ontime': return 'bg-green-50 border-green-200 text-green-800';
            case 'overdue': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-2xl mb-4 text-rose-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Library Fine Calculator</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Calculate overdue fines for library books instantly.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Input Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-rose-600" />
                                Loan Details
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Book Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                                <input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fine Rate (Daily)</label>
                                    <input
                                        type="number"
                                        value={finePerDay}
                                        onChange={(e) => setFinePerDay(e.target.value)}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                                    >
                                        <option value="INR">₹ (INR)</option>
                                        <option value="USD">$ (USD)</option>
                                        <option value="EUR">€ (EUR)</option>
                                        <option value="GBP">£ (GBP)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className={`rounded-2xl shadow-sm border p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${getStatusColor()}`}>

                        {status === 'start' ? (
                            <div className="text-gray-400">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Enter loan dates to calculate fine</p>
                            </div>
                        ) : status === 'ontime' ? (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No Fine Due!</h3>
                                <p className="text-green-700">Detailed returned on time or early.</p>
                            </div>
                        ) : (
                            <div className="w-full animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">
                                    Book is Overdue By
                                </p>
                                <div className="text-5xl font-black mb-6">
                                    {daysOverdue}
                                    <span className="text-2xl ml-2 font-medium opacity-70">Days</span>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-red-200">
                                    <p className="text-xs uppercase font-bold text-red-600 mb-1">Total Fine Amount</p>
                                    <p className="text-4xl font-bold text-gray-900">
                                        {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                        {totalFine.toFixed(2)}
                                    </p>
                                </div>

                                <p className="text-xs mt-4 opacity-60">
                                    Calculation: {daysOverdue} days × {finePerDay} per day
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
