'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileCode, Play, Trash2, Copy, Check, Info, BookOpen, Layers } from 'lucide-react';

interface MatchGroup {
    fullMatch: string;
    index: number;
    groups: Record<string, string> | string[];
}

export default function RegexTesterPage() {
    const [pattern, setPattern] = useState(String.raw`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`);
    const [flags, setFlags] = useState('gm');
    const [text, setText] = useState('Contact us at support@tools24now.com or sales@tools24now.com for inquiries.');
    const [matches, setMatches] = useState<MatchGroup[]>([]);
    const [error, setError] = useState('');
    const [highlightedText, setHighlightedText] = useState<React.ReactNode>(text);

    useEffect(() => {
        runRegex();
    }, [pattern, flags, text]);

    const runRegex = () => {
        setError('');
        setMatches([]);

        if (!pattern) return;

        try {
            const regex = new RegExp(pattern, flags);
            const newMatches: MatchGroup[] = [];
            let match;

            // Handle global flag manually if not present to avoid infinite loops or single match issues
            // But usually users expect 'g' for multiple highlighting

            // If global flag is set
            if (flags.includes('g')) {
                while ((match = regex.exec(text)) !== null) {
                    newMatches.push({
                        fullMatch: match[0],
                        index: match.index,
                        groups: match.groups || Array.from(match).slice(1)
                    });
                    // Prevent infinite triggers on zero-length matches
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                }
            } else {
                match = regex.exec(text);
                if (match) {
                    newMatches.push({
                        fullMatch: match[0],
                        index: match.index,
                        groups: match.groups || Array.from(match).slice(1)
                    });
                }
            }

            setMatches(newMatches);
            generateHighlights(newMatches);

        } catch (e: any) {
            setError(e.message);
            setHighlightedText(text); // Fallback to plain text
        }
    };

    const generateHighlights = (foundMatches: MatchGroup[]) => {
        if (foundMatches.length === 0) {
            setHighlightedText(text);
            return;
        }

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        foundMatches.forEach((match, i) => {
            // Text before match
            if (match.index > lastIndex) {
                elements.push(text.slice(lastIndex, match.index));
            }

            // The match itself
            elements.push(
                <span key={i} className="bg-yellow-200 text-yellow-800 rounded px-0.5 border-b-2 border-yellow-400 font-bold" title={`Match ${i + 1}`}>
                    {match.fullMatch}
                </span>
            );

            lastIndex = match.index + match.fullMatch.length;
        });

        // Remaining text
        if (lastIndex < text.length) {
            elements.push(text.slice(lastIndex));
        }

        setHighlightedText(<>{elements}</>);
    };

    const toggleFlag = (flag: string) => {
        if (flags.includes(flag)) {
            setFlags(flags.replace(flag, ''));
        } else {
            setFlags(prev => {
                // Keep flags in standard order helps readability slightly
                const newFlags = prev + flag;
                return Array.from(new Set(newFlags.split(''))).sort().join('');
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center gap-3">
                        <FileCode className="w-10 h-10 text-purple-600" />
                        Regex Tester
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Build, test, and debug regular expressions in real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Controls */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Regular Expression</label>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-gray-400 font-mono text-xl">/</span>
                                <input
                                    type="text"
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                    className={`flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 font-mono text-lg ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}
                                    placeholder="Enter regex pattern..."
                                />
                                <span className="text-gray-400 font-mono text-xl">/</span>
                                <input
                                    type="text"
                                    value={flags}
                                    onChange={(e) => setFlags(e.target.value)}
                                    className="w-20 px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 bg-gray-50 font-mono text-lg text-center"
                                    placeholder="flags"
                                />
                            </div>

                            {/* Flag Toggles */}
                            <div className="flex flex-wrap gap-2">
                                <FlagButton label="Global" code="g" currentFlags={flags} onClick={() => toggleFlag('g')} />
                                <FlagButton label="Case Insensitive" code="i" currentFlags={flags} onClick={() => toggleFlag('i')} />
                                <FlagButton label="Multiline" code="m" currentFlags={flags} onClick={() => toggleFlag('m')} />
                                <FlagButton label="Single Line" code="s" currentFlags={flags} onClick={() => toggleFlag('s')} />
                                <FlagButton label="Unicode" code="u" currentFlags={flags} onClick={() => toggleFlag('u')} />
                            </div>

                            {error && (
                                <div className="mt-4 text-red-500 font-medium text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4" /> {error}
                                </div>
                            )}
                        </div>

                        {/* Test String Input */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Test String</label>
                                <button onClick={() => setText('')} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative flex-1 font-mono text-base border border-gray-200 rounded-xl overflow-hidden">
                                {/* Backdrop for Highlights */}
                                <div className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words text-transparent bg-transparent z-0 overflow-auto">
                                    {highlightedText}
                                </div>

                                {/* Actual Input */}
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-gray-800 z-10 resize-none focus:outline-none focus:bg-white/50 transition-colors whitespace-pre-wrap break-words"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Results & Cheatsheet */}
                    <div className="space-y-6">
                        {/* Match Results */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-h-[400px] overflow-y-auto">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TargetIcon className="w-5 h-5 text-purple-600" />
                                Match Information
                            </h3>

                            {matches.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-purple-700 bg-purple-50 p-2 rounded-lg inline-block">
                                        Found {matches.length} match{matches.length !== 1 ? 'es' : ''}
                                    </div>

                                    {matches.map((match, i) => (
                                        <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Match {i + 1}</span>
                                                <span className="text-xs text-gray-400 font-mono">Index: {match.index}</span>
                                            </div>
                                            <div className="font-mono text-gray-900 bg-white p-2 rounded border border-gray-200 break-all mb-2">
                                                {match.fullMatch}
                                            </div>

                                            {/* Groups */}
                                            {Object.keys(match.groups).length > 0 && (
                                                <div className="space-y-1">
                                                    {Array.isArray(match.groups) ? (
                                                        match.groups.map((group, gIndex) => (
                                                            <div key={gIndex} className="flex gap-2 text-xs">
                                                                <span className="font-bold text-gray-500">Group {gIndex + 1}:</span>
                                                                <span className="font-mono text-purple-600 break-all">{group}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        Object.entries(match.groups).map(([name, val]) => (
                                                            <div key={name} className="flex gap-2 text-xs">
                                                                <span className="font-bold text-gray-500">{name}:</span>
                                                                <span className="font-mono text-purple-600 break-all">{val}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-center py-8 italic">
                                    No matches found...
                                </div>
                            )}
                        </div>

                        {/* Cheatsheet */}
                        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden text-slate-300">
                            <div className="p-4 border-b border-slate-700 bg-slate-800">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-pink-400" />
                                    Cheatsheet
                                </h3>
                            </div>
                            <div className="p-4 text-sm font-mono space-y-3 max-h-[300px] overflow-y-auto">
                                <CheatsheetRow item="." desc="Any character" />
                                <CheatsheetRow item="\d" desc="Digit (0-9)" />
                                <CheatsheetRow item="\w" desc="Word Char (a-z, 0-9, _)" />
                                <CheatsheetRow item="\s" desc="Whitespace" />
                                <CheatsheetRow item="^" desc="Start of string" />
                                <CheatsheetRow item="$" desc="End of string" />
                                <CheatsheetRow item="*" desc="0 or more" />
                                <CheatsheetRow item="+" desc="1 or more" />
                                <CheatsheetRow item="?" desc="0 or 1" />
                                <CheatsheetRow item="[a-z]" desc="Character set" />
                                <CheatsheetRow item="(...)" desc="Capture group" />
                                <CheatsheetRow item="(?:...)" desc="Non-capture group" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlagButton({ label, code, currentFlags, onClick }: { label: string, code: string, currentFlags: string, onClick: () => void }) {
    const isActive = currentFlags.includes(code);
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${isActive
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
        >
            <span className="font-mono mr-1">{code}</span>
            {label}
        </button>
    )
}

function CheatsheetRow({ item, desc }: { item: string, desc: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-pink-400 font-bold">{item}</span>
            <span className="text-slate-500">{desc}</span>
        </div>
    )
}

function TargetIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    )
}
