import React, { useState, useEffect } from 'react';
import { Play, Folder, Save } from 'lucide-react';

export default function FreeMode() {
    const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
    const [prompts, setPrompts] = useState({ default: "" });
    const [activePromptScope, setActivePromptScope] = useState("default"); // 'default' or 'checkpoint'

    // Missing states restored
    const [checkpoints, setCheckpoints] = useState([]);
    const [outputFolder, setOutputFolder] = useState("assets/free");
    const [outputName, setOutputName] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("lowres, bad anatomy, text, error...");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);

    useEffect(() => {
        fetchCheckpoints();
    }, []);

    const fetchCheckpoints = async () => {
        try {
            const res = await fetch('/api/checkpoints');
            const data = await res.json();
            setCheckpoints(data.checkpoints || []);
        } catch (e) {
            console.error("Failed to fetch checkpoints", e);
        }
    };

    const currentPromptValue = activePromptScope === 'default'
        ? prompts.default
        : (prompts[selectedCheckpoint] || "");

    const handlePromptChange = (val) => {
        setPrompts(prev => ({
            ...prev,
            [activePromptScope === 'default' ? 'default' : selectedCheckpoint]: val
        }));
    };

    const handleGenerate = async () => {
        if (!outputName) return;
        // Use default prompt if specific is empty, or just send what we have
        // Actually, backend logic: if specific exists, use it. else default.
        // So we just need to ensure we send the map.

        setGenerating(true);
        setError(null);
        setLastResult(null);

        const config = {
            path: outputFolder + "/" + outputName,
            output_folder: outputFolder,
            checkpoint: selectedCheckpoint,
            prompts: prompts,
            negative_prompt: negativePrompt,
        };

        // ... rest of generation logic

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();

            if (data.status === 'success') {
                setLastResult(data.path);
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
                Free Mode Generation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full overflow-y-auto">
                <div className="space-y-6">
                    {/* Checkpoint Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Checkpoint Model</label>
                        <select
                            value={selectedCheckpoint}
                            onChange={(e) => {
                                setSelectedCheckpoint(e.target.value);
                                // If we were editing a specific checkpoint that changed, switch scope or update?
                                // If scope was 'checkpoint', it now points to the new checkpoint's prompt
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            <option value="">-- Use Workflow Default --</option>
                            {checkpoints.map(cp => (
                                <option key={cp} value={cp}>{cp}</option>
                            ))}
                        </select>
                    </div>

                    {/* Controls */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-400">Positive Prompt</label>

                            {selectedCheckpoint && (
                                <div className="flex bg-slate-800 rounded-lg p-1 text-xs">
                                    <button
                                        onClick={() => setActivePromptScope('default')}
                                        className={`px-3 py-1 rounded transition-colors ${activePromptScope === 'default' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Default
                                    </button>
                                    <button
                                        onClick={() => setActivePromptScope('checkpoint')}
                                        className={`px-3 py-1 rounded transition-colors ${activePromptScope === 'checkpoint' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Specific
                                    </button>
                                </div>
                            )}
                        </div>

                        <textarea
                            value={currentPromptValue}
                            onChange={(e) => handlePromptChange(e.target.value)}
                            className={`w-full h-32 bg-slate-800 border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none ${activePromptScope === 'checkpoint' ? 'border-blue-500/50' : ''}`}
                            placeholder={activePromptScope === 'default' ? "Describe the asset..." : `Override prompt for ${selectedCheckpoint}...`}
                        />
                        {activePromptScope === 'checkpoint' && !currentPromptValue && prompts.default && (
                            <div className="text-xs text-slate-500 italic">
                                Falling back to Default: "{prompts.default.slice(0, 50)}..."
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">

                        <label className="text-sm font-medium text-slate-400">Negative Prompt</label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            className="w-full h-24 bg-slate-800 border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Output Folder</label>
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                                <Folder size={16} className="text-slate-500" />
                                <input
                                    type="text"
                                    value={outputFolder}
                                    onChange={(e) => setOutputFolder(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-slate-200 w-full"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Filename (no ext)</label>
                            <input
                                type="text"
                                value={outputName}
                                onChange={(e) => setOutputName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="my_asset_v1"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating || (!prompts.default && !currentPromptValue) || !outputName}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${generating
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-900/40 text-white'
                            }`}
                    >
                        {generating ? (
                            <>Generating...</>
                        ) : (
                            <><Play size={20} /> Generate Asset</>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm">
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="flex flex-col bg-slate-900 rounded-xl border border-slate-800 p-4 min-h-[400px]">
                    <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Result</h3>

                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/50">
                        {lastResult ? (
                            <div className="relative group w-full h-full flex items-center justify-center p-2">
                                <img
                                    src={`/api/image?path=${encodeURIComponent(lastResult)}&t=${Date.now()}`}
                                    alt="Generated Result"
                                    className="max-w-full max-h-full object-contain rounded shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="text-slate-600 flex flex-col items-center">
                                <Play size={48} className="mb-2 opacity-20" />
                                <span className="text-sm">Preview will appear here</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
