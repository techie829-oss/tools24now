'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Ruler, Weight, Thermometer, Activity } from 'lucide-react';

type Category = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed';

const conversions = {
    length: {
        meter: 1,
        kilometer: 0.001,
        centimeter: 100,
        millimeter: 1000,
        mile: 0.000621371,
        yard: 1.09361,
        foot: 3.28084,
        inch: 39.3701,
    },
    weight: {
        kilogram: 1,
        gram: 1000,
        milligram: 1000000,
        pound: 2.20462,
        ounce: 35.274,
        ton: 0.001,
    },
    temperature: {
        celsius: (v: number) => v,
        fahrenheit: (v: number) => (v * 9 / 5) + 32,
        kelvin: (v: number) => v + 273.15,
    },
    area: {
        'square meter': 1,
        'square kilometer': 0.000001,
        'square mile': 3.861e-7,
        'square yard': 1.19599,
        'square foot': 10.7639,
        acre: 0.000247105,
        hectare: 0.0001,
    },
    volume: {
        liter: 1,
        milliliter: 1000,
        'cubic meter': 0.001,
        gallon: 0.264172,
        quart: 1.05669,
        pint: 2.11338,
        cup: 4.22675,
    },
    speed: {
        'meter/second': 1,
        'kilometer/hour': 3.6,
        'mile/hour': 2.23694,
        'foot/second': 3.28084,
        knot: 1.94384,
    },
};

export default function UnitConverter() {
    const [category, setCategory] = useState<Category>('length');
    const [fromUnit, setFromUnit] = useState('meter');
    const [toUnit, setToUnit] = useState('kilometer');
    const [fromValue, setFromValue] = useState('1');
    const [toValue, setToValue] = useState('0.001');

    const convert = (value: string, from: string, to: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '';

        if (category === 'temperature') {
            const temps = conversions.temperature as any;
            let celsius = num;

            // Convert to Celsius first
            if (from === 'fahrenheit') celsius = (num - 32) * 5 / 9;
            else if (from === 'kelvin') celsius = num - 273.15;

            // Then to target
            const result = temps[to](celsius);
            return result.toFixed(4);
        } else {
            const rates = conversions[category] as any;
            const baseValue = num / rates[from];
            const result = baseValue * rates[to];
            return result.toFixed(6);
        }
    };

    const handleFromChange = (value: string) => {
        setFromValue(value);
        const result = convert(value, fromUnit, toUnit);
        setToValue(result);
    };

    const handleToChange = (value: string) => {
        setToValue(value);
        const result = convert(value, toUnit, fromUnit);
        setFromValue(result);
    };

    const switchUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setFromValue(toValue);
        setToValue(fromValue);
    };

    React.useEffect(() => {
        const units = Object.keys(conversions[category]);
        setFromUnit(units[0]);
        setToUnit(units[1] || units[0]);
        setFromValue('1');
        const result = convert('1', units[0], units[1] || units[0]);
        setToValue(result);
    }, [category]);

    const units = Object.keys(conversions[category]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                        Unit Converter
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Convert between length, weight, temperature, and more.
                    </p>
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
                    {([
                        { key: 'length', label: 'Length', icon: Ruler },
                        { key: 'weight', label: 'Weight', icon: Weight },
                        { key: 'temperature', label: 'Temp', icon: Thermometer },
                        { key: 'area', label: 'Area', icon: Activity },
                        { key: 'volume', label: 'Volume', icon: Activity },
                        { key: 'speed', label: 'Speed', icon: Activity },
                    ] as { key: Category, label: string, icon: any }[]).map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setCategory(key)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl font-semibold transition-all ${category === key
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Converter */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* From */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                            <select
                                value={fromUnit}
                                onChange={(e) => {
                                    setFromUnit(e.target.value);
                                    const result = convert(fromValue, e.target.value, toUnit);
                                    setToValue(result);
                                }}
                                className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={fromValue}
                                onChange={(e) => handleFromChange(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Switch Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={switchUnits}
                                className="p-4 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
                            >
                                <ArrowRightLeft className="w-6 h-6" />
                            </button>
                        </div>

                        {/* To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <select
                                value={toUnit}
                                onChange={(e) => {
                                    setToUnit(e.target.value);
                                    const result = convert(fromValue, fromUnit, e.target.value);
                                    setToValue(result);
                                }}
                                className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={toValue}
                                onChange={(e) => handleToChange(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl text-2xl font-bold bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Reference */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">📐 Quick Reference:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-800 text-sm">
                        <div><strong>1 km</strong> = 0.621 miles</div>
                        <div><strong>1 kg</strong> = 2.205 pounds</div>
                        <div><strong>0°C</strong> = 32°F = 273.15K</div>
                        <div><strong>1 gallon</strong> = 3.785 liters</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
