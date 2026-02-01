import React, { useState, useEffect } from 'react';
import { Folder, FileImage, Plus, RefreshCw, Play, CheckCircle, Circle, Square, CheckSquare, Zap, Loader } from 'lucide-react';

export default function SpecView({ onGenerate }) {
    const [specs, setSpecs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSpecs, setSelectedSpecs] = useState(new Set());
    const [checkpoints, setCheckpoints] = useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
    const [batchProgress, setBatchProgress] = useState(null);

    const fetchSpecs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/specs');
            const data = await res.json();
            setSpecs(data.specs || []);
        } catch (error) {
            console.error("Failed to fetch specs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCheckpoints = async () => {
        try {
            const res = await fetch('/api/checkpoints');
            const data = await res.json();
            setCheckpoints(data.checkpoints || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchSpecs();
        fetchCheckpoints();
    }, []);

    const toggleSelect = (id) => {
        const newSet = new Set(selectedSpecs);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedSpecs(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedSpecs.size === specs.length) {
            setSelectedSpecs(new Set());
        } else {
            setSelectedSpecs(new Set(specs.map(s => s.id)));
        }
    };

    const handleGenerate = (spec) => {
        if (onGenerate) {
            onGenerate(spec);
        }
    };

    const handleBatchGenerate = async () => {
        if (selectedSpecs.size === 0) return;

        const specsToRun = specs.filter(s => selectedSpecs.has(s.id));
        setBatchProgress({ current: 0, total: specsToRun.length, currentName: '' });

        for (let i = 0; i < specsToRun.length; i++) {
            const spec = specsToRun[i];
            setBatchProgress({ current: i + 1, total: specsToRun.length, currentName: spec.name });

            try {
                // Ensure output folder is cleaner? Default logic handles it.
                // We pass spec.params.prompts so the backend uses the correct checkpoint prompts.
                const payload = {
                    path: spec.path,
                    checkpoint: selectedCheckpoint || undefined,
                    prompts: spec.params?.prompts || {},
                };

                await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

            } catch (e) {
                console.error(`Failed ${spec.name}`, e);
            }
        }

        setBatchProgress(null);
        fetchSpecs();
        alert("Batch generation complete!");
        setSelectedSpecs(new Set());
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-300">Project Specs</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{specs.length}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Select All">
                        {specs.length > 0 && selectedSpecs.size === specs.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <button onClick={fetchSpecs} className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Refresh">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {specs.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        No specs defined.
                    </div>
                ) : (
                    specs.map(spec => (
                        <div key={spec.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors group border border-transparent ${selectedSpecs.has(spec.id) ? 'bg-blue-900/20 border-blue-900/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button onClick={() => toggleSelect(spec.id)} className="text-slate-500 hover:text-blue-400">
                                    {selectedSpecs.has(spec.id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                </button>

                                <div className="min-w-[18px]">
                                    {spec.status === 'generated' ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <Circle size={18} className="text-slate-600" />
                                    )}
                                </div>

                                <div className="truncate">
                                    <div className="font-medium text-slate-200 truncate" title={spec.name}>{spec.name}</div>
                                    <div className="text-xs text-slate-500 font-mono truncate" title={spec.path}>{spec.path}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleGenerate(spec)}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                title="Open in Free Mode"
                            >
                                <Play size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Batch Toolbar */}
            {selectedSpecs.size > 0 && (
                <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl animate-slide-up">
                    <div className="flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckSquare size={16} className="text-blue-400" />
                            <span>{selectedSpecs.size} selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedCheckpoint}
                                onChange={(e) => setSelectedCheckpoint(e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-[150px]"
                            >
                                <option value="">Default Checkpoint</option>
                                {checkpoints.map(cp => (
                                    <option key={cp} value={cp}>{cp.replace(".safetensors", "")}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleBatchGenerate}
                                disabled={!!batchProgress}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {batchProgress ? (
                                    <>
                                        <Loader size={14} className="animate-spin" />
                                        {batchProgress.current}/{batchProgress.total}
                                    </>
                                ) : (
                                    <>
                                        <Zap size={14} /> Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {batchProgress && (
                        <div className="mt-2 text-xs text-slate-400 truncate">
                            Generating: {batchProgress.currentName}...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
