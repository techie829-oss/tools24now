'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, AlertTriangle, Shield } from 'lucide-react';

export default function PasswordGenerator() {
    // State
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUpper, setIncludeUpper] = useState(true);
    const [includeLower, setIncludeLower] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    // Logic
    const generatePassword = useCallback(() => {
        const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowers = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = '';
        if (includeUpper) chars += uppers;
        if (includeLower) chars += lowers;
        if (includeNumbers) chars += numbers;
        if (includeSymbols) chars += symbols;

        if (chars === '') {
            setPassword('');
            return;
        }

        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += chars[array[i] % chars.length];
        }

        setPassword(newPassword);
        setCopied(false);
    }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

    // Generate on mount and changes
    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const handleCopy = async () => {
        if (!password) return;
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Strength Calc
    const getStrength = () => {
        if (!password) return { label: 'Empty', color: 'bg-gray-200', score: 0 };
        let score = 0;
        if (password.length > 8) score++;
        if (password.length > 12) score++;
        if (includeUpper && includeLower) score++;
        if (includeNumbers) score++;
        if (includeSymbols) score++;

        if (score <= 2) return { label: 'Weak', color: 'bg-red-500', score: 1 };
        if (score <= 4) return { label: 'Good', color: 'bg-yellow-500', score: 2 };
        return { label: 'Strong', color: 'bg-green-500', score: 3 };
    };

    const strength = getStrength();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
                        Secure Password Generator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Generate strong, secure passwords instantly in your browser.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Display Area */}
                    <div className="bg-gray-900 p-8 sm:p-12 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="font-mono text-3xl sm:text-5xl font-bold text-white break-all tracking-wider mb-8 min-h-[4rem] flex items-center justify-center">
                                {password || <span className="text-gray-600 text-xl">Select options to generate</span>}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={generatePassword}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-gray-900 bg-white hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    Regenerate
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!password}
                                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white transition-all shadow-lg transform hover:-translate-y-0.5 ${copied
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                    {copied ? 'Copied!' : 'Copy Securely'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controls Area */}
                    <div className="p-8 sm:p-12 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Length & Settings */}
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="text-lg font-semibold text-gray-900">Password Length</label>
                                        <span className="text-3xl font-bold text-blue-600 font-mono">{length}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="4"
                                        max="64"
                                        value={length}
                                        onChange={(e) => setLength(Number(e.target.value))}
                                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                                        <span>4</span>
                                        <span>32</span>
                                        <span>64</span>
                                    </div>
                                </div>

                                {/* Strength Meter */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Security Strength
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${strength.color}`}
                                                style={{ width: `${(strength.score / 3) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-sm font-bold uppercase ${strength.color.replace('bg-', 'text-')}`}>
                                            {strength.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <label className="text-lg font-semibold text-gray-900 block mb-4">Character Types</label>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Uppercase Letters (A-Z)', state: includeUpper, set: setIncludeUpper },
                                        { label: 'Lowercase Letters (a-z)', state: includeLower, set: setIncludeLower },
                                        { label: 'Numbers (0-9)', state: includeNumbers, set: setIncludeNumbers },
                                        { label: 'Symbols (!@#$...)', state: includeSymbols, set: setIncludeSymbols },
                                    ].map((opt, idx) => (
                                        <label key={idx} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={opt.state}
                                                    onChange={(e) => {
                                                        // Prevent unchecking the last one
                                                        const active = [includeUpper, includeLower, includeNumbers, includeSymbols].filter(Boolean).length;
                                                        if (active === 1 && opt.state) return;
                                                        opt.set(e.target.checked);
                                                    }}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </div>
                                            <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900">{opt.label}</span>
                                        </label>
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
