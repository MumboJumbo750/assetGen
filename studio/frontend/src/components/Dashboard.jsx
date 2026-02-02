import React, { useState, useEffect } from 'react';
import SpecView from './SpecView';
import { Database, Image, Music, Gamepad2, ChevronRight } from 'lucide-react';

const INDEX_META = {
    'zelos-asset-index': { label: 'Core Assets', icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    'zelos-audio-index': { label: 'Audio Assets', icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    'zelos-minigame-asset-index': { label: 'Minigame Assets', icon: Gamepad2, color: 'text-green-400', bg: 'bg-green-500/10' },
};

export default function Dashboard({ onNavigateToStudio, onNavigateToTab }) {
    const [requests, setRequests] = useState([]);
    const [indexes, setIndexes] = useState([]);

    useEffect(() => {
        fetchRequests();
        fetchIndexes();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            const json = await res.json();
            setRequests(json.requests || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchIndexes = async () => {
        try {
            const res = await fetch('/api/indexes');
            const json = await res.json();
            setIndexes(json.indexes || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleImport = async (filename) => {
        try {
            const res = await fetch('/api/import-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });
            const json = await res.json();
            if (json.status === 'success') {
                alert(`Imported ${json.imported} specs from ${filename}`);
                window.location.reload();
            } else {
                alert(`Error: ${json.message}`);
            }
        } catch (e) {
            alert(`Import failed: ${e.message}`);
        }
    };

    const totalAssets = indexes.reduce((sum, idx) => sum + (idx.expanded_count || 0), 0);
    const totalGenerated = indexes.reduce((sum, idx) => sum + (idx.generated_count || 0), 0);
    const completionPercent = totalAssets > 0 ? Math.round((totalGenerated / totalAssets) * 100) : 0;

    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            {/* Index Summary Cards */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Database size={20} className="text-blue-400" />
                        Asset Index Overview
                    </h2>
                    <button
                        onClick={() => onNavigateToTab?.('indexes')}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        View All <ChevronRight size={16} />
                    </button>
                </div>
                
                {/* Overall Progress */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Overall Progress</span>
                        <span className="text-white font-bold">{completionPercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{totalGenerated} generated</span>
                        <span>{totalAssets - totalGenerated} remaining</span>
                    </div>
                </div>

                {/* Index Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {indexes.map(index => {
                        const meta = INDEX_META[index.id] || { label: index.id, icon: Database, color: 'text-slate-400', bg: 'bg-slate-500/10' };
                        const Icon = meta.icon;
                        const percent = index.expanded_count > 0 
                            ? Math.round((index.generated_count / index.expanded_count) * 100) 
                            : 0;
                        
                        return (
                            <div 
                                key={index.id}
                                onClick={() => onNavigateToTab?.('indexes')}
                                className={`${meta.bg} rounded-xl p-4 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg bg-slate-800 ${meta.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {meta.label}
                                        </h3>
                                        <p className="text-xs text-slate-500">{index.entry_count} patterns</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-white">{index.expanded_count}</div>
                                        <div className="text-xs text-slate-500">total assets</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-semibold ${meta.color}`}>{percent}%</div>
                                        <div className="text-xs text-slate-500">{index.generated_count} ready</div>
                                    </div>
                                </div>
                                
                                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            meta.color.includes('blue') ? 'bg-blue-500' :
                                            meta.color.includes('purple') ? 'bg-purple-500' :
                                            meta.color.includes('green') ? 'bg-green-500' : 'bg-slate-500'
                                        }`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Existing SpecView */}
            <div className="flex-1 min-h-0">
                <SpecView
                    onGenerate={(spec) => onNavigateToStudio && onNavigateToStudio(spec.path)}
                    requests={requests}
                    onImport={handleImport}
                />
            </div>
        </div>
    );
}
