import React, { useState, useEffect } from 'react';
import { Layers, Activity, AlertCircle, CheckCircle, Package, ArrowRight, RefreshCw, Box, FileText, Download, GraduationCap, LayoutDashboard } from 'lucide-react';
import SpecView from './SpecView';
import TrainingWizard from './training/TrainingWizard';

export default function Dashboard({ onNavigateToStudio }) {
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'training'
    const [requests, setRequests] = useState([]);
    const [importing, setImporting] = useState(null);

    useEffect(() => {
        fetchRequests();
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

    const handleImport = async (filename) => {
        setImporting(filename);
        try {
            const res = await fetch('/api/import-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });
            const json = await res.json();
            if (json.status === 'success') {
                alert(`Imported ${json.imported} specs from ${filename}`);
            } else {
                alert(`Error: ${json.message}`);
            }
        } catch (e) {
            alert(`Import failed: ${e.message}`);
        } finally {
            setImporting(null);
        }
    };

    const handleGenerate = async (spec) => {
        if (onNavigateToStudio) {
            onNavigateToStudio(spec.path);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Activity className="text-blue-500" />
                        Asset Studio
                    </h1>
                    <p className="text-slate-400 mt-2">Manage generation and training pipelines.</p>
                </div>

                {/* View Switcher */}
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeView === 'dashboard' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('training')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeView === 'training' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <GraduationCap size={18} /> Training
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-0">
                {activeView === 'training' ? (
                    <div className="h-full bg-slate-900/30 rounded-xl border border-slate-800 p-6 overflow-hidden">
                        <TrainingWizard />
                    </div>
                ) : (
                    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sidebar */}
                        <div className="md:col-span-1 border-r border-slate-800 pr-6 space-y-6 overflow-y-auto">
                            {/* Requests Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-slate-300 flex items-center gap-2">
                                    <FileText size={20} /> Requests
                                </h2>
                                <div className="space-y-2">
                                    {requests.length === 0 && (
                                        <div className="text-sm text-slate-500 italic p-2">No MD requests found.</div>
                                    )}
                                    {requests.map(req => (
                                        <div key={req} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <span className="text-sm font-mono truncate w-32" title={req}>{req}</span>
                                            <button
                                                onClick={() => handleImport(req)}
                                                disabled={importing === req}
                                                className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {importing === req ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                                                Import
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specs Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-slate-300 flex items-center gap-2">
                                    <Layers size={20} /> Specifications
                                </h2>
                                <SpecView onGenerate={handleGenerate} />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="md:col-span-2 bg-slate-900/30 rounded-xl p-6 border border-slate-800 flex items-center justify-center text-slate-500">
                            <div className="text-center max-w-md">
                                <Package size={48} className="mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-medium text-slate-300 mb-2">Workspace Ready</h3>
                                <p>Select a specification from the left to view details, or import a request to populate your project.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
