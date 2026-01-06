'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Network, Copy, Check, Info, Shield, Binary, Layers } from 'lucide-react';

interface SubnetInfo {
    ip: string;
    mask: string;
    cidr: number;
    network: string;
    broadcast: string;
    firstUsable: string;
    lastUsable: string;
    hostsTotal: number;
    hostsUsable: number;
    ipBinary: string;
    maskBinary: string;
    type: 'Public' | 'Private' | 'Reserved';
    classType: string;
}

export default function SubnetCalculatorPage() {
    const [ip, setIp] = useState('192.168.1.1');
    const [cidr, setCidr] = useState(24);
    const [info, setInfo] = useState<SubnetInfo | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        calculateSubnet();
    }, [ip, cidr]);

    const ipToLong = (ip: string) => {
        const parts = ip.split('.');
        if (parts.length !== 4) return null;
        return (parseInt(parts[0]) << 24) | (parseInt(parts[1]) << 16) | (parseInt(parts[2]) << 8) | parseInt(parts[3]);
    };

    const longToIp = (long: number) => {
        return [
            (long >>> 24) & 255,
            (long >>> 16) & 255,
            (long >>> 8) & 255,
            long & 255
        ].join('.');
    };

    const toBinary = (long: number) => {
        return [
            ((long >>> 24) & 255).toString(2).padStart(8, '0'),
            ((long >>> 16) & 255).toString(2).padStart(8, '0'),
            ((long >>> 8) & 255).toString(2).padStart(8, '0'),
            (long & 255).toString(2).padStart(8, '0')
        ].join('.');
    };

    const getIpClass = (firstOctet: number) => {
        if (firstOctet >= 1 && firstOctet <= 126) return 'A';
        if (firstOctet >= 128 && firstOctet <= 191) return 'B';
        if (firstOctet >= 192 && firstOctet <= 223) return 'C';
        if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
        if (firstOctet >= 240 && firstOctet <= 254) return 'E (Experimental)';
        return 'Unknown';
    };

    const isPrivate = (ipParts: number[]) => {
        if (ipParts[0] === 10) return true;
        if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;
        if (ipParts[0] === 192 && ipParts[1] === 168) return true;
        return false;
    };

    const calculateSubnet = () => {
        // Validate IP
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) {
            setError('Invalid IP Format');
            setInfo(null);
            return;
        }

        const parts = ip.split('.').map(Number);
        if (parts.some(p => p < 0 || p > 255)) {
            setError('Octets must be between 0 and 255');
            setInfo(null);
            return;
        }

        setError('');

        const ipLong = ipToLong(ip);
        if (ipLong === null) return;

        const maskLong = -1 << (32 - cidr);
        const networkLong = ipLong & maskLong;
        const broadcastLong = networkLong | (~maskLong);

        const hostsTotal = Math.pow(2, 32 - cidr);
        const hostsUsable = hostsTotal - 2 > 0 ? hostsTotal - 2 : 0;

        setInfo({
            ip: ip,
            mask: longToIp(maskLong),
            cidr: cidr,
            network: longToIp(networkLong),
            broadcast: longToIp(broadcastLong),
            firstUsable: longToIp(networkLong + 1),
            lastUsable: longToIp(broadcastLong - 1),
            hostsTotal,
            hostsUsable,
            ipBinary: toBinary(ipLong),
            maskBinary: toBinary(maskLong),
            type: isPrivate(parts) ? 'Private' : 'Public',
            classType: getIpClass(parts[0])
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center gap-3">
                        <Calculator className="w-10 h-10 text-orange-600" />
                        Subnet Calculator
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Visualize network ranges, masks, and binary data instantly.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">IP Address</label>
                            <input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all text-xl font-mono font-medium ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}
                                placeholder="192.168.0.1"
                            />
                            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex justify-between">
                                <span>Subnet Mask (CIDR)</span>
                                <span className="text-orange-600 font-mono bg-orange-50 px-2 rounded">/{cidr}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="32"
                                value={cidr}
                                onChange={(e) => setCidr(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600 mb-4"
                            />
                            <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 font-mono text-center">
                                <div onClick={() => setCidr(8)} className="cursor-pointer hover:text-orange-500 hover:font-bold transition-colors">/8</div>
                                <div onClick={() => setCidr(16)} className="cursor-pointer hover:text-orange-500 hover:font-bold transition-colors">/16</div>
                                <div onClick={() => setCidr(24)} className="cursor-pointer hover:text-orange-500 hover:font-bold transition-colors">/24</div>
                                <div onClick={() => setCidr(30)} className="cursor-pointer hover:text-orange-500 hover:font-bold transition-colors">/30</div>
                            </div>
                        </div>
                    </div>
                </div>

                {info && !error && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200">
                                <div className="text-orange-100 font-medium mb-1 flex items-center gap-2">
                                    <Network className="w-4 h-4" /> Network Address
                                </div>
                                <div className="text-3xl font-bold font-mono tracking-tight">{info.network}</div>
                                <div className="text-orange-200 text-sm mt-1">{info.mask}</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="text-gray-500 font-medium mb-1 flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Usable Hosts
                                </div>
                                <div className="text-3xl font-bold text-gray-900 font-mono">
                                    {info.hostsUsable.toLocaleString()}
                                </div>
                                <div className="text-gray-400 text-sm mt-1">Total: {info.hostsTotal.toLocaleString()}</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="text-gray-500 font-medium mb-1 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Network Class
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{info.classType}</div>
                                <div className={`text-sm mt-1 font-bold ${info.type === 'Private' ? 'text-green-600' : 'text-blue-600'}`}>
                                    {info.type} Network
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" />
                                    Subnet Details
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <InfoRow label="Subnet Mask" value={info.mask} mono />
                                <InfoRow label="Wildcard Mask" value={longToIp(~(-1 << (32 - cidr)))} mono />
                                <InfoRow label="Broadcast Address" value={info.broadcast} mono />
                                <InfoRow label="Host Range" value={`${info.firstUsable}  -  ${info.lastUsable}`} mono highlight />
                                <InfoRow label="CIDR Notation" value={`/${info.cidr}`} />
                            </div>
                        </div>

                        {/* Binary Table */}
                        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden text-slate-300">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Binary className="w-5 h-5 text-green-400" />
                                    Binary Visualization
                                </h3>
                            </div>
                            <div className="p-6 space-y-4 font-mono text-sm md:text-base">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">IP Address</div>
                                    <div className="break-all">{info.ipBinary}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Subnet Mask</div>
                                    <div className="text-orange-400 break-all">{info.maskBinary}</div>
                                </div>
                                <div className="pt-4 border-t border-slate-700 mt-4">
                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Network Portion (AND)</div>
                                    <div className="text-green-400 break-all">{toBinary(ipToLong(info.network) || 0)}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

function InfoRow({ label, value, mono = false, highlight = false }: { label: string, value: string, mono?: boolean, highlight?: boolean }) {
    return (
        <div className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${highlight ? 'bg-orange-50/50' : ''}`}>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</div>
            <div className={`font-bold text-gray-900 ${mono ? 'font-mono text-lg' : 'text-lg'} ${highlight ? 'text-orange-700' : ''}`}>
                {value}
            </div>
        </div>
    )
}
