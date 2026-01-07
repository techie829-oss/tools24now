'use client';

import { useState } from 'react';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';

// Word Banks
const ADJECTIVES = ['Tech', 'Smart', 'Global', 'Future', 'Prime', 'Elite', 'Nova', 'Cyber', 'Blue', 'Red', 'Green', 'Alpha', 'Omega', 'Rapid', 'Swift', 'Dynamic', 'Logic', 'Data', 'Cloud', 'Quantum'];
const NOUNS = ['Solutions', 'Systems', 'Labs', 'Works', 'Hub', 'Box', 'Sphere', 'Gate', 'Bridge', 'Flow', 'Wave', 'Base', 'Core', 'Venture', 'Capital', 'Group', 'Partners', 'Studio', 'Agency', 'Minds'];
const SUFFIXES = ['ify', 'ly', 'io', 'hq', 'zone', 'app', 'sys', 'net', 'inc', 'co'];

export default function BusinessNameGenerator() {
    const [keyword, setKeyword] = useState('');
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const generateNames = () => {
        setLoading(true);
        setTimeout(() => {
            const results = [];
            const key = keyword.trim();
            const cleanKey = key.charAt(0).toUpperCase() + key.slice(1);

            // 1. Keyword + Noun
            for (let i = 0; i < 5; i++) {
                const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
                results.push(`${cleanKey} ${noun}`);
            }

            // 2. Adjective + Keyword
            for (let i = 0; i < 5; i++) {
                const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
                results.push(`${adj} ${cleanKey}`);
            }

            // 3. Keyword + Suffix
            for (let i = 0; i < 5; i++) {
                const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
                results.push(`${cleanKey}${suffix}`);
            }

            // 4. Random Combos
            for (let i = 0; i < 5; i++) {
                const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
                const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
                results.push(`${adj}${noun}`);
            }

            setNames(results.sort(() => 0.5 - Math.random()));
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                        Business Name Generator
                    </h1>
                    <p className="mt-2 text-gray-600">Generate catchy, available, and brandable business names in seconds.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateNames()}
                            className="flex-1 rounded-xl border-gray-300 py-3 px-4 text-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter a keyword (e.g. 'Coffee', 'Code', 'Design')..."
                        />
                        <button
                            onClick={generateNames}
                            disabled={!keyword || loading}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Generate
                        </button>
                    </div>
                </div>

                {names.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {names.map((name, index) => (
                            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group flex justify-between items-center cursor-pointer" onClick={() => navigator.clipboard.writeText(name)}>
                                <span className="font-bold text-gray-800">{name}</span>
                                <Copy className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
